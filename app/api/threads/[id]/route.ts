/**
 * /api/threads/[id]
 *   GET   - fetch one thread the user owns.
 *   PATCH - update watch settings { watchEnabled?, refreshCadenceHours? }.
 *
 * The PATCH is how the per-project "watching" toggle + cadence picker (72h /
 * 5d / weekly) persist. Auth required; thread must belong to the user.
 */
import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { threads } from '@/lib/db/schema';

export const runtime = 'nodejs';

const ALLOWED_CADENCE = [72, 120, 168];

async function requireUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return null;
  return session.user;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await ctx.params;
  const [row] = await db
    .select()
    .from(threads)
    .where(and(eq(threads.id, id), eq(threads.userId, user.id)))
    .limit(1);
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ thread: row });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await ctx.params;
  const [existing] = await db
    .select()
    .from(threads)
    .where(and(eq(threads.id, id), eq(threads.userId, user.id)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: { watchEnabled?: unknown; refreshCadenceHours?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const patch: { watchEnabled?: boolean; refreshCadenceHours?: number } = {};
  if (typeof body.watchEnabled === 'boolean') patch.watchEnabled = body.watchEnabled;
  if (typeof body.refreshCadenceHours === 'number' && ALLOWED_CADENCE.includes(body.refreshCadenceHours)) {
    patch.refreshCadenceHours = body.refreshCadenceHours;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'no_valid_fields' }, { status: 400 });
  }

  // Defense-in-depth: scope the UPDATE to the owner too, not just the id. The
  // ownership precondition above already 404s a foreign thread, but keeping the
  // userId on the write means a future refactor that drops the precondition
  // can never turn this into an IDOR.
  const [row] = await db
    .update(threads)
    .set(patch)
    .where(and(eq(threads.id, id), eq(threads.userId, user.id)))
    .returning();
  return NextResponse.json({ thread: row });
}

/**
 * /api/threads/[id]/memory  - the per-project "brain".
 *   GET  - read accumulated learnings (oldest first) so the client can feed
 *          them into the run context. Iteration N+1 builds on iteration N.
 *   POST - append one skill entry { did?, learned?, changed? } after a run.
 *
 * Auth required; thread must belong to the user. Stays BYOK-safe: the brain
 * lives here in the DB, the client passes it into the run context, the server
 * never needs the user's Anthropic key.
 */
import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projectMemory, threads } from '@/lib/db/schema';

export const runtime = 'nodejs';

async function requireUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return null;
  return session.user;
}

async function getOwnedThread(threadId: string, userId: string) {
  const [row] = await db
    .select()
    .from(threads)
    .where(and(eq(threads.id, threadId), eq(threads.userId, userId)))
    .limit(1);
  return row || null;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await ctx.params;
  const thread = await getOwnedThread(id, user.id);
  if (!thread) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const rows = await db
    .select()
    .from(projectMemory)
    .where(eq(projectMemory.threadId, id))
    .orderBy(asc(projectMemory.iteration), asc(projectMemory.createdAt))
    .limit(100);

  return NextResponse.json({ memory: rows });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await ctx.params;
  const thread = await getOwnedThread(id, user.id);
  if (!thread) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: { did?: unknown; learned?: unknown; changed?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const clip = (v: unknown) =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, 4000) : null;
  const did = clip(body.did);
  const learned = clip(body.learned);
  const changed = clip(body.changed);

  if (!did && !learned && !changed) {
    return NextResponse.json({ error: 'empty_entry' }, { status: 400 });
  }

  // Next iteration number = current max + 1.
  const [latest] = await db
    .select({ iteration: projectMemory.iteration })
    .from(projectMemory)
    .where(eq(projectMemory.threadId, id))
    .orderBy(desc(projectMemory.iteration))
    .limit(1);
  const iteration = (latest?.iteration ?? 0) + 1;

  const [row] = await db
    .insert(projectMemory)
    .values({ threadId: id, userId: user.id, iteration, did, learned, changed })
    .returning();

  return NextResponse.json({ memory: row, iteration }, { status: 201 });
}

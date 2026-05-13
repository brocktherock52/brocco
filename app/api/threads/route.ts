/**
 * /api/threads
 *   GET  - list current user's threads (most recent first)
 *   POST - create a new thread { title, agents: string[], isPublic?: boolean }
 *
 * Auth-required. Uses better-auth's getSession to resolve the user from
 * the session cookie.
 */
import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { threads } from '@/lib/db/schema';

export const runtime = 'nodejs';

async function requireUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return null;
  return session.user;
}

export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(threads)
    .where(eq(threads.userId, user.id))
    .orderBy(desc(threads.updatedAt))
    .limit(100);

  return NextResponse.json({ threads: rows });
}

export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const data = body as {
    title?: unknown;
    agents?: unknown;
    isPublic?: unknown;
  };

  const title = typeof data.title === 'string' && data.title.trim() ? data.title.trim().slice(0, 200) : null;
  const agents = Array.isArray(data.agents) ? (data.agents.filter((a) => typeof a === 'string') as string[]) : [];

  if (!title) {
    return NextResponse.json({ error: 'title_required' }, { status: 400 });
  }
  if (agents.length === 0) {
    return NextResponse.json({ error: 'agents_required' }, { status: 400 });
  }

  const isPublic = data.isPublic === true;

  const [row] = await db
    .insert(threads)
    .values({
      userId: user.id,
      title,
      agents,
      isPublic,
    })
    .returning();

  return NextResponse.json({ thread: row }, { status: 201 });
}

/**
 * /api/threads/[id]/messages
 *   GET  - list messages in a thread (auth required; thread must belong to user)
 *   POST - append a message { role, agent?, content, meta? }
 *
 * The thread's updatedAt is bumped on each append so /api/threads orders
 * by recent activity.
 */
import { NextRequest, NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { messages, threads } from '@/lib/db/schema';

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

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await ctx.params;
  const thread = await getOwnedThread(id, user.id);
  if (!thread) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.threadId, id))
    .orderBy(asc(messages.createdAt))
    .limit(500);

  return NextResponse.json({ messages: rows });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await ctx.params;
  const thread = await getOwnedThread(id, user.id);
  if (!thread) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const data = body as {
    role?: unknown;
    agent?: unknown;
    content?: unknown;
    meta?: unknown;
  };

  const role = typeof data.role === 'string' ? data.role : null;
  const content = typeof data.content === 'string' ? data.content : null;
  const agent = typeof data.agent === 'string' ? data.agent : null;
  const meta = data.meta && typeof data.meta === 'object' ? (data.meta as Record<string, unknown>) : null;

  if (!role || !['user', 'agent', 'system'].includes(role)) {
    return NextResponse.json({ error: 'invalid_role' }, { status: 400 });
  }
  if (!content || content.length === 0) {
    return NextResponse.json({ error: 'content_required' }, { status: 400 });
  }
  if (content.length > 100_000) {
    return NextResponse.json({ error: 'content_too_long' }, { status: 413 });
  }

  const [row] = await db
    .insert(messages)
    .values({
      threadId: id,
      role,
      agent,
      content,
      meta,
    })
    .returning();

  // bump thread updatedAt so the list-by-recent-activity ordering works
  await db
    .update(threads)
    .set({ updatedAt: new Date() })
    .where(eq(threads.id, id));

  return NextResponse.json({ message: row }, { status: 201 });
}

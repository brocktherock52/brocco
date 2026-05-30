/**
 * /api/threads/[id]/refresh
 *   POST { summary } - record that a client refresh just completed.
 *
 * Called by the client after it re-runs the project BYOK and generates the
 * "what changed since last run" summary. The server only persists state:
 *   - set threads.lastRefreshedAt + bump updatedAt (resets the cadence clock)
 *   - mark any prior unread 'refresh_due' alert read (the user acted on it)
 *   - file a 'changes_found' alert carrying the summary so it shows in the bell
 *
 * Auth required; thread must belong to the user.
 */
import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projectAlerts, threads } from '@/lib/db/schema';

export const runtime = 'nodejs';

async function requireUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return null;
  return session.user;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await ctx.params;

  const [thread] = await db
    .select()
    .from(threads)
    .where(and(eq(threads.id, id), eq(threads.userId, user.id)))
    .limit(1);
  if (!thread) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: { summary?: unknown; changed?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* allow empty body */
  }
  const summary =
    typeof body.summary === 'string' && body.summary.trim()
      ? body.summary.trim().slice(0, 4000)
      : null;
  const changed = body.changed === true;

  const now = new Date();
  await db
    .update(threads)
    .set({ lastRefreshedAt: now, lastCheckedAt: now, updatedAt: now })
    .where(eq(threads.id, id));

  // The user acted on the nudge: clear any pending refresh_due alert.
  await db
    .update(projectAlerts)
    .set({ status: 'read' })
    .where(
      and(
        eq(projectAlerts.threadId, id),
        eq(projectAlerts.kind, 'refresh_due'),
        eq(projectAlerts.status, 'unread'),
      ),
    );

  // Only file a changes_found alert when something actually changed and we
  // have a summary to show. An "up to date" refresh just resets the clock.
  let alert = null;
  if (changed && summary) {
    [alert] = await db
      .insert(projectAlerts)
      .values({ threadId: id, userId: user.id, kind: 'changes_found', summary })
      .returning();
  }

  return NextResponse.json({ ok: true, alert });
}

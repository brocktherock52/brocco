/**
 * /api/alerts
 *   GET - list the current user's alerts (unread first, most recent first).
 *
 * These are the "watching out for you" notifications surfaced in the dashboard
 * bell: 'refresh_due' (filed by the cron watcher) and 'changes_found' (filed
 * by a client refresh, carrying the "what changed" summary).
 *
 * Query: ?status=unread to filter to unread only (default returns all recent).
 */
import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projectAlerts, threads } from '@/lib/db/schema';

export const runtime = 'nodejs';

async function requireUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return null;
  return session.user;
}

export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const unreadOnly = req.nextUrl.searchParams.get('status') === 'unread';

  const where = unreadOnly
    ? and(eq(projectAlerts.userId, user.id), eq(projectAlerts.status, 'unread'))
    : eq(projectAlerts.userId, user.id);

  const rows = await db
    .select({
      id: projectAlerts.id,
      threadId: projectAlerts.threadId,
      kind: projectAlerts.kind,
      summary: projectAlerts.summary,
      status: projectAlerts.status,
      createdAt: projectAlerts.createdAt,
      threadTitle: threads.title,
    })
    .from(projectAlerts)
    .leftJoin(threads, eq(projectAlerts.threadId, threads.id))
    .where(where)
    .orderBy(desc(projectAlerts.createdAt))
    .limit(50);

  // unread first, then by recency (already sorted by recency above)
  rows.sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'unread' ? -1 : 1;
  });

  const unreadCount = rows.filter((r) => r.status === 'unread').length;

  return NextResponse.json({ alerts: rows, unreadCount });
}

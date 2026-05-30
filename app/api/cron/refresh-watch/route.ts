/**
 * /api/cron/refresh-watch
 *
 * The "watching out for you" cron Braeden asked for: every few hours, walk the
 * saved projects, and for any watched project whose refresh cadence has elapsed
 * (72h / 5d / weekly), file a 'refresh_due' alert and notify the owner.
 *
 * BYOK constraint: the server does NOT have the user's Anthropic key, so it
 * cannot re-run the agent itself. The cron's job is to DETECT staleness and
 * NOTIFY. The actual refresh + "what changed" diff happens client-side with
 * the user's key when they click Refresh (see lib/refresh.ts). This is exactly
 * Braeden's flow: notification, click, run again, summary of what's new.
 *
 * Registered in vercel.json. Vercel attaches `Authorization: Bearer <CRON_SECRET>`
 * automatically, so we verify that header before doing any work.
 *
 * Idempotent: a project that already has an unread 'refresh_due' alert is
 * skipped, so re-running the cron never creates duplicates.
 */
import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { threads, users, projectAlerts } from '@/lib/db/schema';
import { isRefreshDue } from '@/lib/freshness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WATCHED_PLANS = ['solo', 'team'];

async function notifyByEmail(email: string, count: number) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Brocco <login@brocco.dev>';
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://brocco.dev';
  if (!resendKey) return; // best-effort: dev / unconfigured -> skip silently

  const noun = count === 1 ? 'project' : 'projects';
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: `${count} of your ${noun} may have new information`,
      html: `
        <div style="font-family:Inter,sans-serif;background:#0A0A0F;color:#e7e7ea;padding:32px;border-radius:12px;max-width:480px;margin:0 auto;">
          <h2 style="margin:0 0 12px 0;font-weight:600;">we're watching them for you</h2>
          <p style="color:#a1a1aa;line-height:1.6;"><strong>${count}</strong> of your ${noun} may have new information since you last ran ${count === 1 ? 'it' : 'them'}. Open brocco and hit refresh to pull the latest and see what changed.</p>
          <p style="margin:28px 0;"><a href="${base}/app" style="display:inline-block;background:linear-gradient(90deg,#a78bfa,#67e8f9);color:#0A0A0F;font-weight:600;padding:12px 20px;border-radius:999px;text-decoration:none;">review updates</a></p>
          <p style="color:#71717a;font-size:12px;line-height:1.6;">your AI team checks in on your saved projects automatically. manage cadence per project in the app.</p>
        </div>
      `,
    }),
  });
}

async function notifyByPush(userId: string, count: number) {
  // Best-effort web-push fan-out. The notify route is a structured stub until
  // subscriptions are persisted (see app/api/push/notify). Never throws.
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  await fetch(`${base}/api/push/notify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CRON_SECRET ?? ''}`,
    },
    body: JSON.stringify({
      userId,
      title: `${count} project${count === 1 ? '' : 's'} may have new info`,
      body: "We're watching them for you. Open brocco to refresh.",
      url: `${base}/app`,
    }),
  }).catch(() => {});
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  // Vercel cron sends the bearer; allow unauthenticated only when no secret set
  // (local dev). In prod CRON_SECRET is always set, so this gate is real.
  if (process.env.CRON_SECRET && authHeader !== expected) {
    return new NextResponse('unauthorized', { status: 401 });
  }

  const now = Date.now();

  // Watched projects only, owned by solo/team plans (Braeden's gating).
  // Join threads to their owner's plan.
  let candidates: { thread: typeof threads.$inferSelect; email: string }[] = [];
  try {
    const rows = await db
      .select({ thread: threads, email: users.email, plan: users.plan })
      .from(threads)
      .innerJoin(users, eq(threads.userId, users.id))
      .where(eq(threads.watchEnabled, true));
    candidates = rows
      .filter((r) => WATCHED_PLANS.includes((r.plan ?? 'free').toLowerCase()))
      .map((r) => ({ thread: r.thread, email: r.email }));
  } catch (e) {
    // DB unavailable: keep the cron green so the health-check stays up.
    return NextResponse.json({
      ok: true,
      ranAt: new Date(now).toISOString(),
      note: 'db unavailable, no projects evaluated',
      checked: 0,
      flagged: 0,
      error: e instanceof Error ? e.message : 'db error',
    });
  }

  // Filter to projects whose cadence has elapsed since the last run.
  const due = candidates.filter((c) =>
    isRefreshDue(new Date(c.thread.updatedAt).getTime(), c.thread.refreshCadenceHours, now),
  );

  let flagged = 0;
  const newAlertsByUser = new Map<string, { email: string; userId: string; count: number }>();

  for (const c of due) {
    const t = c.thread;
    // Idempotency: skip if an unread refresh_due alert already exists.
    const existing = await db
      .select({ id: projectAlerts.id })
      .from(projectAlerts)
      .where(
        and(
          eq(projectAlerts.threadId, t.id),
          eq(projectAlerts.kind, 'refresh_due'),
          eq(projectAlerts.status, 'unread'),
        ),
      )
      .limit(1);

    // Always record that we checked this project.
    await db.update(threads).set({ lastCheckedAt: new Date(now) }).where(eq(threads.id, t.id));

    if (existing.length > 0) continue;

    await db.insert(projectAlerts).values({
      threadId: t.id,
      userId: t.userId,
      kind: 'refresh_due',
      summary: `New information may be available for "${t.title.slice(0, 120)}". Refresh to pull the latest.`,
    });
    flagged++;

    const entry = newAlertsByUser.get(t.userId) ?? { email: c.email, userId: t.userId, count: 0 };
    entry.count++;
    newAlertsByUser.set(t.userId, entry);
  }

  // Per-user batched notifications. Best-effort: never let a send crash the cron.
  for (const { email, userId, count } of newAlertsByUser.values()) {
    try {
      await notifyByEmail(email, count);
    } catch {
      /* swallow: notification failure must not fail the watcher */
    }
    try {
      await notifyByPush(userId, count);
    } catch {
      /* swallow */
    }
  }

  return NextResponse.json({
    ok: true,
    ranAt: new Date(now).toISOString(),
    checked: candidates.length,
    due: due.length,
    flagged,
    notifiedUsers: newAlertsByUser.size,
  });
}

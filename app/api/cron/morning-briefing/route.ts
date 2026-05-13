import { NextResponse } from 'next/server';

// Vercel Cron handler — fires every hour and emits a briefing row for
// any recurring run whose `nextRun` has elapsed.
//
// vercel.json registers this at `/api/cron/morning-briefing` on the
// schedule `0 * * * *` (top of every hour). Vercel adds the
// `Authorization: Bearer <CRON_SECRET>` header automatically so the
// route can verify it's coming from the cron runner.
//
// Today the route is a STUB: recurring runs live in localStorage on the
// client, so the server can't see them. When auth + KV ship:
//   1. read all recurring_run rows where nextRun <= now() AND enabled
//   2. for each row, dispatch a run via the simulator (demo mode) or
//      Claude (live mode) and write the result into a per-user briefing
//      queue keyed in KV
//   3. update nextRun + lastRun on the row
//   4. emit a web-push notification per user (see /api/push/notify)
//
// Until then this route returns a clean 200 with a structured payload so
// the Vercel cron health-check stays green and the wiring is verifiable
// end-to-end.

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (process.env.CRON_SECRET && auth !== expected) {
    return new NextResponse('unauthorized', { status: 401 });
  }

  const now = new Date();
  // TODO: read recurring runs from KV, dispatch, write briefing items.
  // For now: emit a heartbeat payload so the cron monitor + logs work.
  return NextResponse.json({
    ok: true,
    ranAt: now.toISOString(),
    note: 'briefing cron heartbeat. dispatcher lights up when KV is wired.',
    dispatched: 0,
    enqueued: 0,
  });
}

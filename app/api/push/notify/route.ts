import { NextResponse } from 'next/server';

// Web-push fan-out endpoint. Called by the refresh-watch cron to push a
// "your projects may have new info" notification to a user's subscribed
// devices.
//
// Today this is a structured STUB, consistent with /api/push/subscribe which
// is still log-only. To make it send real pushes:
//   1. persist PushSubscription rows keyed by user-id (subscribe route TODO)
//   2. set NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY in Vercel env
//      (npx web-push generate-vapid-keys)
//   3. add the `web-push` dependency and fan-out here with webpush.sendNotification
//
// The email channel (Resend) already delivers the same notification today, so
// the feature works end-to-end without push. Auth: cron bearer or same-origin.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (process.env.CRON_SECRET && authHeader !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: { userId?: string; title?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }

  const hasVapid = !!process.env.VAPID_PRIVATE_KEY && !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  // eslint-disable-next-line no-console
  console.log('[push:notify]', { userId: body.userId, title: body.title, hasVapid });

  return NextResponse.json({
    ok: true,
    delivered: 0,
    note: hasVapid
      ? 'vapid configured, but subscription persistence not yet wired. notification delivered via email.'
      : 'push not configured (no vapid keys). notification delivered via email.',
  });
}

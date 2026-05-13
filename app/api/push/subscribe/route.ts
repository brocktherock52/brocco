import { NextResponse } from 'next/server';

// Receive a PushSubscription JSON and store it. Today: log-only.
// When KV ships: SET user-id → subscription JSON in Vercel KV so the
// notify route can fan-out.
//
// Subscription shape: { endpoint, expirationTime, keys: { p256dh, auth } }

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.endpoint) {
      return NextResponse.json({ ok: false, error: 'missing endpoint' }, { status: 400 });
    }
    // TODO: persist to KV keyed by authenticated user-id
    console.log('[push:subscribe]', body.endpoint?.slice?.(0, 60) ?? 'unknown');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }
}

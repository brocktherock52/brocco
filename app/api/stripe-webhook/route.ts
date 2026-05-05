/* POST /api/stripe-webhook - Stripe webhook handler with HMAC-SHA256 signature verify
   using WebCrypto (Edge runtime compatible). No SDK dependency. */

export const runtime = 'edge';

async function verifySignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(sigHeader.split(',').map((s) => s.split('=')));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${payload}`));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
  created: number;
}

/** Fire a Meta Conversions API event server-side. Hashed email + ip + ua
 *  let Meta dedup with the browser-side fbq Subscribe event we fire on
 *  /billing/success. No-op if META_PIXEL_ID + META_CAPI_TOKEN are not set. */
async function metaCapi(eventName: string, payload: {
  email?: string | null;
  value?: number | null;
  currency?: string;
  transactionId?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
}): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return;

  async function sha256(input: string): Promise<string> {
    const buf = new TextEncoder().encode(input.trim().toLowerCase());
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  const userData: Record<string, unknown> = {};
  if (payload.email) userData.em = [await sha256(payload.email)];
  if (payload.clientIp) userData.client_ip_address = payload.clientIp;
  if (payload.userAgent) userData.client_user_agent = payload.userAgent;
  if (payload.fbp) userData.fbp = payload.fbp;
  if (payload.fbc) userData.fbc = payload.fbc;

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_id: payload.transactionId ?? undefined,
        user_data: userData,
        custom_data: {
          currency: payload.currency ?? 'USD',
          value: payload.value ?? undefined,
          content_name: 'brocco_paid',
          content_category: 'subscription',
        },
      },
    ],
  };

  try {
    await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
  } catch (e) {
    console.error('[stripe-webhook] capi error', e);
  }
}

async function handleEvent(event: StripeEvent): Promise<void> {
  const obj = event.data.object as Record<string, unknown>;
  const summary = {
    type: event.type,
    id: event.id,
    customer: obj.customer ?? null,
    subscription: obj.subscription ?? obj.id ?? null,
    status: obj.status ?? null,
    amount: obj.amount_paid ?? obj.amount_due ?? null,
    cancel_at_period_end: obj.cancel_at_period_end ?? null,
  };
  console.log('[stripe-webhook]', JSON.stringify(summary));

  // Fire CAPI Subscribe on a successful checkout completion.
  if (event.type === 'checkout.session.completed') {
    const email =
      (obj.customer_details as { email?: string } | undefined)?.email ??
      (typeof obj.customer_email === 'string' ? obj.customer_email : null);
    const amountTotal = typeof obj.amount_total === 'number' ? obj.amount_total / 100 : null;
    const transactionId = typeof obj.id === 'string' ? obj.id : null;
    await metaCapi('Subscribe', {
      email,
      value: amountTotal,
      currency: typeof obj.currency === 'string' ? obj.currency.toUpperCase() : 'USD',
      transactionId,
    });
  }
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response('webhook secret not configured', { status: 503 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('missing stripe-signature header', { status: 400 });

  const payload = await req.text();
  const ok = await verifySignature(payload, sig, secret);
  if (!ok) return new Response('invalid signature', { status: 400 });

  let event: StripeEvent;
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response('invalid json', { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (e) {
    console.error('[stripe-webhook] handler error', e);
    return new Response('handler error', { status: 500 });
  }
  return new Response('ok', { status: 200 });
}

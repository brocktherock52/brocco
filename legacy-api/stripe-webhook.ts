/* /api/stripe-webhook - Stripe webhook handler with HMAC-SHA256 signature verify
   using WebCrypto (Edge runtime compatible). No SDK dependency.

   Handled events: checkout.session.completed, customer.subscription.created,
   customer.subscription.updated, customer.subscription.deleted,
   invoice.paid, invoice.payment_failed.

   To register: in Stripe Dashboard, create a webhook endpoint pointing to
   https://brocco.ai/api/stripe-webhook subscribing to those events.
   Copy the signing secret into STRIPE_WEBHOOK_SECRET via `vercel env add`.

   For now this only logs events. Wire your DB (Supabase / Neon / KV)
   into handleEvent() to persist subscription state.
*/

export const config = { runtime: 'edge' };

async function verifySignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(sigHeader.split(',').map(s => s.split('=')));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  // Stripe signs `${t}.${payload}` with HMAC-SHA256 using the webhook secret.
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${payload}`));
  const expected = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  // constant-time compare
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

async function handleEvent(event: StripeEvent): Promise<void> {
  // TODO: persist to DB (Supabase / Neon / KV). For v1 we just log.
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
  // wire here:
  // - checkout.session.completed: upsert user.stripeCustomerId, mark plan active
  // - customer.subscription.updated: sync status (active / past_due / canceled)
  // - invoice.payment_failed: mark past_due, send dunning email
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response('webhook secret not configured', { status: 503 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('missing stripe-signature header', { status: 400 });

  const payload = await req.text();
  const ok = await verifySignature(payload, sig, secret);
  if (!ok) return new Response('invalid signature', { status: 400 });

  let event: StripeEvent;
  try { event = JSON.parse(payload); } catch { return new Response('invalid json', { status: 400 }); }

  try {
    await handleEvent(event);
  } catch (e) {
    console.error('[stripe-webhook] handler error', e);
    return new Response('handler error', { status: 500 });
  }
  return new Response('ok', { status: 200 });
}

/* POST /api/stripe-webhook - Stripe webhook handler with HMAC-SHA256 signature
   verify (constant-time) + replay-attack protection (timestamp tolerance) +
   idempotency scaffold + full subscription lifecycle.
   Edge runtime, no Stripe SDK. */

export const runtime = 'edge';

const MAX_AGE_SECONDS = 300; // 5 minutes — Stripe official recommendation

async function verifySignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<{ ok: boolean; reason?: string }> {
  // Stripe sigs look like: t=1499099847,v1=hex...,v0=hex...
  const parts: Record<string, string> = {};
  for (const seg of sigHeader.split(',')) {
    const [k, v] = seg.split('=');
    if (k && v !== undefined) parts[k.trim()] = v.trim();
  }
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return { ok: false, reason: 'missing t or v1 in stripe-signature' };

  // Reject events outside the tolerance window (replay protection).
  const tsNum = Number(t);
  if (!Number.isFinite(tsNum)) return { ok: false, reason: 'invalid timestamp' };
  const ageSeconds = Math.abs(Date.now() / 1000 - tsNum);
  if (ageSeconds > MAX_AGE_SECONDS) {
    return { ok: false, reason: `event too old (${Math.floor(ageSeconds)}s, max ${MAX_AGE_SECONDS}s)` };
  }

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${payload}`));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (expected.length !== v1.length) return { ok: false, reason: 'signature length mismatch' };
  // Constant-time compare.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0 ? { ok: true } : { ok: false, reason: 'signature mismatch' };
}

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
  created: number;
}

/* -----------------------------------------------------------------------
   Idempotency scaffold.
   TODO(brocco-persistence): replace this in-memory Set with Vercel KV
   or Upstash Redis with TTL = 7d (Stripe retries for ~3d).
   Today, this is best-effort — a cold-started Edge function will not
   share state across regions and retries may double-fire CAPI.
   ----------------------------------------------------------------------- */
const SEEN_EVENT_IDS = new Set<string>();
const SEEN_MAX = 1000;
function rememberEvent(id: string): boolean {
  if (SEEN_EVENT_IDS.has(id)) return false;
  if (SEEN_EVENT_IDS.size >= SEEN_MAX) {
    // Evict the oldest 100 ids (Set preserves insertion order).
    const it = SEEN_EVENT_IDS.values();
    for (let i = 0; i < 100; i++) {
      const next = it.next();
      if (next.done) break;
      SEEN_EVENT_IDS.delete(next.value);
    }
  }
  SEEN_EVENT_IDS.add(id);
  return true;
}

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
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    );
  } catch (e) {
    console.error('[stripe-webhook] capi error', e);
  }
}

/* -----------------------------------------------------------------------
   Event handler — branches on event.type, persists full event for audit.
   TODO(brocco-persistence): write the full `event` object to KV under
   `event:${event.id}` (TTL 7d). Today: console.log only.
   ----------------------------------------------------------------------- */
async function handleEvent(event: StripeEvent): Promise<void> {
  const obj = event.data.object as Record<string, unknown>;
  // Persistence placeholder — log the entire event, not just a summary,
  // so a future migration to a real store can replay history.
  console.log('[stripe-webhook]', JSON.stringify({ id: event.id, type: event.type, data: event.data }));

  switch (event.type) {
    case 'checkout.session.completed': {
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
      // TODO(brocco-persistence): upsert customer row, mark active.
      break;
    }
    case 'invoice.payment_succeeded': {
      // Renewal payment. Extend the subscription period in the customer record.
      // TODO(brocco-persistence): update customer's current_period_end.
      console.log('[stripe-webhook] renewal payment', { customer: obj.customer, amount: obj.amount_paid });
      break;
    }
    case 'invoice.payment_failed': {
      // Payment failed. Customer is in dunning. Mark account as past_due.
      // TODO(brocco-persistence): set status = past_due. Email the customer.
      console.warn('[stripe-webhook] payment failed', { customer: obj.customer, attempt: obj.attempt_count });
      break;
    }
    case 'customer.subscription.updated': {
      // Plan change (upgrade/downgrade) or cancel_at_period_end toggle.
      // TODO(brocco-persistence): update plan tier + cancel_at_period_end on customer row.
      console.log('[stripe-webhook] subscription updated', {
        customer: obj.customer,
        status: obj.status,
        cancel_at_period_end: obj.cancel_at_period_end,
      });
      break;
    }
    case 'customer.subscription.deleted': {
      // Subscription canceled or expired. Revoke access.
      // TODO(brocco-persistence): set status = canceled. Move user back to free tier.
      console.log('[stripe-webhook] subscription deleted', { customer: obj.customer });
      break;
    }
    case 'customer.subscription.created': {
      // New subscription. Often paired with checkout.session.completed.
      // TODO(brocco-persistence): ensure customer row exists with correct plan.
      console.log('[stripe-webhook] subscription created', {
        customer: obj.customer,
        items: (obj.items as { data?: unknown[] } | undefined)?.data?.length,
      });
      break;
    }
    default:
      // Unknown event type — log and acknowledge so Stripe doesn't retry.
      console.log('[stripe-webhook] unhandled type', event.type);
  }
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response('webhook secret not configured', { status: 503 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('missing stripe-signature header', { status: 400 });

  const payload = await req.text();
  const verifyResult = await verifySignature(payload, sig, secret);
  if (!verifyResult.ok) {
    console.warn('[stripe-webhook] verify failed', verifyResult.reason);
    return new Response(`invalid signature: ${verifyResult.reason}`, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response('invalid json', { status: 400 });
  }

  // Idempotency: skip if we've already processed this event.id.
  // Returning 200 (not an error) so Stripe stops retrying.
  if (!rememberEvent(event.id)) {
    console.log('[stripe-webhook] duplicate event ignored', event.id);
    return new Response('ok (duplicate)', { status: 200 });
  }

  try {
    await handleEvent(event);
  } catch (e) {
    console.error('[stripe-webhook] handler error', e);
    // Returning 500 will cause Stripe to retry. That's intentional —
    // if our handler crashed, we want the chance to process again.
    return new Response('handler error', { status: 500 });
  }
  return new Response('ok', { status: 200 });
}

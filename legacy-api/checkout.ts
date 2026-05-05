/* /api/checkout - Stripe Checkout Session creator (Vercel Edge).
   POST body: { tier: 'solo'|'team', interval: 'monthly'|'annual', email?: string }
   Returns: { url: stripeCheckoutUrl } or graceful 503 if Stripe not configured.

   Required env (set via `vercel env add ... production`):
     STRIPE_API_KEY                  sk_live_... or sk_test_...
     STRIPE_PRICE_SOLO_MONTHLY       price_...
     STRIPE_PRICE_SOLO_ANNUAL        price_...
     STRIPE_PRICE_TEAM_MONTHLY       price_...
     STRIPE_PRICE_TEAM_ANNUAL        price_...
     APP_URL                         https://brocco.ai (or vercel preview)
*/

export const config = { runtime: 'edge' };

const STRIPE_API = 'https://api.stripe.com/v1';

function priceId(tier: string, interval: string): string | null {
  const key = `STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`;
  return process.env[key] || null;
}

async function createCheckoutSession(params: {
  apiKey: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  email?: string;
  clientReferenceId?: string;
}): Promise<{ url: string } | { error: string; status: number }> {
  // Stripe wants form-encoded; build a flat key=value map.
  const form = new URLSearchParams();
  form.set('mode', 'subscription');
  form.set('line_items[0][price]', params.priceId);
  form.set('line_items[0][quantity]', '1');
  form.set('success_url', params.successUrl);
  form.set('cancel_url', params.cancelUrl);
  form.set('allow_promotion_codes', 'true');
  form.set('billing_address_collection', 'auto');
  if (params.email) form.set('customer_email', params.email);
  if (params.clientReferenceId) form.set('client_reference_id', params.clientReferenceId);

  const resp = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    return { error: `stripe ${resp.status}: ${txt.slice(0, 400)}`, status: resp.status };
  }
  const data = await resp.json() as { url?: string };
  if (!data.url) return { error: 'stripe returned no url', status: 500 };
  return { url: data.url };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const apiKey = process.env.STRIPE_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error: 'checkout offline',
        detail: 'STRIPE_API_KEY not configured. Email hello@brocco.ai to start a paid plan, or add the key in Vercel env to enable self-serve checkout.',
      },
      { status: 503 },
    );
  }

  let body: { tier?: unknown; interval?: unknown; email?: unknown };
  try { body = await req.json(); } catch { return Response.json({ error: 'invalid json' }, { status: 400 }); }

  const tier = String(body.tier || '').toLowerCase();
  const interval = String(body.interval || 'monthly').toLowerCase();
  const email = typeof body.email === 'string' ? body.email : undefined;

  if (!['solo', 'team'].includes(tier)) {
    return Response.json({ error: 'tier must be solo or team' }, { status: 400 });
  }
  if (!['monthly', 'annual'].includes(interval)) {
    return Response.json({ error: 'interval must be monthly or annual' }, { status: 400 });
  }

  const price = priceId(tier, interval);
  if (!price) {
    return Response.json(
      { error: 'price not configured', detail: `Set env STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}` },
      { status: 503 },
    );
  }

  const appUrl = process.env.APP_URL || `https://${req.headers.get('host')}`;
  const result = await createCheckoutSession({
    apiKey,
    priceId: price,
    email,
    successUrl: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${appUrl}/#pricing`,
  });

  if ('error' in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json({ url: result.url });
}

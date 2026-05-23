/* POST /api/checkout - Stripe Checkout Session creator (Edge).
   Body: { tier: 'solo' | 'team', interval: 'monthly' | 'annual', email?: string } */

export const runtime = 'edge';

const STRIPE_API = 'https://api.stripe.com/v1';

function priceId(tier: string, interval: string): string | null {
  const key = `STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`;
  return process.env[key] || null;
}

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.STRIPE_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error: 'checkout offline',
        detail:
          'STRIPE_API_KEY not configured. Email help@brocco.dev to start a paid plan, or set the env to enable self-serve checkout.',
      },
      { status: 503 },
    );
  }

  let body: { tier?: unknown; interval?: unknown; email?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }

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
      {
        error: 'price not configured',
        detail: `Set env STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`,
      },
      { status: 503 },
    );
  }

  const appUrl = process.env.APP_URL || `https://${req.headers.get('host')}`;
  const form = new URLSearchParams();
  form.set('mode', 'subscription');
  form.set('line_items[0][price]', price);
  form.set('line_items[0][quantity]', '1');
  form.set('success_url', `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`);
  form.set('cancel_url', `${appUrl}/pricing`);
  form.set('allow_promotion_codes', 'true');
  form.set('billing_address_collection', 'auto');
  if (email) form.set('customer_email', email);

  // 7-day free trial on every checkout. Without this Stripe charges
  // immediately even though the UI promises a trial. `cancel` end-behavior
  // means if the user doesn't add a payment method during the trial, the
  // subscription auto-cancels rather than failing the first invoice.
  // (User can still subscribe today by adding a card in Checkout.)
  const trialDays = Number(process.env.STRIPE_TRIAL_DAYS || 7);
  if (trialDays > 0) {
    form.set('subscription_data[trial_period_days]', String(trialDays));
    form.set('subscription_data[trial_settings][end_behavior][missing_payment_method]', 'cancel');
    // Stripe requires a payment method during checkout for trials unless we
    // explicitly opt out. We REQUIRE one so the conversion at trial end is
    // automatic (no card update friction).
    form.set('payment_method_collection', 'always');
  }

  const resp = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    return Response.json({ error: `stripe ${resp.status}: ${txt.slice(0, 400)}` }, { status: resp.status });
  }
  const data = (await resp.json()) as { url?: string };
  if (!data.url) return Response.json({ error: 'stripe returned no url' }, { status: 500 });
  return Response.json({ url: data.url });
}

import { createHmac, randomUUID } from 'node:crypto';

// Guest trials rely on checkout completion to cancel unclaimed subscriptions.
// Check the existing live webhook before a production build can be promoted.
// Credentials stay inside Vercel; no customer or payment data is requested.
if (process.env.VERCEL_ENV === 'production') {
  const key = process.env.STRIPE_API_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) throw new Error('Production Stripe API and webhook credentials are required.');
  const origin = new URL(process.env.APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://brocco.dev').origin;
  const webhookUrl = `${origin}/api/stripe-webhook`;
  let cursor = '';
  let configured = false;
  const candidates = [];
  for (let page = 0; page < 20; page++) {
    const response = await fetch(`https://api.stripe.com/v1/webhook_endpoints?limit=100${cursor ? `&starting_after=${encodeURIComponent(cursor)}` : ''}`, {
      headers: { Authorization: `Bearer ${key}`, 'Stripe-Version': '2025-04-30.basil' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Cannot verify production Stripe webhook configuration (HTTP ${response.status}).`);
    const endpoints = await response.json();
    for (const endpoint of endpoints.data) {
      try {
        const url = new URL(endpoint.url);
        if (url.hostname === new URL(origin).hostname || url.hostname.endsWith('.brocco.dev')) {
          candidates.push({ destination: `${url.origin}${url.pathname}`, status: endpoint.status, checkoutCompleted: endpoint.enabled_events.includes('*') || endpoint.enabled_events.includes('checkout.session.completed') });
        }
      } catch { /* Do not print arbitrary endpoint content or credentials. */ }
    }
    configured ||= endpoints.data.some((endpoint) => endpoint.url === webhookUrl && endpoint.status === 'enabled' &&
      (endpoint.enabled_events.includes('*') || endpoint.enabled_events.includes('checkout.session.completed')));
    if (configured || !endpoints.has_more) break;
    cursor = endpoints.data.at(-1)?.id || '';
    if (!cursor) break;
  }
  if (!configured) {
    console.log('Brocco webhook candidates:', JSON.stringify(candidates));
    throw new Error('Enable checkout.session.completed on the production Brocco Stripe webhook before deploying guest trials.');
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ id: `evt_brocco_preflight_${randomUUID()}`, type: 'brocco.preflight', created: timestamp, data: { object: {} } });
  const signature = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  const probe = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${timestamp},v1=${signature}` },
    body: payload,
    signal: AbortSignal.timeout(15_000),
  });
  if (!probe.ok) throw new Error(`Production Stripe webhook signature/availability check failed (HTTP ${probe.status}).`);
  console.log('Production Stripe checkout webhook is enabled and accepts the configured signing secret.');
}

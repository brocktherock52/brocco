/* /api/portal - Stripe Customer Portal session.
   POST body: { customer_id: string }
   Returns: { url: portalUrl }

   In production, look up customer_id from your DB based on the authed user.
   This stub trusts the caller (fine for an internal admin tool, replace
   with auth before exposing publicly).
*/

export const config = { runtime: 'edge' };

const STRIPE_API = 'https://api.stripe.com/v1';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const apiKey = process.env.STRIPE_API_KEY;
  if (!apiKey) return Response.json({ error: 'STRIPE_API_KEY not configured' }, { status: 503 });

  let body: { customer_id?: unknown };
  try { body = await req.json(); } catch { return Response.json({ error: 'invalid json' }, { status: 400 }); }
  const customer = String(body.customer_id || '');
  if (!customer.startsWith('cus_')) return Response.json({ error: 'customer_id required' }, { status: 400 });

  const appUrl = process.env.APP_URL || `https://${req.headers.get('host')}`;
  const form = new URLSearchParams();
  form.set('customer', customer);
  form.set('return_url', `${appUrl}/account`);

  const resp = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });
  if (!resp.ok) {
    return Response.json({ error: `stripe ${resp.status}: ${(await resp.text()).slice(0, 300)}` }, { status: resp.status });
  }
  const data = await resp.json() as { url?: string };
  return Response.json({ url: data.url });
}

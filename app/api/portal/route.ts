/* POST /api/portal - Stripe Customer Portal session. Body: { customer_id }

   SECURITY: auth-gated. An anonymous caller must NOT be able to open a billing
   portal for an arbitrary customer id (that would be an IDOR letting anyone
   manage someone else's subscription). We require a valid session here. When the
   user<->stripe-customer mapping is persisted, also verify the requested
   customer belongs to the session user (see TODO below). */

export const runtime = 'nodejs';

import { auth } from '@/lib/auth';

const STRIPE_API = 'https://api.stripe.com/v1';

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.STRIPE_API_KEY;
  if (!apiKey) return Response.json({ error: 'STRIPE_API_KEY not configured' }, { status: 503 });

  // Require an authenticated session. Closes the anonymous IDOR.
  let session: Awaited<ReturnType<typeof auth.api.getSession>> = null;
  try {
    session = await auth.api.getSession({ headers: req.headers });
  } catch {
    session = null;
  }
  if (!session?.user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { customer_id?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  let customer = String(body.customer_id || '');
  // When the caller doesn't pass a customer id (the normal case from /account),
  // resolve it from the signed-in user's email via Stripe. Avoids needing a
  // stored user<->customer mapping. Because we look up by the SESSION email (not
  // a client-supplied value), this can't open someone else's billing portal.
  if (!customer.startsWith('cus_')) {
    const email = session.user.email;
    if (email) {
      const lookup = await fetch(
        `${STRIPE_API}/customers?email=${encodeURIComponent(email)}&limit=1`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
      );
      if (lookup.ok) {
        const d = (await lookup.json()) as { data?: { id?: string }[] };
        customer = d.data?.[0]?.id || '';
      }
    }
  }
  if (!customer.startsWith('cus_')) {
    return Response.json(
      {
        error: 'no_billing_account',
        detail: 'No Stripe billing account is linked to your email yet. Start a plan first.',
      },
      { status: 404 },
    );
  }

  const appUrl = process.env.APP_URL || `https://${req.headers.get('host')}`;
  const form = new URLSearchParams();
  form.set('customer', customer);
  form.set('return_url', `${appUrl}/account`);

  const resp = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });
  if (!resp.ok) {
    return Response.json(
      { error: `stripe ${resp.status}: ${(await resp.text()).slice(0, 300)}` },
      { status: resp.status },
    );
  }
  const data = (await resp.json()) as { url?: string };
  return Response.json({ url: data.url });
}

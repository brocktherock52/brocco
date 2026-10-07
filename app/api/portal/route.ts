import { auth } from '@/lib/auth';
import { bestSubscription, billingErrorResponse, bindCustomer, ownedSubscriptions, publicAppUrl, sameOrigin, stripeRequest } from '@/lib/billing';

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  if (!sameOrigin(req)) return Response.json({ error: 'invalid_origin' }, { status: 403 });
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return Response.json({ error: 'unauthenticated' }, { status: 401 });
    // Ignore client-supplied customer IDs; resolve only owned customers.
    const { customers, subscriptions } = await ownedSubscriptions(session.user);
    const subscription = bestSubscription(subscriptions);
    const customer = subscription
      ? typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
      : customers[0]?.id;
    if (!customer) return Response.json({ error: 'no_billing_account', detail: 'Start your trial before managing billing.' }, { status: 404 });
    const owned = customers.find((item) => item.id === customer);
    if (owned) await bindCustomer(owned, session.user);
    const portal = await stripeRequest<{ url: string }>('/billing_portal/sessions', new URLSearchParams({ customer, return_url: `${publicAppUrl(req)}/account` }));
    return Response.json({ url: portal.url }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return billingErrorResponse(error); }
}

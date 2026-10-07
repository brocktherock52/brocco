import { auth } from '@/lib/auth';
import { accessForSubscription, bestSubscription, billingErrorResponse, bindCustomer, ownedSubscriptions, publicAppUrl, sameOrigin, stripeRequest, type StripeCheckout, type StripeCustomer } from '@/lib/billing';

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  if (!sameOrigin(req)) return Response.json({ error: 'invalid_origin' }, { status: 403 });
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return Response.json({ error: 'unauthenticated', detail: 'Create your account before starting a trial.' }, { status: 401 });
    let body: { tier?: unknown; interval?: unknown };
    try { body = await req.json(); } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }); }
    const tier = String(body.tier || 'solo').toLowerCase();
    const interval = tier === 'wholesaler' ? 'monthly' : String(body.interval || 'monthly').toLowerCase();
    if (!['solo', 'team', 'wholesaler'].includes(tier) || !['monthly', 'annual'].includes(interval)) {
      return Response.json({ error: 'invalid_plan' }, { status: 400 });
    }
    const price = process.env[`STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`];
    if (!price) return Response.json({ error: 'plan_unavailable', detail: 'This plan is temporarily unavailable. Please try again later.' }, { status: 503 });
    const { customers, subscriptions } = await ownedSubscriptions(session.user);
    for (const customer of customers) await bindCustomer(customer, session.user);
    const existing = bestSubscription(subscriptions.filter((sub) => !['canceled', 'incomplete_expired'].includes(sub.status)));
    if (existing) {
      return Response.json({ url: `${publicAppUrl(req)}/app`, existingSubscription: true, access: accessForSubscription(existing) }, { headers: { 'Cache-Control': 'no-store' } });
    }
    let customer = customers[0];
    if (!customer) {
      customer = await stripeRequest<StripeCustomer>('/customers', new URLSearchParams({
        email: session.user.email, 'metadata[brocco_user_id]': session.user.id,
      }), `brocco-customer-${session.user.id}`);
    }
    const history = await stripeRequest<{ data: StripeCheckout[] }>(`/checkout/sessions?customer=${encodeURIComponent(customer.id)}&limit=100`);
    const ownedHistory = history.data.filter((checkout) => checkout.mode === 'subscription' && checkout.client_reference_id === session.user.id);
    const ownedOpen = ownedHistory.filter((checkout) => checkout.status === 'open');
    const reusable = ownedOpen.find((checkout) => checkout.metadata?.tier === tier && checkout.metadata?.interval === interval && checkout.url);
    if (reusable) return Response.json({ url: reusable.url }, { headers: { 'Cache-Control': 'no-store' } });
    // The user's explicit plan choice replaces their unfinished checkout.
    // Expire it first so another open tab cannot buy the old plan as well.
    for (const previous of ownedOpen) {
      await stripeRequest(`/checkout/sessions/${encodeURIComponent(previous.id)}/expire`, new URLSearchParams(), `brocco-expire-${previous.id}`);
    }

    const appUrl = publicAppUrl(req);
    const form = new URLSearchParams({
      mode: 'subscription', customer: customer.id, client_reference_id: session.user.id,
      'line_items[0][price]': price, 'line_items[0][quantity]': '1',
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/start`, allow_promotion_codes: 'true', billing_address_collection: 'auto',
      payment_method_collection: 'always', 'payment_method_types[0]': 'card',
      'subscription_data[trial_period_days]': '7',
      'subscription_data[trial_settings][end_behavior][missing_payment_method]': 'cancel',
      'metadata[brocco_user_id]': session.user.id, 'metadata[tier]': tier, 'metadata[interval]': interval,
      'subscription_data[metadata][brocco_user_id]': session.user.id,
      'subscription_data[metadata][preview_only_trial]': 'true',
      'custom_text[submit][message]': 'Your 7-day trial includes dashboard preview only. Tools unlock after payment. You can end your trial and pay early, or your subscription starts billing when the trial ends. Cancel before then to avoid a charge.',
    });
    const checkout = await stripeRequest<StripeCheckout>('/checkout/sessions', form,
      // Concurrent requests with different plan choices share a key and fail
      // closed instead of creating two subscriptions. A new checkout gets a
      // new generation only after the prior session is observed in Stripe.
      `brocco-checkout-${session.user.id}-${ownedHistory[0]?.id || 'first'}`);
    if (!checkout.url) return Response.json({ error: 'checkout_unavailable' }, { status: 503 });
    return Response.json({ url: checkout.url }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return billingErrorResponse(error); }
}

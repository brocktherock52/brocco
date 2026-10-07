import { auth } from '@/lib/auth';
import { POST as signedInCheckout } from '../route';
import { BillingError, billingErrorResponse, publicAppUrl, sameOrigin, stripeRequest, type StripeCheckout, type StripeCustomer } from '@/lib/billing';
import { checkoutIntentResponse, prepareCheckoutIntent, readCheckoutIntent } from '@/lib/checkout-intent';

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  if (!sameOrigin(req)) return Response.json({ error: 'invalid_origin' }, { status: 403 });
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (session?.user) return signedInCheckout(req);
    let body: { tier?: unknown; interval?: unknown };
    try { body = await req.json(); } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }); }
    const tier = String(body.tier || 'solo').toLowerCase();
    const interval = tier === 'wholesaler' ? 'monthly' : String(body.interval || 'monthly').toLowerCase();
    if (!['solo', 'team', 'wholesaler'].includes(tier) || !['monthly', 'annual'].includes(interval)) return Response.json({ error: 'invalid_plan' }, { status: 400 });
    const price = process.env[`STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`];
    if (!price) return Response.json({ error: 'plan_unavailable', detail: 'This plan is temporarily unavailable. Please try again later.' }, { status: 503 });
    const intent = readCheckoutIntent(req);
    if (!intent) return prepareCheckoutIntent(req);
    let customer: StripeCustomer;
    if (intent.customerId) {
      customer = await stripeRequest<StripeCustomer>(`/customers/${encodeURIComponent(intent.customerId)}`);
    } else {
      // Search also recovers an interrupted response after Stripe's 24-hour
      // idempotency retention. The signed cookie stores the stable ID once known.
      const query = `metadata['brocco_checkout_intent']:'${intent.id}'`;
      const prior = await stripeRequest<{ data: StripeCustomer[]; has_more?: boolean }>(`/customers/search?query=${encodeURIComponent(query)}&limit=100`);
      if (prior.has_more || prior.data.length > 1) throw new BillingError('checkout_conflict', 'Please contact help@brocco.dev to review your checkout.', 409);
      customer = prior.data[0] || await stripeRequest<StripeCustomer>('/customers', new URLSearchParams({
        'metadata[brocco_guest_checkout]': 'true', 'metadata[brocco_checkout_intent]': intent.id,
      }), `brocco-guest-customer-${intent.id}`);
    }
    if (customer.deleted || customer.metadata?.brocco_checkout_intent !== intent.id) throw new BillingError('checkout_conflict', 'Please sign in to manage your existing checkout.', 409);
    const respond = (body: unknown) => checkoutIntentResponse(req, { ...intent, customerId: customer.id }, body);
    const history = await stripeRequest<{ data: StripeCheckout[]; has_more?: boolean }>(`/checkout/sessions?customer=${encodeURIComponent(customer.id)}&limit=100`);
    if (history.has_more) return Response.json({ error: 'checkout_limit', detail: 'Please contact help@brocco.dev to review your checkout.' }, { status: 409 });
    const own = history.data.filter((checkout) => checkout.mode === 'subscription' && checkout.metadata?.brocco_checkout_intent === intent.id);
    const completed = own.find((checkout) => checkout.status === 'complete');
    const base = publicAppUrl(req);
    if (completed) return respond({ url: `${base}/billing/success?session_id=${encodeURIComponent(completed.id)}` });
    const open = own.filter((checkout) => checkout.status === 'open');
    const reusable = open.find((checkout) => checkout.metadata?.tier === tier && checkout.metadata?.interval === interval && checkout.url);
    if (reusable) return respond({ url: reusable.url });
    for (const checkout of open) await stripeRequest(`/checkout/sessions/${encodeURIComponent(checkout.id)}/expire`, new URLSearchParams(), `brocco-expire-${checkout.id}`);
    const ownKeyNotice = process.env.ANTHROPIC_API_KEY ? '' : ' Paid tool use currently requires your own Anthropic or xAI API key; provider charges are separate.';
    const checkout = await stripeRequest<StripeCheckout>('/checkout/sessions', new URLSearchParams({
      mode: 'subscription', customer: customer.id,
      'line_items[0][price]': price, 'line_items[0][quantity]': '1',
      success_url: `${base}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`, allow_promotion_codes: 'true', billing_address_collection: 'auto',
      payment_method_collection: 'always', 'payment_method_types[0]': 'card',
      'subscription_data[trial_period_days]': '7',
      'subscription_data[trial_settings][end_behavior][missing_payment_method]': 'cancel',
      'metadata[brocco_guest_checkout]': 'true', 'metadata[brocco_checkout_intent]': intent.id,
      'metadata[tier]': tier, 'metadata[interval]': interval,
      'subscription_data[metadata][brocco_guest_checkout]': 'true',
      'subscription_data[metadata][brocco_checkout_intent]': intent.id,
      'subscription_data[metadata][preview_only_trial]': 'true',
      'custom_text[submit][message]': `7-day dashboard preview only; tools unlock after payment. After checkout, verify the same email to connect your Brocco account. Once connected, billing starts after 7 days unless you cancel; you may choose to pay early. Unconnected trials are scheduled to cancel at trial end.${ownKeyNotice}`,
    }), `brocco-guest-checkout-${intent.id}-${own[0]?.id || 'first'}`);
    if (!checkout.url) return Response.json({ error: 'checkout_unavailable' }, { status: 503 });
    return respond({ url: checkout.url });
  } catch (error) { return billingErrorResponse(error); }
}

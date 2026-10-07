import { BillingError, bestSubscription, bindCustomer, ownedSubscriptions, planForSubscription, stripeRequest, type BillingUser, type StripeCheckout, type StripeCustomer, type StripeSubscription } from './billing';
import { reserveTrialClaim } from './billing-trial-claims';

const customerIdFor = (subscription: StripeSubscription) => typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

export async function checkoutSubscription(checkout: StripeCheckout): Promise<StripeSubscription | null> {
  const id = typeof checkout.subscription === 'string' ? checkout.subscription : checkout.subscription?.id;
  if (!id) return null;
  const subscription = await stripeRequest<StripeSubscription>(`/subscriptions/${encodeURIComponent(id)}?expand[]=latest_invoice`);
  return planForSubscription(subscription) ? subscription : null;
}

/** Called from current Stripe state by both the verified webhook and claim.
 * Claim awaits this same idempotent mutation before removing cancellation;
 * concurrent webhook delivery cannot schedule it again after the claim. */
export async function protectUnclaimedTrial(subscription: StripeSubscription): Promise<void> {
  if (subscription.status !== 'trialing' || subscription.metadata?.brocco_guest_checkout !== 'true' || subscription.metadata?.brocco_user_id) return;
  const customer = await stripeRequest<StripeCustomer>(`/customers/${encodeURIComponent(customerIdFor(subscription))}`);
  if (customer.deleted || customer.metadata?.brocco_guest_checkout !== 'true' || customer.metadata?.brocco_user_id) return;
  await stripeRequest(`/subscriptions/${encodeURIComponent(subscription.id)}`, new URLSearchParams({
    cancel_at_period_end: 'true', 'metadata[brocco_pending_cancel_scheduled]': 'true',
  }), `brocco-protect-guest-${subscription.id}`);
}

export async function pendingGuestCheckout(sessionId: string, intentId: string | null) {
  if (!intentId || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) return null;
  const checkout = await stripeRequest<StripeCheckout>(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
  if (checkout.status !== 'complete' || checkout.mode !== 'subscription' || checkout.metadata?.brocco_guest_checkout !== 'true' || checkout.metadata?.brocco_checkout_intent !== intentId) return null;
  const id = typeof checkout.customer === 'string' ? checkout.customer : checkout.customer?.id;
  if (!id) return null;
  const customer = await stripeRequest<StripeCustomer>(`/customers/${encodeURIComponent(id)}`);
  if (customer.deleted || customer.metadata?.brocco_checkout_intent !== intentId || customer.metadata?.brocco_guest_checkout !== 'true' || customer.metadata?.brocco_user_id) return null;
  const subscription = await checkoutSubscription(checkout);
  if (!subscription || customerIdFor(subscription) !== customer.id || subscription.metadata?.brocco_checkout_intent !== intentId || subscription.metadata?.brocco_user_id) return null;
  return { checkout, customer, subscription };
}

async function cancelWithoutInvoice(subscription: StripeSubscription): Promise<void> {
  if (subscription.status === 'canceled') return;
  await stripeRequest(`/subscriptions/${encodeURIComponent(subscription.id)}`, new URLSearchParams({ invoice_now: 'false', prorate: 'false' }), undefined, 'DELETE');
}

export async function cancelPendingGuestCheckout(sessionId: string, intentId: string | null): Promise<void> {
  const pending = await pendingGuestCheckout(sessionId, intentId);
  if (!pending) throw new BillingError('checkout_not_found', 'Open the checkout return page in the browser where you added your card, or verify the checkout email to manage billing.', 403);
  await cancelWithoutInvoice(pending.subscription);
}

export type CheckoutClaimResult = { ok: true; duplicateCanceled?: boolean } | { ok: false; reason: 'invalid' | 'verify_email' | 'email_mismatch' | 'canceled' | 'trial_used' | 'duplicate_paid' | 'claim_pending' };

export async function claimGuestCheckout(checkout: StripeCheckout, user: BillingUser): Promise<CheckoutClaimResult> {
  if (user.emailVerified !== true) return { ok: false, reason: 'verify_email' };
  const customerId = typeof checkout.customer === 'string' ? checkout.customer : checkout.customer?.id;
  if (!customerId || checkout.status !== 'complete' || checkout.mode !== 'subscription') return { ok: false, reason: 'invalid' };
  const customer = await stripeRequest<StripeCustomer>(`/customers/${encodeURIComponent(customerId)}`);
  if (customer.deleted || (customer.metadata?.brocco_user_id && customer.metadata.brocco_user_id !== user.id)) return { ok: false, reason: 'invalid' };
  // A prior successful claim is bound to the stable account ID, so changing
  // a billing email later cannot break recovery of that same account.
  if (customer.metadata?.brocco_user_id === user.id && customer.metadata?.brocco_guest_checkout !== 'true') return { ok: true };
  const checkoutEmail = (checkout.customer_details?.email || checkout.customer_email || '').trim().toLowerCase();
  if (!customer.metadata?.brocco_user_id && (!checkoutEmail || checkoutEmail !== user.email.trim().toLowerCase())) return { ok: false, reason: 'email_mismatch' };
  const intent = checkout.metadata?.brocco_checkout_intent;
  if (!intent || customer.metadata?.brocco_guest_checkout !== 'true' || customer.metadata?.brocco_checkout_intent !== intent) return { ok: false, reason: 'invalid' };
  const subscription = await checkoutSubscription(checkout);
  if (!subscription || customerIdFor(subscription) !== customer.id || subscription.metadata?.brocco_checkout_intent !== intent || (subscription.metadata?.brocco_user_id && subscription.metadata.brocco_user_id !== user.id)) return { ok: false, reason: 'invalid' };
  if (['canceled', 'incomplete_expired'].includes(subscription.status)) return { ok: false, reason: 'canceled' };
  await protectUnclaimedTrial(subscription);

  const owned = await ownedSubscriptions(user);
  const prior = bestSubscription(owned.subscriptions.filter((sub) => sub.id !== subscription.id));
  const firstId = await reserveTrialClaim(user.id, prior?.id || subscription.id);
  if (firstId !== subscription.id) {
    // Never refund or cancel an already paid subscription automatically. The
    // duplicate preview is safe to remove only while its invoice is zero.
    const invoice = typeof subscription.latest_invoice === 'object' ? subscription.latest_invoice : null;
    if (subscription.status !== 'trialing' || !invoice || invoice.amount_paid !== 0) return { ok: false, reason: 'duplicate_paid' };
    const previous = prior?.id === firstId ? prior : await stripeRequest<StripeSubscription>(`/subscriptions/${encodeURIComponent(firstId)}?expand[]=latest_invoice`);
    if (prior?.id !== firstId && !['canceled', 'incomplete_expired'].includes(previous.status) && previous.metadata?.brocco_user_id !== user.id) {
      // Another tab may have reserved the first trial and lost its response
      // before binding it. Recover that verified checkout before reporting
      // success or discarding this browser's return path.
      const history = await stripeRequest<{ data: StripeCheckout[]; has_more?: boolean }>(`/checkout/sessions?subscription=${encodeURIComponent(firstId)}&limit=100`);
      const original = !history.has_more && history.data.find((candidate) => (typeof candidate.subscription === 'string' ? candidate.subscription : candidate.subscription?.id) === firstId && candidate.metadata?.brocco_guest_checkout === 'true');
      if (!original || !(await claimGuestCheckout(original, user)).ok) return { ok: false, reason: 'claim_pending' };
    }
    await cancelWithoutInvoice(subscription);
    for (const existingCustomer of owned.customers) await bindCustomer(existingCustomer, user);
    return ['canceled', 'incomplete_expired'].includes(previous.status)
      ? { ok: false, reason: 'trial_used' } : { ok: true, duplicateCanceled: true };
  }

  // Database ownership is unique per customer. If another identity won the
  // claim, bindCustomer throws before Stripe is marked owned or enabled.
  await bindCustomer(customer, user);
  if (subscription.metadata?.brocco_user_id !== user.id || subscription.metadata?.brocco_guest_checkout === 'true') {
    await stripeRequest(`/subscriptions/${encodeURIComponent(subscription.id)}`, new URLSearchParams({
      'metadata[brocco_user_id]': user.id, 'metadata[brocco_guest_checkout]': '',
      ...(subscription.status === 'trialing' ? { cancel_at_period_end: 'false' } : {}),
    }), `brocco-claim-guest-${subscription.id}-${user.id}`);
  }
  // Keep the intent on the customer for the original browser's return link,
  // but removing guest status ends cookie-based cancellation authority.
  await stripeRequest(`/customers/${encodeURIComponent(customer.id)}`, new URLSearchParams({ 'metadata[brocco_guest_checkout]': '' }), `brocco-finish-guest-${customer.id}-${user.id}`);
  return { ok: true };
}

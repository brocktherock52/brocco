import { eq } from 'drizzle-orm';
import { db } from './db';
import { users } from './db/schema';
import { accessForSubscription, bestSubscription, customerSubscriptions, stripeRequest, type BillingUser, type StripeCheckout, type StripeCustomer } from './billing';

/** Refresh the display-only plan field from Stripe's CURRENT state. Runtime
 * entitlement always checks Stripe independently of this legacy field. */
export async function syncCustomerPlan(customerId: string): Promise<void> {
  const customer = await stripeRequest<StripeCustomer>(`/customers/${encodeURIComponent(customerId)}`);
  if (customer.deleted || !customer.email) return;
  const subscriptions = await customerSubscriptions(customerId);
  const subscription = bestSubscription(subscriptions);
  const access = subscription ? accessForSubscription(subscription) : null;
  const plan = access?.canUseTools ? access.plan : 'free';
  const ownerId = customer.metadata?.brocco_user_id;
  await db.update(users).set({ plan, updatedAt: new Date() }).where(
    ownerId ? eq(users.id, ownerId) : eq(users.email, customer.email.trim().toLowerCase()),
  );
}

export async function recordPaidCheckout(sessionId: string): Promise<void> {
  if (!sessionId.startsWith('cs_')) return;
  const checkout = await stripeRequest<StripeCheckout>(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
  if (checkout.status !== 'complete' || checkout.mode !== 'subscription') return;
  const customerId = typeof checkout.customer === 'string' ? checkout.customer : checkout.customer?.id;
  if (customerId) await syncCustomerPlan(customerId);
}

/** A Checkout Session ID is never an authentication credential. */
export async function claimCheckoutSession(sessionId: string, user: BillingUser) {
  if (!sessionId.startsWith('cs_')) return { ok: false as const };
  const checkout = await stripeRequest<StripeCheckout>(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
  const ownerId = checkout.client_reference_id || checkout.metadata?.brocco_user_id;
  const checkoutEmail = (checkout.customer_details?.email || checkout.customer_email || '').trim().toLowerCase();
  const owns = ownerId ? ownerId === user.id : user.emailVerified !== false && checkoutEmail === user.email.trim().toLowerCase();
  if (!owns || checkout.status !== 'complete' || checkout.mode !== 'subscription') return { ok: false as const };
  await recordPaidCheckout(sessionId);
  return { ok: true as const };
}

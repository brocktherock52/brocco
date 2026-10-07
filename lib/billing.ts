import type { BillingAccess, BillingPlan } from './billing-types';
import { emptyBillingAccess } from './billing-types';
import { linkedCustomerIds, linkCustomer } from './billing-customers';

export interface BillingUser { id: string; email: string; emailVerified?: boolean }
export interface StripeCustomer { id: string; email?: string; deleted?: boolean; metadata?: Record<string, string> }
export interface StripeInvoice {
  id: string;
  status?: string;
  paid?: boolean;
  amount_paid?: number;
  amount_due?: number;
  currency?: string;
  auto_advance?: boolean;
  billing_reason?: string;
  hosted_invoice_url?: string | null;
}
export interface StripeSubscription {
  id: string;
  customer: string | StripeCustomer;
  status: string;
  trial_start?: number | null;
  trial_end?: number | null;
  metadata?: Record<string, string>;
  pause_collection?: unknown;
  latest_invoice?: string | StripeInvoice | null;
  items: { data: { quantity?: number; price: { id: string; unit_amount?: number | null; currency?: string; recurring?: { interval: string } } }[] };
}
export interface StripeCheckout {
  id: string;
  status?: string;
  mode?: string;
  url?: string;
  customer?: string | StripeCustomer;
  customer_details?: { email?: string };
  customer_email?: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
  subscription?: string | StripeSubscription | null;
}

export class BillingError extends Error {
  constructor(public code: string, message: string, public status = 503) { super(message); }
}

/** Never expose Stripe's raw response, which may contain customer/payment data. */
export async function stripeRequest<T>(path: string, form?: URLSearchParams, idempotencyKey?: string, method?: 'DELETE'): Promise<T> {
  const key = process.env.STRIPE_API_KEY;
  if (!key) throw new BillingError('billing_unavailable', 'Billing is temporarily unavailable. Please try again shortly.');
  const headers: Record<string, string> = { Authorization: `Bearer ${key}`, 'Stripe-Version': '2025-04-30.basil' };
  if (form) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  let response: Response;
  try {
    response = await fetch(`https://api.stripe.com/v1${path}`, {
      method: method || (form ? 'POST' : 'GET'), headers, body: form?.toString(), cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new BillingError('billing_unavailable', 'We could not reach billing. Your tools remain locked until payment is confirmed.');
  }
  if (!response.ok) {
    if (response.status === 402) throw new BillingError('payment_required', 'Your payment could not be completed. Update your payment method in billing, then try again.', 402);
    throw new BillingError('billing_unavailable', 'We could not verify your subscription. Please try again shortly.');
  }
  return response.json() as Promise<T>;
}

export function planForPrice(priceId?: string): BillingPlan | null {
  if (!priceId) return null;
  for (const plan of ['solo', 'team', 'wholesaler'] as const) {
    for (const interval of ['monthly', 'annual']) {
      if (process.env[`STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`] === priceId) return plan;
    }
  }
  return null;
}

export function planForSubscription(subscription: StripeSubscription): BillingPlan | null {
  return subscription.items.data.map((item) => planForPrice(item.price.id)).find(Boolean) ?? null;
}

async function stripeList<T extends { id: string }>(path: string): Promise<T[]> {
  const collected: T[] = [];
  let cursor = '';
  // Fail closed if the account has an unexpectedly large history, rather than
  // missing an existing subscription and creating a duplicate.
  for (let page = 0; page < 20; page++) {
    const data = await stripeRequest<{ data: T[]; has_more?: boolean }>(`${path}${cursor ? `&starting_after=${encodeURIComponent(cursor)}` : ''}`);
    collected.push(...data.data);
    if (!data.has_more) return collected;
    cursor = data.data.at(-1)?.id || '';
    if (!cursor) break;
  }
  throw new BillingError('billing_unavailable', 'Please contact support to review your billing account.');
}

export async function ownedCustomers(user: BillingUser): Promise<StripeCustomer[]> {
  if (user.emailVerified === false) throw new BillingError('verify_email', 'Verify your email before setting up billing.', 403);
  const linkedIds = await linkedCustomerIds(user.id);
  const linked = await Promise.all(linkedIds.map((id) => stripeRequest<StripeCustomer>(`/customers/${encodeURIComponent(id)}`)));
  const query = `metadata['brocco_user_id']:'${user.id.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  const byId: StripeCustomer[] = [];
  let pageToken = '';
  for (let page = 0; page < 20; page++) {
    const result = await stripeRequest<{ data: StripeCustomer[]; next_page?: string; has_more?: boolean }>(`/customers/search?query=${encodeURIComponent(query)}&limit=100${pageToken ? `&page=${encodeURIComponent(pageToken)}` : ''}`);
    byId.push(...result.data);
    if (!result.has_more) break;
    if (!result.next_page || page === 19) throw new BillingError('billing_unavailable', 'Please contact support to review your billing account.');
    pageToken = result.next_page;
  }
  // Email fallback supports legacy customers and the search index's delay
  // immediately after account creation. Metadata survives billing-email edits.
  const byEmail = await stripeList<StripeCustomer>(`/customers?email=${encodeURIComponent(user.email.trim().toLowerCase())}&limit=100`);
  const customers = [...new Map([...linked, ...byId, ...byEmail].filter((customer) => !customer.deleted &&
    (!customer.metadata?.brocco_user_id || customer.metadata.brocco_user_id === user.id) &&
    // An anonymous checkout is claimed only through verified identity and its
    // signed browser intent, never through the legacy email fallback.
    (customer.metadata?.brocco_guest_checkout !== 'true' || customer.metadata?.brocco_user_id === user.id)
  ).map((customer) => [customer.id, customer])).values()];
  await Promise.all(customers.map((customer) => linkCustomer(user.id, customer.id)));
  return customers;
}

export async function bindCustomer(customer: StripeCustomer, user: BillingUser): Promise<void> {
  await linkCustomer(user.id, customer.id);
  if (!customer.metadata?.brocco_user_id) await stripeRequest(`/customers/${encodeURIComponent(customer.id)}`,
    new URLSearchParams({ 'metadata[brocco_user_id]': user.id }), `brocco-bind-${customer.id}-${user.id}`);
}

export async function customerSubscriptions(customerId: string): Promise<StripeSubscription[]> {
  return stripeList<StripeSubscription>(`/subscriptions?customer=${encodeURIComponent(customerId)}&status=all&limit=100&expand[]=data.latest_invoice`);
}

export async function ownedSubscriptions(user: BillingUser): Promise<{ customers: StripeCustomer[]; subscriptions: StripeSubscription[] }> {
  const customers = await ownedCustomers(user);
  const groups = await Promise.all(customers.map((customer) => customerSubscriptions(customer.id)));
  const subscriptions = groups.flat().filter((subscription) =>
    planForSubscription(subscription) && (!subscription.metadata?.brocco_user_id || subscription.metadata.brocco_user_id === user.id) &&
    (subscription.metadata?.brocco_guest_checkout !== 'true' || subscription.metadata?.brocco_user_id === user.id));
  return { customers, subscriptions };
}

export function accessForSubscription(subscription: StripeSubscription): BillingAccess {
  const access = emptyBillingAccess(true);
  access.hostedAvailable = Boolean(process.env.ANTHROPIC_API_KEY);
  const plan = planForSubscription(subscription);
  if (!plan) return access;
  const item = subscription.items.data.find((item) => planForPrice(item.price.id));
  const invoice = typeof subscription.latest_invoice === 'object' ? subscription.latest_invoice : null;
  // A trial's zero-dollar signup invoice is paid too. It must never unlock
  // tools while Stripe is creating the first real invoice at trial end.
  const paidInvoice = invoice?.status === 'paid' &&
    (!subscription.trial_start || invoice.billing_reason !== 'subscription_create' || (invoice.amount_paid ?? 0) > 0);
  const active = subscription.status === 'active' && !subscription.pause_collection && paidInvoice === true;
  access.status = active ? 'active' : subscription.status === 'trialing' ? 'trialing' :
    ['canceled', 'incomplete_expired'].includes(subscription.status) ? 'canceled' : 'payment_required';
  access.canUseTools = active;
  access.canPreviewDashboard = true;
  access.plan = plan;
  access.subscriptionId = subscription.id;
  access.trialEndsAt = subscription.trial_end ? subscription.trial_end * 1000 : null;
  access.price = item && typeof item.price.unit_amount === 'number'
    ? { amount: item.price.unit_amount * (item.quantity ?? 1), currency: item.price.currency || 'usd', interval: item.price.recurring?.interval || 'month' } : null;
  const invoiceUrl = invoice?.hosted_invoice_url;
  if (invoiceUrl && invoice?.status === 'open') {
    try { const url = new URL(invoiceUrl); if (url.protocol === 'https:' && url.hostname === 'invoice.stripe.com') access.paymentUrl = url.toString(); } catch { /* No untrusted redirect. */ }
  }
  return access;
}

export function bestSubscription(subscriptions: StripeSubscription[]): StripeSubscription | null {
  const score = (sub: StripeSubscription) => accessForSubscription(sub).canUseTools ? 4 : sub.status === 'trialing' ? 3 : ['canceled', 'incomplete_expired'].includes(sub.status) ? 0 : 2;
  return [...subscriptions].sort((a, b) => score(b) - score(a))[0] ?? null;
}

export async function getBillingAccess(user: BillingUser): Promise<BillingAccess> {
  const { subscriptions } = await ownedSubscriptions(user);
  const subscription = bestSubscription(subscriptions);
  return subscription ? accessForSubscription(subscription) : { ...emptyBillingAccess(true), hostedAvailable: Boolean(process.env.ANTHROPIC_API_KEY) };
}

export function publicAppUrl(req: Request): string {
  const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (configured) return new URL(configured).origin;
  const requestUrl = new URL(req.url);
  return process.env.NODE_ENV === 'production' ? 'https://brocco.dev' : requestUrl.origin;
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  // Browser POSTs send Origin. API clients with a valid session cookie can
  // omit it; cross-site form submissions cannot bypass the JSON requirement.
  return (!origin || origin === new URL(req.url).origin || origin === publicAppUrl(req)) &&
    (req.headers.get('content-type') || '').includes('application/json');
}

export function billingErrorResponse(error: unknown): Response {
  const known = error instanceof BillingError ? error : new BillingError('billing_unavailable', 'Billing is temporarily unavailable. Please try again.');
  return Response.json({ error: known.code, detail: known.message }, { status: known.status, headers: { 'Cache-Control': 'no-store' } });
}

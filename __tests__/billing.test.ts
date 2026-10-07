import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { accessForSubscription, getBillingAccess, ownedCustomers, type StripeSubscription } from '@/lib/billing';
import { linkedCustomerIds } from '@/lib/billing-customers';
import { POST as checkout } from '@/app/api/checkout/route';
import { POST as activate } from '@/app/api/billing/activate/route';
import { POST as portal } from '@/app/api/portal/route';
import { auth } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/lib/billing-customers', () => ({ linkedCustomerIds: vi.fn(async () => []), linkCustomer: vi.fn(async () => {}) }));
vi.mock('@/lib/billing-trial-claims', () => ({ firstTrialClaim: vi.fn(async () => null) }));

const user = { id: '11111111-1111-4111-8111-111111111111', email: 'buyer@example.com', emailVerified: true };
const customer = { id: 'cus_owned', email: user.email, metadata: { brocco_user_id: user.id } };
const price = { amount: 4900, currency: 'usd', interval: 'month' };
function subscription(overrides: Partial<StripeSubscription> = {}): StripeSubscription {
  return {
    id: 'sub_owned', customer: 'cus_owned', status: 'active', metadata: { brocco_user_id: user.id },
    items: { data: [{ price: { id: 'price_solo', unit_amount: 4900, currency: 'usd', recurring: { interval: 'month' } } }] },
    latest_invoice: { id: 'in_paid', status: 'paid', amount_paid: 4900, billing_reason: 'subscription_cycle' },
    ...overrides,
  };
}
function request(path: string, body: unknown) {
  return new Request(`https://brocco.dev${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://brocco.dev' }, body: JSON.stringify(body) });
}
function paymentRequest(extra: Record<string, unknown> = {}) {
  return request('/api/billing/activate', { confirm: true, subscriptionId: 'sub_owned', requestId: 'aabbccdd-0000-4000-8000-001122334455', price, ...extra });
}

let subscriptions: StripeSubscription[];
let calls: { path: string; method: string; form: URLSearchParams; headers: Headers }[];
let customResponse: ((path: string, form: URLSearchParams) => Response | undefined) | undefined;

beforeEach(() => {
  vi.stubEnv('STRIPE_API_KEY', 'sk_test_fake');
  vi.stubEnv('STRIPE_PRICE_SOLO_MONTHLY', 'price_solo');
  vi.stubEnv('STRIPE_PRICE_TEAM_ANNUAL', 'price_team_year');
  vi.stubEnv('APP_URL', 'https://brocco.dev');
  vi.mocked(auth.api.getSession).mockResolvedValue({ user } as Awaited<ReturnType<typeof auth.api.getSession>>);
  vi.mocked(linkedCustomerIds).mockResolvedValue([]);
  subscriptions = [];
  calls = [];
  customResponse = undefined;
  vi.stubGlobal('fetch', vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input);
    const path = url.pathname.replace('/v1', '');
    const form = new URLSearchParams(String(init?.body || ''));
    calls.push({ path, method: init?.method || 'GET', form, headers: new Headers(init?.headers) });
    const override = customResponse?.(path, form);
    if (override) return override;
    if (path === '/customers/search') return Response.json({ data: [] });
    if (path === '/customers') return Response.json({ data: [customer] });
    if (path === '/customers/cus_owned') return Response.json(customer);
    if (path === '/subscriptions') return Response.json({ data: subscriptions });
    if (path === '/checkout/sessions' && init?.method !== 'POST') return Response.json({ data: [] });
    if (path === '/checkout/sessions') return Response.json({ id: 'cs_new', url: 'https://checkout.stripe.com/new' });
    if (path === '/billing_portal/sessions') return Response.json({ url: 'https://billing.stripe.com/owned' });
    throw new Error(`Unexpected Stripe request ${path}`);
  }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe('authoritative tool entitlement', () => {
  it('keeps the zero-dollar trial invoice preview-only', () => {
    const access = accessForSubscription(subscription({ status: 'trialing', trial_start: 123, trial_end: 999, latest_invoice: { id: 'in_trial', status: 'paid', amount_paid: 0, billing_reason: 'subscription_create' } }));
    expect(access.canPreviewDashboard).toBe(true);
    expect(access.canUseTools).toBe(false);
    expect(access.trialEndsAt).toBe(999000);
  });
  it('does not unlock from active status while the trial signup invoice is still latest', () => {
    expect(accessForSubscription(subscription({ trial_start: 123, latest_invoice: { id: 'in_trial', status: 'paid', amount_paid: 0, billing_reason: 'subscription_create' } })).canUseTools).toBe(false);
  });
  it('preserves an existing paid subscription and does not expose a paid invoice as payment due', () => {
    const access = accessForSubscription(subscription());
    expect(access.canUseTools).toBe(true);
    expect(access.price).toEqual(price);
    expect(access.paymentUrl).toBeNull();
  });
  it.each(['trialing', 'past_due', 'unpaid', 'canceled', 'paused', 'incomplete'])('denies %s even with a prior paid invoice', (status) => {
    expect(accessForSubscription(subscription({ status })).canUseTools).toBe(false);
  });
  it('rejects unknown prices and unverified payment', () => {
    expect(accessForSubscription(subscription({ items: { data: [{ price: { id: 'unrelated_product' } }] } })).canUseTools).toBe(false);
    expect(accessForSubscription(subscription({ latest_invoice: 'in_not_expanded' })).canUseTools).toBe(false);
    expect(accessForSubscription(subscription({ latest_invoice: { id: 'in_due', status: 'open' } })).canUseTools).toBe(false);
  });
  it('fails closed on Stripe failures and never trusts the client plan field', async () => {
    customResponse = () => Response.json({}, { status: 500 });
    await expect(getBillingAccess(user)).rejects.toThrow(/verify/);
  });
  it('retains stable ownership when the billing email changes', async () => {
    vi.mocked(linkedCustomerIds).mockResolvedValue(['cus_owned']);
    customResponse = (path) => path === '/customers' ? Response.json({ data: [] }) : path === '/customers/cus_owned' ? Response.json({ ...customer, email: 'new-billing@example.com' }) : undefined;
    expect((await ownedCustomers(user))[0].id).toBe('cus_owned');
  });
  it('rejects a customer bound to another user despite a matching email', async () => {
    customResponse = (path) => path === '/customers' ? Response.json({ data: [{ ...customer, metadata: { brocco_user_id: 'someone-else' } }] }) : undefined;
    expect(await ownedCustomers(user)).toEqual([]);
  });
});

describe('checkout and billing ownership', () => {
  it('requires sign-in before creating a checkout', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    expect((await checkout(request('/api/checkout', { tier: 'solo' }))).status).toBe(401);
    expect(calls).toHaveLength(0);
  });
  it('creates a card-required preview trial bound to the authenticated account', async () => {
    const response = await checkout(request('/api/checkout', { tier: 'solo', email: 'attacker@example.com' }));
    expect(response.status).toBe(200);
    const form = calls.find((call) => call.path === '/checkout/sessions' && call.method === 'POST')!.form;
    expect(form.get('customer')).toBe('cus_owned');
    expect(form.get('client_reference_id')).toBe(user.id);
    expect(form.get('subscription_data[trial_period_days]')).toBe('7');
    expect(form.get('payment_method_collection')).toBe('always');
    expect(form.has('customer_email')).toBe(false);
  });
  it('does not duplicate a trial or active subscription', async () => {
    subscriptions = [subscription({ status: 'trialing' })];
    const response = await checkout(request('/api/checkout', { tier: 'solo' }));
    expect((await response.json()).existingSubscription).toBe(true);
    expect(calls.some((call) => call.path === '/checkout/sessions')).toBe(false);
  });
  it('does not reset a consumed trial or silently switch to an immediate paid checkout', async () => {
    subscriptions = [subscription({ status: 'canceled', trial_start: 100, trial_end: 700 })];
    const response = await checkout(request('/api/checkout', { tier: 'solo' }));
    expect(response.status).toBe(409);
    expect((await response.json()).error).toBe('trial_already_used');
    expect(calls.some((call) => call.path === '/checkout/sessions')).toBe(false);
  });
  it('expires an unfinished wrong-plan checkout before creating the selected plan', async () => {
    customResponse = (path, form) => {
      if (path === '/checkout/sessions' && !form.size) return Response.json({ data: [{ id: 'cs_old', status: 'open', mode: 'subscription', client_reference_id: user.id, metadata: { tier: 'solo', interval: 'monthly' }, url: 'https://checkout.stripe.com/old' }] });
      if (path === '/checkout/sessions/cs_old/expire') return Response.json({ id: 'cs_old', status: 'expired' });
    };
    const response = await checkout(request('/api/checkout', { tier: 'team', interval: 'annual' }));
    expect(response.status).toBe(200);
    expect(calls.find((call) => call.path.endsWith('/expire'))).toBeTruthy();
    expect(calls.find((call) => call.path === '/checkout/sessions' && call.method === 'POST')!.form.get('line_items[0][price]')).toBe('price_team_year');
  });
  it('ignores an arbitrary customer ID passed to the billing portal', async () => {
    subscriptions = [subscription()];
    expect((await portal(request('/api/portal', { customer_id: 'cus_victim' }))).status).toBe(200);
    expect(calls.find((call) => call.path === '/billing_portal/sessions')!.form.get('customer')).toBe('cus_owned');
  });
});

describe('explicit trial activation', () => {
  beforeEach(() => { subscriptions = [subscription({ status: 'trialing', trial_start: 100, trial_end: 500 })]; });
  it('requires explicit confirmation and current price', async () => {
    expect((await activate(paymentRequest({ confirm: false }))).status).toBe(400);
    expect((await activate(paymentRequest({ price: { ...price, amount: 100 } }))).status).toBe(409);
    expect(calls.some((call) => call.method === 'POST')).toBe(false);
  });
  it('cannot activate another account subscription', async () => {
    expect((await activate(paymentRequest({ subscriptionId: 'sub_other' }))).status).toBe(404);
    expect(calls.some((call) => call.method === 'POST')).toBe(false);
  });
  it('finalizes and pays the same invoice, then rechecks before unlocking', async () => {
    customResponse = (path) => {
      if (path === '/subscriptions/sub_owned') return Response.json(subscription({ latest_invoice: { id: 'in_new', status: 'draft' } }));
      if (path === '/invoices/in_new/finalize') return Response.json({ id: 'in_new', status: 'open', auto_advance: false, amount_due: 4900, currency: 'usd' });
      if (path === '/invoices/in_new/pay') { subscriptions = [subscription()]; return Response.json({ id: 'in_new', status: 'paid' }); }
    };
    const response = await activate(paymentRequest());
    expect(response.status).toBe(200);
    expect((await response.json()).canUseTools).toBe(true);
    const transition = calls.find((call) => call.path === '/subscriptions/sub_owned')!;
    expect(transition.form.get('trial_end')).toBe('now');
    expect(transition.form.get('payment_behavior')).toBe('default_incomplete');
    expect(calls.find((call) => call.path === '/invoices/in_new/finalize')!.form.get('auto_advance')).toBe('false');
    expect(transition.headers.get('idempotency-key')).toContain('sub_owned-500');
    expect(calls.some((call) => call.path === '/checkout/sessions')).toBe(false);
  });
  it('keeps declined/SCA payment locked and exposes only the Stripe invoice URL', async () => {
    const pending = subscription({ status: 'past_due', latest_invoice: { id: 'in_due', status: 'open', auto_advance: false, amount_due: 4900, currency: 'usd', hosted_invoice_url: 'https://invoice.stripe.com/i/test' } });
    customResponse = (path) => {
      if (path === '/subscriptions/sub_owned') { subscriptions = [pending]; return Response.json(pending); }
      if (path === '/invoices/in_due/pay') return Response.json({}, { status: 402 });
    };
    const response = await activate(paymentRequest());
    const access = await response.json();
    expect(response.status).toBe(202);
    expect(access.canUseTools).toBe(false);
    expect(access.paymentUrl).toBe('https://invoice.stripe.com/i/test');
  });
  it('recovers an interrupted invoice finalization without ending the trial twice', async () => {
    subscriptions = [subscription({ latest_invoice: { id: 'in_recover', status: 'draft' } })];
    customResponse = (path) => {
      if (path === '/invoices/in_recover/finalize') return Response.json({ id: 'in_recover', status: 'open', auto_advance: false, amount_due: 4900, currency: 'usd' });
      if (path === '/invoices/in_recover/pay') { subscriptions = [subscription()]; return Response.json({ id: 'in_recover', status: 'paid' }); }
    };
    expect((await activate(paymentRequest())).status).toBe(200);
    expect(calls.some((call) => call.path === '/subscriptions/sub_owned')).toBe(false);
  });
  it.each([{ amount: 6900, currency: 'usd' }, { amount: 4900, currency: 'eur' }])('requires hosted invoice approval when actual total/currency differs: %j', async ({ amount, currency }) => {
    const invoice = { id: 'in_adjusted', status: 'open', auto_advance: false, amount_due: amount, currency, hosted_invoice_url: 'https://invoice.stripe.com/i/adjusted' };
    subscriptions = [subscription({ latest_invoice: { ...invoice, status: 'draft' } })];
    customResponse = (path) => {
      if (path === '/invoices/in_adjusted/finalize') { subscriptions = [subscription({ latest_invoice: invoice })]; return Response.json(invoice); }
    };
    const response = await activate(paymentRequest());
    const data = await response.json();
    expect(response.status).toBe(409);
    expect(data.error).toBe('invoice_review_required');
    expect(data.access.canUseTools).toBe(false);
    expect(data.access.paymentUrl).toBe(invoice.hosted_invoice_url);
    expect(calls.find((call) => call.path.endsWith('/finalize'))!.form.get('auto_advance')).toBe('false');
    expect(calls.some((call) => call.path.endsWith('/pay'))).toBe(false);
    expect(calls.some((call) => call.path === '/subscriptions/sub_owned')).toBe(false);
  });
  it('disables existing invoice auto-collection and never pays an unknown amount', async () => {
    const invoice = { id: 'in_unknown', status: 'open', auto_advance: true, hosted_invoice_url: 'https://invoice.stripe.com/i/unknown' };
    subscriptions = [subscription({ latest_invoice: invoice })];
    customResponse = (path, form) => {
      if (path === '/invoices/in_unknown') {
        expect(form.get('auto_advance')).toBe('false');
        return Response.json({ ...invoice, auto_advance: false });
      }
    };
    expect((await activate(paymentRequest())).status).toBe(409);
    expect(calls.some((call) => call.path.endsWith('/pay'))).toBe(false);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as guestCheckout } from '@/app/api/checkout/guest/route';
import { POST as cancelCheckout } from '@/app/api/billing/pending/cancel/route';
import { claimGuestCheckout, protectUnclaimedTrial } from '@/lib/billing-guest';
import { syncCustomerPlan } from '@/lib/billing-claim';
import { getBillingAccess, type StripeCheckout, type StripeCustomer, type StripeSubscription } from '@/lib/billing';
import { reserveTrialClaim } from '@/lib/billing-trial-claims';
import { linkCustomer } from '@/lib/billing-customers';
import { checkoutIntentResponse } from '@/lib/checkout-intent';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn(async () => null) } } }));
vi.mock('@/lib/billing-customers', () => ({ linkedCustomerIds: vi.fn(async () => []), linkCustomer: vi.fn(async () => {}) }));
vi.mock('@/lib/billing-trial-claims', () => ({ firstTrialClaim: vi.fn(async () => null), reserveTrialClaim: vi.fn(async (_user: string, id: string) => id) }));
vi.mock('@/lib/db', () => ({ db: { update: vi.fn(() => ({ set: () => ({ where: async () => {} }) })) } }));

const user = { id: '11111111-1111-4111-8111-111111111111', email: 'buyer@example.com', emailVerified: true };
const intent = 'a'.repeat(48);
let customers: Record<string, StripeCustomer>;
let subscriptions: Record<string, StripeSubscription>;
let checkout: StripeCheckout;
let history: StripeCheckout[];
let calls: { path: string; method: string; form: URLSearchParams; key: string | null }[];
let fail: ((path: string, form: URLSearchParams) => boolean) | null;
function req(path: string, body: unknown, cookie = '') {
  return new Request(`https://brocco.dev${path}`, { method: 'POST', headers: { origin: 'https://brocco.dev', 'Content-Type': 'application/json', cookie }, body: JSON.stringify(body) });
}
function cookie() {
  return checkoutIntentResponse(req('/', {}), { id: intent, expires: Date.now() + 86400000, customerId: 'cus_guest' }, {}).headers.get('set-cookie')!.split(';')[0];
}
function applyMetadata(target: { metadata?: Record<string, string> }, form: URLSearchParams) {
  for (const [key, value] of form) {
    const field = key.match(/^metadata\[(.+)\]$/)?.[1];
    if (field) { target.metadata ||= {}; if (value) target.metadata[field] = value; else delete target.metadata[field]; }
  }
}
beforeEach(() => {
  vi.stubEnv('STRIPE_API_KEY', 'sk_test_fake'); vi.stubEnv('STRIPE_PRICE_SOLO_MONTHLY', 'price_solo');
  vi.stubEnv('STRIPE_PRICE_TEAM_ANNUAL', 'price_team_year'); vi.stubEnv('APP_URL', 'https://brocco.dev');
  vi.stubEnv('AUTH_SECRET', 'test-only-not-a-real-secret-'.repeat(2)); vi.stubEnv('ANTHROPIC_API_KEY', '');
  vi.mocked(auth.api.getSession).mockResolvedValue(null);
  vi.mocked(reserveTrialClaim).mockImplementation(async (_user, id) => id);
  calls = []; history = []; fail = null;
  const metadata = { brocco_guest_checkout: 'true', brocco_checkout_intent: intent };
  customers = { cus_guest: { id: 'cus_guest', email: user.email, metadata: { ...metadata } } };
  subscriptions = { sub_guest: { id: 'sub_guest', customer: 'cus_guest', status: 'trialing', trial_start: 100, trial_end: 700, metadata: { ...metadata }, items: { data: [{ price: { id: 'price_solo', unit_amount: 4900, currency: 'usd', recurring: { interval: 'month' } } }] }, latest_invoice: { id: 'in_trial', status: 'paid', amount_paid: 0, billing_reason: 'subscription_create' } } };
  checkout = { id: 'cs_guest', mode: 'subscription', status: 'complete', customer: 'cus_guest', subscription: 'sub_guest', customer_details: { email: user.email }, metadata: { ...metadata, tier: 'solo', interval: 'monthly' } };
  vi.stubGlobal('fetch', vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input), path = url.pathname.replace('/v1', ''), method = init?.method || 'GET';
    const form = new URLSearchParams(String(init?.body || ''));
    calls.push({ path, method, form, key: new Headers(init?.headers).get('idempotency-key') });
    if (fail?.(path, form)) return Response.json({}, { status: 500 });
    if (path === '/customers/search') {
      const query = url.searchParams.get('query') || '';
      return Response.json({ data: Object.values(customers).filter((c) => query.includes('brocco_user_id') ? c.metadata?.brocco_user_id === user.id : c.metadata?.brocco_checkout_intent === intent) });
    }
    if (path === '/customers' && method === 'GET') return Response.json({ data: Object.values(customers).filter((c) => c.email === url.searchParams.get('email')) });
    if (path.startsWith('/customers/')) {
      const customer = customers[path.split('/')[2]];
      if (method === 'POST') applyMetadata(customer, form);
      return Response.json(customer);
    }
    if (path === '/subscriptions') return Response.json({ data: Object.values(subscriptions).filter((s) => s.customer === url.searchParams.get('customer')) });
    if (path.startsWith('/subscriptions/')) {
      const sub = subscriptions[path.split('/')[2]];
      if (method === 'DELETE') sub.status = 'canceled';
      if (method === 'POST') applyMetadata(sub, form);
      return Response.json(sub);
    }
    if (path === '/checkout/sessions' && method === 'GET') return Response.json({ data: history });
    if (path === '/checkout/sessions' && method === 'POST') return Response.json({ id: 'cs_new', url: 'https://checkout.stripe.com/new' });
    if (path.endsWith('/expire')) return Response.json({ id: 'cs_old', status: 'expired' });
    if (path === '/checkout/sessions/cs_guest') return Response.json(checkout);
    throw new Error(`Unexpected Stripe path ${path}`);
  }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe('anonymous card-first checkout', () => {
  it('prepares a protected intent without creating a Stripe customer or requiring sign-in', async () => {
    const response = await guestCheckout(req('/api/checkout/guest', { tier: 'solo' }));
    expect(await response.json()).toEqual({ prepared: true });
    expect(response.headers.get('set-cookie')).toContain('HttpOnly'); expect(calls).toHaveLength(0);
  });
  it('creates only a known card-required trial and preserves Team annual before signup', async () => {
    const response = await guestCheckout(req('/api/checkout/guest', { tier: 'team', interval: 'annual', customer: 'cus_attacker', email: 'attacker@example.com' }, cookie()));
    expect(response.status).toBe(200);
    const form = calls.find((c) => c.path === '/checkout/sessions' && c.method === 'POST')!.form;
    expect(form.get('line_items[0][price]')).toBe('price_team_year');
    expect(form.get('customer')).toBe('cus_guest');
    expect(form.has('customer_email')).toBe(false); expect(form.has('client_reference_id')).toBe(false);
    expect(form.get('payment_method_collection')).toBe('always'); expect(form.get('subscription_data[trial_period_days]')).toBe('7');
    expect(form.get('custom_text[submit][message]')).toMatch(/own Anthropic API key; provider charges are separate/);
    expect(form.get('custom_text[submit][message]')).toMatch(/Unconnected trials are scheduled to cancel/);
  });
  it('reuses completion and never creates a second subscription on reload', async () => {
    history = [checkout];
    const response = await guestCheckout(req('/api/checkout/guest', { tier: 'team', interval: 'annual' }, cookie()));
    expect((await response.json()).url).toContain('/billing/success?session_id=cs_guest');
    expect(calls.some((c) => c.path === '/checkout/sessions' && c.method === 'POST')).toBe(false);
  });
  it('expires the old guest plan before creating a different explicit plan', async () => {
    history = [{ ...checkout, id: 'cs_old', status: 'open', url: 'https://checkout.stripe.com/old' }];
    await guestCheckout(req('/api/checkout/guest', { tier: 'team', interval: 'annual' }, cookie()));
    const mutations = calls.filter((c) => c.method === 'POST');
    expect(mutations[0].path).toBe('/checkout/sessions/cs_old/expire');
    expect(mutations[1].form.get('line_items[0][price]')).toBe('price_team_year');
  });
  it('rejects cross-origin setup', async () => {
    const request = req('/api/checkout/guest', {}, cookie()); request.headers.set('origin', 'https://attacker.example');
    expect((await guestCheckout(request)).status).toBe(403); expect(calls).toHaveLength(0);
  });
});

describe('verified guest claim and billing recovery', () => {
  it('never grants entitlement or legacy plan from an unclaimed matching email', async () => {
    expect((await getBillingAccess(user)).canPreviewDashboard).toBe(false);
    await syncCustomerPlan('cus_guest');
    expect(db.update).not.toHaveBeenCalled();
    expect(calls.some((c) => c.form.get('cancel_at_period_end') === 'true')).toBe(true);
  });
  it('requires verified identity and matching checkout email, including Apple relay mismatches', async () => {
    expect(await claimGuestCheckout(checkout, { ...user, emailVerified: false })).toEqual({ ok: false, reason: 'verify_email' });
    expect(await claimGuestCheckout(checkout, { ...user, email: 'relay@privaterelay.appleid.com' })).toEqual({ ok: false, reason: 'email_mismatch' });
    expect(linkCustomer).not.toHaveBeenCalled(); expect(calls.every((c) => c.method === 'GET')).toBe(true);
  });
  it('allows verified matching-email recovery on another browser and removes pending cancellation after binding', async () => {
    expect(await claimGuestCheckout(checkout, user)).toEqual({ ok: true });
    expect(linkCustomer).toHaveBeenCalledWith(user.id, 'cus_guest');
    expect(subscriptions.sub_guest.metadata?.brocco_user_id).toBe(user.id);
    const writes = calls.filter((c) => c.path === '/subscriptions/sub_guest' && c.method === 'POST');
    expect(writes.map((c) => c.form.get('cancel_at_period_end'))).toEqual(['true', 'false']);
    expect(writes[0].key).toBe('brocco-protect-guest-sub_guest');
    expect((await getBillingAccess(user)).status).toBe('trialing');
    expect((await getBillingAccess(user)).canUseTools).toBe(false);
  });
  it('does not let a stale webhook re-schedule a claimed customer even with an old subscription snapshot', async () => {
    const stale = structuredClone(subscriptions.sub_guest);
    await claimGuestCheckout(checkout, user); calls = [];
    await protectUnclaimedTrial(stale);
    expect(calls.some((c) => c.method === 'POST')).toBe(false);
  });
  it('resumes after binding succeeds but subscription claim fails', async () => {
    fail = (path, form) => path === '/subscriptions/sub_guest' && form.get('metadata[brocco_user_id]') === user.id;
    await expect(claimGuestCheckout(checkout, user)).rejects.toThrow();
    expect(customers.cus_guest.metadata?.brocco_user_id).toBe(user.id);
    fail = null; calls = [];
    expect(await claimGuestCheckout(checkout, user)).toEqual({ ok: true });
    expect(calls.some((c) => c.form.get('cancel_at_period_end') === 'false')).toBe(true);
  });
  it('finishes failed customer cleanup without replaying subscription updates after early payment', async () => {
    fail = (path, form) => path === '/customers/cus_guest' && form.get('metadata[brocco_guest_checkout]') === '';
    await expect(claimGuestCheckout(checkout, user)).rejects.toThrow();
    subscriptions.sub_guest.status = 'active'; fail = null; calls = [];
    expect(await claimGuestCheckout(checkout, user)).toEqual({ ok: true });
    expect(calls.some((c) => c.path === '/subscriptions/sub_guest' && c.method === 'POST')).toBe(false);
  });
  it('cancels only the duplicate zero-dollar trial while preserving an existing paid account', async () => {
    customers.cus_prior = { id: 'cus_prior', email: user.email, metadata: { brocco_user_id: user.id } };
    subscriptions.sub_prior = { ...structuredClone(subscriptions.sub_guest), id: 'sub_prior', customer: 'cus_prior', status: 'active', metadata: { brocco_user_id: user.id }, latest_invoice: { id: 'in_paid', status: 'paid', amount_paid: 4900, billing_reason: 'subscription_cycle' } };
    expect(await claimGuestCheckout(checkout, user)).toEqual({ ok: true, duplicateCanceled: true });
    expect(subscriptions.sub_guest.status).toBe('canceled'); expect(subscriptions.sub_prior.status).toBe('active');
    const cancel = calls.find((c) => c.method === 'DELETE')!;
    expect(cancel.path).toBe('/subscriptions/sub_guest'); expect(cancel.form.get('invoice_now')).toBe('false');
    expect(calls.some((c) => c.path.endsWith('/pay'))).toBe(false);
  });
  it('blocks restarting a consumed trial through a new guest checkout', async () => {
    subscriptions.sub_previous = { ...structuredClone(subscriptions.sub_guest), id: 'sub_previous', status: 'canceled' };
    vi.mocked(reserveTrialClaim).mockResolvedValue('sub_previous');
    expect(await claimGuestCheckout(checkout, user)).toEqual({ ok: false, reason: 'trial_used' });
    expect(subscriptions.sub_guest.status).toBe('canceled');
  });
  it('recovers the original reserved checkout before canceling the second tab trial', async () => {
    const firstIntent = 'b'.repeat(48);
    customers.cus_original = { id: 'cus_original', email: user.email, metadata: { brocco_guest_checkout: 'true', brocco_checkout_intent: firstIntent } };
    subscriptions.sub_original = { ...structuredClone(subscriptions.sub_guest), id: 'sub_original', customer: 'cus_original', metadata: { brocco_guest_checkout: 'true', brocco_checkout_intent: firstIntent } };
    history = [{ ...structuredClone(checkout), id: 'cs_original', customer: 'cus_original', subscription: 'sub_original', metadata: { brocco_guest_checkout: 'true', brocco_checkout_intent: firstIntent } }];
    vi.mocked(reserveTrialClaim).mockResolvedValue('sub_original');
    expect(await claimGuestCheckout(checkout, user)).toEqual({ ok: true, duplicateCanceled: true });
    expect(customers.cus_original.metadata?.brocco_user_id).toBe(user.id);
    expect(subscriptions.sub_original.metadata?.brocco_user_id).toBe(user.id);
    expect(subscriptions.sub_original.status).toBe('trialing');
    expect(subscriptions.sub_guest.status).toBe('canceled');
    const claimIndex = calls.findIndex((c) => c.path === '/subscriptions/sub_original' && c.form.get('metadata[brocco_user_id]') === user.id);
    expect(calls.findIndex((c) => c.method === 'DELETE')).toBeGreaterThan(claimIndex);
  });
  it('does not report connected or discard the new return path if reserved checkout cannot be recovered', async () => {
    subscriptions.sub_original = { ...structuredClone(subscriptions.sub_guest), id: 'sub_original' };
    vi.mocked(reserveTrialClaim).mockResolvedValue('sub_original');
    expect(await claimGuestCheckout(checkout, user)).toEqual({ ok: false, reason: 'claim_pending' });
    expect(subscriptions.sub_guest.status).toBe('trialing');
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
    expect(calls.some((c) => c.form.get('cancel_at_period_end') === 'true')).toBe(true);
  });
  it('will not bind a customer already owned by a different identity', async () => {
    customers.cus_guest.metadata!.brocco_user_id = 'different-user';
    expect(await claimGuestCheckout(checkout, user)).toEqual({ ok: false, reason: 'invalid' });
    expect(linkCustomer).not.toHaveBeenCalled();
  });
  it('requires signed cookie and explicit confirmation for anonymous cancellation', async () => {
    expect((await cancelCheckout(req('/api/billing/pending/cancel', { sessionId: 'cs_guest', confirm: true }))).status).toBe(403);
    expect((await cancelCheckout(req('/api/billing/pending/cancel', { sessionId: 'cs_guest' }, cookie()))).status).toBe(400);
    expect((await cancelCheckout(req('/api/billing/pending/cancel', { sessionId: 'cs_guest', confirm: true }, cookie()))).status).toBe(200);
    expect(subscriptions.sub_guest.status).toBe('canceled');
  });
  it('does not let a former guest cookie cancel a connected account', async () => {
    await claimGuestCheckout(checkout, user); calls = [];
    expect((await cancelCheckout(req('/api/billing/pending/cancel', { sessionId: 'cs_guest', confirm: true }, cookie()))).status).toBe(403);
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
  });
});

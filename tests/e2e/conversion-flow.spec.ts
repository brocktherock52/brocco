import { test, expect, type Page } from '@playwright/test';
import type { BillingAccess } from '../../lib/billing-types';

// Every API is intercepted: no real accounts, email, charges, or model calls.
const trial: BillingAccess = {
  authenticated: true, canPreviewDashboard: true, canUseTools: false, hostedAvailable: true,
  status: 'trialing', plan: 'solo', subscriptionId: 'sub_e2e_trial',
  trialEndsAt: 2_000_000_000,
  price: { amount: 4900, currency: 'usd', interval: 'month' }, paymentUrl: null,
};
const paid: BillingAccess = { ...trial, canUseTools: true, status: 'active', trialEndsAt: null };
const signedOut: BillingAccess = {
  ...trial, authenticated: false, canPreviewDashboard: false, status: 'signed_out',
  plan: null, subscriptionId: null, trialEndsAt: null, price: null,
};

async function mockApplication(page: Page, initialAccess: BillingAccess) {
  const state = {
    access: initialAccess,
    activationResult: 'success' as 'success' | 'declined',
    activations: [] as Record<string, unknown>[],
    runs: [] as Record<string, unknown>[],
    magicLinks: [] as Record<string, unknown>[],
    unexpected: [] as string[], accessChecks: 0,
  };
  await page.addInitScript(() => {
    localStorage.setItem('brocco:consent', JSON.stringify({ mode: 'essential', ts: Date.now() }));
    localStorage.setItem('brocco:onboarding-seen', '1');
    localStorage.setItem('brocco:demo-seeded:v1', '1');
    localStorage.removeItem('brocco:byok');
  });
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/billing/access') {
      state.accessChecks += 1;
      await route.fulfill({ status: state.access.authenticated ? 200 : 401, json: state.access });
    } else if (path === '/api/auth/get-session') {
      await route.fulfill({ json: state.access.authenticated ? {
        session: { id: 'session_e2e', userId: 'user_e2e', token: 'mock-token', expiresAt: '2033-05-18T00:00:00.000Z' },
        user: { id: 'user_e2e', name: 'Conversion Test', email: 'conversion@example.invalid', emailVerified: true },
      } : null });
    } else if (path === '/api/billing/activate' && request.method() === 'POST') {
      state.activations.push(request.postDataJSON());
      if (state.activationResult === 'declined') {
        await route.fulfill({ status: 402, json: { detail: 'Card declined. Your tools remain locked.' } });
      } else {
        state.access = paid;
        await route.fulfill({ json: { success: true } });
      }
    } else if (path === '/api/auth/sign-in/magic-link' && request.method() === 'POST') {
      state.magicLinks.push(request.postDataJSON());
      await route.fulfill({ json: { status: true } });
    } else if (path === '/api/v1/run' && request.method() === 'POST') {
      state.runs.push(request.postDataJSON());
      const events = [
        { type: 'text_delta', text: 'Hosted research completed for the conversion test.' },
        { type: 'assistant_turn', usage: { input_tokens: 20, output_tokens: 12 } },
        { type: 'run_finished', status: 'done' },
      ];
      await route.fulfill({ status: 200, contentType: 'text/event-stream', body: events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('') });
    } else if (path === '/api/threads' || path.startsWith('/api/threads/') || path === '/api/alerts') {
      // Exercise the existing local persistence fallback without a real DB.
      await route.fulfill({ status: 401, json: { error: 'Mock browser-only session' } });
    } else {
      state.unexpected.push(`${request.method()} ${path}`);
      await route.fulfill({ status: 503, json: { error: 'Unmocked API blocked by conversion test' } });
    }
  });
  await page.route(/https:\/\/(api\.anthropic\.com|api\.openai\.com|api\.x\.ai|api\.stripe\.com)\//, async (route) => {
    state.unexpected.push(route.request().url());
    await route.abort();
  });
  return state;
}

async function openDashboard(page: Page) {
  await page.goto('/app?goal=Research%20the%20conversion%20flow&agents=researcher&label=Test');
  await expect(page.getByRole('button', { name: 'broadcast', exact: true })).toBeVisible();
}

async function openPaywall(page: Page) {
  await page.getByRole('button', { name: 'broadcast', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Unlock your tools' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('checkbox')).toBeVisible();
  return dialog;
}

test.describe('account → dashboard preview → paid tools', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' }, serviceWorkers: 'block' });
  test.setTimeout(60_000);

  test('anonymous dashboard visitors must create an account first', async ({ page }) => {
    const state = await mockApplication(page, signedOut);
    await page.goto('/app');
    await expect(page).toHaveURL(/\/signup\?callbackURL=%2Fstart$/);
    await expect(page.getByRole('heading', { name: 'Create your account.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'broadcast', exact: true })).toHaveCount(0);
    expect(state.runs).toEqual([]);
    expect(state.activations).toEqual([]);
    expect(state.unexpected).toEqual([]);
  });

  test('trial tools require explicit consent and verified activation, with no automatic run', async ({ page }) => {
    const state = await mockApplication(page, trial);
    await openDashboard(page);
    const dialog = await openPaywall(page);
    const consent = dialog.getByRole('checkbox', { name: 'I agree to end my trial and start the paid subscription now.' });
    const pay = dialog.getByRole('button', { name: 'Pay $49.00/month and unlock tools', exact: true });
    await expect(consent).not.toBeChecked();
    await expect(pay).toBeDisabled();
    expect(state.runs).toEqual([]);
    expect(state.activations).toEqual([]);

    // Closing is safe, and consent is not remembered on reopening.
    await consent.check();
    await expect(pay).toBeEnabled();
    await dialog.getByRole('button', { name: 'Close payment dialog' }).click();
    await openPaywall(page);
    await expect(consent).not.toBeChecked();
    await expect(pay).toBeDisabled();
    expect(state.activations).toEqual([]);

    await consent.check();
    const checksBeforePayment = state.accessChecks;
    await pay.click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Hosted AI is ready. Attachments require your own API key.')).toBeVisible();
    expect(state.activations).toHaveLength(1);
    expect(state.activations[0]).toEqual({
      confirm: true, subscriptionId: 'sub_e2e_trial',
      price: { amount: 4900, currency: 'usd', interval: 'month' },
      requestId: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
    });
    expect(state.accessChecks).toBeGreaterThan(checksBeforePayment);
    expect(state.runs).toEqual([]);
    expect(state.unexpected).toEqual([]);
  });

  test('declined payment leaves tools locked and requires fresh consent to retry', async ({ page }) => {
    const state = await mockApplication(page, trial);
    state.activationResult = 'declined';
    await openDashboard(page);
    const dialog = await openPaywall(page);
    const consent = dialog.getByRole('checkbox');
    const pay = dialog.getByRole('button', { name: 'Pay $49.00/month and unlock tools', exact: true });
    await consent.check();
    await pay.click();
    await expect(dialog.getByRole('alert')).toHaveText('Card declined. Your tools remain locked.');
    await expect(consent).not.toBeChecked();
    await expect(pay).toBeDisabled();
    expect(state.activations).toHaveLength(1);
    expect(state.runs).toEqual([]);

    await dialog.getByRole('button', { name: 'Close payment dialog' }).click();
    await openPaywall(page);
    await expect(consent).not.toBeChecked();
    await expect(pay).toBeDisabled();
    await expect(page.getByText('Hosted AI is ready. Attachments require your own API key.')).toHaveCount(0);
    expect(state.activations).toHaveLength(1);
    expect(state.runs).toEqual([]);
    expect(state.unexpected).toEqual([]);
  });

  test('paid accounts without a BYOK key execute the hosted stream', async ({ page }) => {
    const state = await mockApplication(page, paid);
    await openDashboard(page);
    await expect(page.getByText('Hosted AI is ready. Attachments require your own API key.')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('brocco:byok'))).toBeNull();
    await page.getByRole('button', { name: 'broadcast', exact: true }).click();
    await expect.poll(() => state.runs.length).toBe(1);
    expect(state.runs[0]).toEqual({ prompt: 'Research the conversion flow', agent: 'researcher' });
    await page.getByRole('button', { name: /researcher.*done/i }).click();
    const desk = page.getByRole('dialog', { name: 'Researcher desk' });
    await expect(desk.getByText('Hosted research completed for the conversion test.', { exact: true })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Unlock your tools' })).toHaveCount(0);
    expect(state.activations).toEqual([]);
    expect(state.unexpected).toEqual([]);
  });

  test('paid accounts with hosted AI unavailable must connect their own key without running or charging', async ({ page }) => {
    const state = await mockApplication(page, { ...paid, hostedAvailable: false });
    await openDashboard(page);
    await expect(page.getByText('Connect your own Anthropic or xAI API key for live tools. Your provider bills usage separately.')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('brocco:byok'))).toBeNull();

    await page.getByRole('button', { name: 'broadcast', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Bring your own API key' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Unlock your tools' })).toHaveCount(0);
    expect(state.runs).toEqual([]);
    expect(state.activations).toEqual([]);
    expect(state.unexpected).toEqual([]);
  });

  test('an existing unpaid invoice without a payment link can be retried only after explicit consent', async ({ page }) => {
    const state = await mockApplication(page, { ...trial, status: 'payment_required', trialEndsAt: null, paymentUrl: null });
    await openDashboard(page);
    const dialog = await openPaywall(page);
    await expect(dialog.getByText(/Retry payment for your existing subscription\. No additional subscription is created\./)).toBeVisible();
    const consent = dialog.getByRole('checkbox', { name: 'I agree to retry payment for my existing subscription now.' });
    const pay = dialog.getByRole('button', { name: 'Pay $49.00/month and unlock tools', exact: true });
    await expect(consent).not.toBeChecked();
    await expect(pay).toBeDisabled();
    await expect(dialog.getByRole('link', { name: 'Complete secure payment' })).toHaveCount(0);
    expect(state.activations).toEqual([]);
    expect(state.runs).toEqual([]);

    await consent.check();
    await expect(pay).toBeEnabled();
    await pay.click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Hosted AI is ready. Attachments require your own API key.')).toBeVisible();
    expect(state.activations).toHaveLength(1);
    expect(state.activations[0]).toMatchObject({
      confirm: true, subscriptionId: 'sub_e2e_trial', price: { amount: 4900, currency: 'usd', interval: 'month' },
    });
    expect(state.runs).toEqual([]);
    expect(state.unexpected).toEqual([]);
  });

  test('homepage and pricing preserve the selected annual plan through email auth', async ({ page }) => {
    const state = await mockApplication(page, signedOut);
    await page.goto('/');
    const heroTrial = page.locator('#main').getByRole('link', { name: 'Start 7-day trial', exact: true });
    await expect(heroTrial).toHaveAttribute('href', '/signup');
    await heroTrial.click();
    await expect(page.getByRole('heading', { name: 'Create your account.' })).toBeVisible();

    await page.goto('/pricing');
    await expect(page.getByRole('link', { name: 'Start 7-day trial with Solo, billed monthly', exact: true }))
      .toHaveAttribute('href', '/signup?callbackURL=%2Fstart%3Ftier%3Dsolo%26interval%3Dmonthly');
    await page.getByRole('button', { name: 'Annual · save 2 months', exact: true }).click();
    await expect(page.getByText('$490', { exact: true })).toBeVisible();
    await expect(page.getByText('$1,990', { exact: true })).toBeVisible();
    const teamTrial = page.getByRole('link', { name: 'Start 7-day trial with Team, billed annually', exact: true });
    await expect(teamTrial).toHaveAttribute('href', '/signup?callbackURL=%2Fstart%3Ftier%3Dteam%26interval%3Dannual');
    await teamTrial.click();
    await expect(page).toHaveURL(/\/signup\?callbackURL=%2Fstart%3Ftier%3Dteam%26interval%3Dannual$/);
    await page.getByRole('textbox', { name: 'Email address' }).fill('conversion@example.invalid');
    await page.getByRole('button', { name: 'Create account with email' }).click();
    await expect(page.getByRole('heading', { name: 'Check your inbox.' })).toBeVisible();
    expect(state.magicLinks).toHaveLength(1);
    expect(state.magicLinks[0]).toMatchObject({
      email: 'conversion@example.invalid', callbackURL: '/start?tier=team&interval=annual',
      newUserCallbackURL: '/start?tier=team&interval=annual',
    });
    expect(state.activations).toEqual([]);
    expect(state.runs).toEqual([]);
    expect(state.unexpected).toEqual([]);
  });
});

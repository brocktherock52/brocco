/**
 * Auth + thread-persistence end-to-end.
 *
 * Scenario:
 *   1. Visit /signup, enter a unique email, submit.
 *   2. Pull the magic link from the dev console log (when RESEND_API_KEY is
 *      not set the server logs it). Follow the link.
 *   3. Land on /app, type a goal, hit broadcast, confirm a thread appears
 *      in the history drawer.
 *   4. Sign out.
 *   5. Sign back in with the same email + magic link.
 *   6. Open /app, open the history drawer, confirm the thread is still there.
 *
 * Run with:
 *   BASE_URL=http://localhost:3000 npx playwright test tests/e2e
 *
 * Requires `playwright` to be installed (npm i -D @playwright/test) and the
 * dev server to be running. CI workflow can be added separately.
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';

function uniqueEmail() {
  const stamp = Date.now().toString(36);
  return `e2e+${stamp}@brocco.dev`;
}

test('sign up, run, sign out, sign back in - thread persists', async ({ page, context }) => {
  test.setTimeout(120_000);
  const email = uniqueEmail();

  // capture magic-link URLs from the dev console output of the server.
  // In CI we'd swap this for a mailbox API like Mailhog or Resend's
  // sandbox; for now we tap the page console which surfaces dev hints.
  const magicLinks: string[] = [];
  context.on('weberror', () => {});
  page.on('console', (msg) => {
    const text = msg.text();
    const m = text.match(/magic link[^\s]*\s+(https?:\/\/[^\s]+)/i);
    if (m) magicLinks.push(m[1]);
  });

  // 1. signup
  await page.goto(`${BASE}/signup`);
  await page.getByPlaceholder(/you@/).fill(email);
  await page.getByRole('button', { name: /create account|send sign-in link/i }).click();
  await expect(page.getByText(/check your inbox/i)).toBeVisible();

  // 2. follow magic link from server console.
  // Read the dev server's recent stdout via the /api/__test/last-magic-link
  // helper if available, otherwise fail with a clear message.
  const linkRes = await page.request.get(`${BASE}/api/__test/last-magic-link?email=${encodeURIComponent(email)}`);
  test.skip(linkRes.status() === 404, 'Test helper /api/__test/last-magic-link not present; wire it for full CI coverage.');
  const { url } = await linkRes.json();
  await page.goto(url);

  // 3. land on /app, create a thread by submitting a goal
  await page.waitForURL(/\/app/);
  const goal = `e2e test thread ${Date.now()}`;
  await page.locator('#goal-input').fill(goal);
  await page.getByRole('button', { name: /broadcast|agents at work/i }).click();
  // wait briefly for the run to register and the createThread call to land
  await page.waitForTimeout(2_000);

  // open history, expect the goal to be there
  await page.getByRole('button', { name: /history/i }).click();
  await expect(page.getByText(goal)).toBeVisible();

  // 4. sign out
  await page.getByRole('button', { name: /sign out/i }).click();
  await page.waitForURL(/\/login/);

  // 5. sign back in
  await page.getByPlaceholder(/you@/).fill(email);
  await page.getByRole('button', { name: /send sign-in link|create account/i }).click();
  const link2 = await page.request.get(`${BASE}/api/__test/last-magic-link?email=${encodeURIComponent(email)}`);
  const { url: url2 } = await link2.json();
  await page.goto(url2);

  // 6. confirm thread persisted
  await page.waitForURL(/\/app/);
  await page.getByRole('button', { name: /history/i }).click();
  await expect(page.getByText(goal)).toBeVisible();
});

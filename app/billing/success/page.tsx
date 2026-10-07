import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { auth } from '@/lib/auth';
import { claimCheckoutSession } from '@/lib/billing-claim';
import { pendingGuestCheckout, protectUnclaimedTrial, type CheckoutClaimResult } from '@/lib/billing-guest';
import { readCheckoutIntent } from '@/lib/checkout-intent';
import { PendingCheckoutActions } from './pending-checkout-actions';

export const metadata = { title: 'Connect your Brocco trial', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId = '' } = await searchParams;
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  const callbackURL = `/billing/success?session_id=${encodeURIComponent(sessionId)}`;
  let reason = '';
  let canCancel = false;
  let protectedTrial = false;
  try {
    const request = new Request(process.env.APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000', { headers: requestHeaders });
    const pending = await pendingGuestCheckout(sessionId, readCheckoutIntent(request)?.id || null);
    if (pending) {
      canCancel = pending.subscription.status !== 'canceled';
      await protectUnclaimedTrial(pending.subscription);
      protectedTrial = pending.subscription.status === 'trialing';
    }
  } catch { /* A billing outage must not claim that a card or trial is confirmed. */ }
  if (session?.user) {
    let result: CheckoutClaimResult;
    try { result = await claimCheckoutSession(sessionId, session.user); } catch { result = { ok: false, reason: 'invalid' }; }
    if (result.ok) redirect('/app');
    reason = result.reason;
  }
  const detail = reason === 'email_mismatch'
    ? 'The verified account email does not match the email entered in Stripe Checkout. Use that same email to continue. Apple Hide My Email may use a different address; you can switch to an email sign-in link.'
    : reason === 'verify_email'
      ? 'Verify the email you used in Stripe Checkout before connecting this subscription. You can continue with an email sign-in link.'
      : reason === 'trial_used'
        ? 'Your account has already used a trial. We canceled this duplicate trial, so it will not renew. Open your account to manage your existing subscription, or contact help@brocco.dev to restart a paid plan.'
        : reason === 'canceled'
          ? 'This trial has been canceled. No new subscription was created. Contact help@brocco.dev if you would like to restart a paid plan.'
            : reason === 'duplicate_paid'
              ? 'We found an existing subscription. Please contact help@brocco.dev to review the duplicate checkout before connecting it. We have not issued another charge or refund.'
              : reason === 'claim_pending'
                ? 'Your earlier checkout is still being connected. Try confirming again to resume it. This unconnected trial remains scheduled to cancel without renewal.'
            : reason
              ? 'We could not confirm this checkout. Try again, or contact help@brocco.dev. Checking this page does not create another subscription.'
              : 'Create or sign in to your Brocco account using the same email you entered in Stripe Checkout. Use an available sign-in option or a verified email link. Apple Hide My Email must match the checkout address.';
  return <><Nav /><main className="container-x flex min-h-screen flex-col items-center justify-center py-32 text-center">
    <h1 className="text-display-lg">{reason ? 'Connect your checkout' : 'Connect your Brocco account'}</h1>
    <p className="mt-4 max-w-xl text-ink-dim">{detail}</p>
    {protectedTrial && <p className="mt-4 max-w-xl text-sm text-ink-dim">Until you connect your account, this trial is scheduled to cancel at the end of seven days. Connecting enables the subscription renewal you accepted in Stripe.</p>}
    <PendingCheckoutActions sessionId={sessionId} callbackURL={callbackURL} signedIn={Boolean(session?.user)} canCancel={canCancel} />
    {reason && <a className="mt-5 text-sm underline" href={callbackURL}>Try confirming again</a>}
    {session?.user && <Link className="mt-6 text-sm underline" href="/account">Manage your existing account</Link>}
    <a className="mt-5 text-sm text-ink-dim underline" href="mailto:help@brocco.dev">Get billing help</a>
  </main><Footer /></>;
}

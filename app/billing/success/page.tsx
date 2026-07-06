import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { SuccessTracker } from './success-tracker';
import { AutoSignin } from './auto-signin';
import { claimCheckoutSession } from '@/lib/billing-claim';

export const metadata = {
  title: 'Welcome to brocco',
  description: 'Subscription confirmed.',
  robots: { index: false, follow: false },
};

// This page reads the live Stripe session and writes to the DB, so it must run
// per-request (never static / prerendered).
export const dynamic = 'force-dynamic';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;
  const sessionId = sp.session_id || '';
  const claim = sessionId
    ? await claimCheckoutSession(sessionId)
    : { ok: false as const };

  // Happy path: Stripe confirmed the checkout, we created the account + a
  // magic-link, and the browser will be redirected through better-auth's verify
  // endpoint (sets the session cookie) onto /app, signed in.
  if (claim.ok && claim.verifyUrl) {
    return (
      <>
        <Nav />
        <AutoSignin verifyUrl={claim.verifyUrl} sessionId={sessionId} plan={claim.plan} />
        <main className="flex min-h-[calc(100vh-200px)] items-center justify-center pt-32">
          <div className="container-x text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
            </div>
            <h1 className="mt-6 text-display-lg text-grad">You are in.</h1>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-dim">
              Subscription confirmed. Signing you in…
            </p>
            {/* Manual fallback in case the auto-redirect is blocked. */}
            <Link href={claim.verifyUrl} className="btn-primary mt-8 inline-flex">
              Continue to the app <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Fallback: the payment likely went through, but we couldn't auto-create the
  // session (missing session_id, Stripe not configured, or a DB hiccup). Keep
  // the conversion pixel and route the buyer to the email sign-in so they're
  // never stuck after paying.
  return (
    <>
      <Nav />
      <SuccessTracker plan={claim.ok ? claim.plan : undefined} />
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center pt-32">
        <div className="container-x text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
            <CheckCircle2 className="h-6 w-6 text-emerald-300" />
          </div>
          <h1 className="mt-6 text-display-lg text-grad">You are in.</h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-dim">
            Subscription confirmed. A receipt is on its way to your inbox. Sign in with the same
            email to open your dashboard on any device.
          </p>
          <Link href="/login" className="btn-primary mt-8 inline-flex">
            Sign in to open the app <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

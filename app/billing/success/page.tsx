import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { auth } from '@/lib/auth';
import { claimCheckoutSession } from '@/lib/billing-claim';

export const metadata = { title: 'Confirm your Brocco trial', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId = '' } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(`/login?callbackURL=${encodeURIComponent(`/billing/success?session_id=${encodeURIComponent(sessionId)}`)}`);
  let confirmed = false;
  try { confirmed = (await claimCheckoutSession(sessionId, session.user)).ok; } catch { /* Never claim that an unverified payment succeeded. */ }
  if (confirmed) redirect('/app');
  return <><Nav /><main className="container-x flex min-h-screen flex-col items-center justify-center py-32 text-center">
    <h1 className="text-display-lg">Check your subscription</h1>
    <p className="mt-4 max-w-lg text-ink-dim">We could not confirm this checkout. Open your dashboard to check your subscription, or manage billing from your account. You will not be charged again by checking.</p>
    <Link className="btn-primary mt-8" href="/app">Check dashboard access</Link>
  </main><Footer /></>;
}

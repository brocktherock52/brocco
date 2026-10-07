import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { TrialSetup } from '@/components/billing/trial-setup';
import { Logomark } from '@/components/logo';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Start your dashboard trial', robots: { index: false, follow: false } };

export default async function StartPage({ searchParams }: {
  searchParams: Promise<{ tier?: string; interval?: string }>;
}) {
  const params = await searchParams;
  const tier = ['solo', 'team', 'wholesaler'].includes(params.tier || '') ? params.tier! : 'solo';
  const interval = tier === 'wholesaler' ? 'monthly' : params.interval === 'annual' ? 'annual' : 'monthly';
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(`/signup?callbackURL=${encodeURIComponent(`/start?tier=${tier}&interval=${interval}`)}`);
  return <main className="min-h-screen bg-bg-0 px-6 py-12 text-ink">
    <div className="mx-auto max-w-2xl">
      <Link href="/" className="inline-flex items-center gap-2 font-semibold"><Logomark className="h-8 w-8" />brocco.dev</Link>
      <p className="mt-12 font-mono text-sm text-cyan-glow">Account created · Step 2 of 2</p>
      <h1 className="mt-4 text-display-lg">Explore your dashboard.</h1>
      <p className="mt-4 text-base text-ink-dim">Add your card in secure Stripe Checkout to begin a seven-day dashboard trial. Running a tool requires starting your paid subscription.</p>
      <TrialSetup initialTier={tier} initialInterval={interval} />
    </div>
  </main>;
}

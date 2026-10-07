'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { useSession, signOut } from '@/lib/auth-client';
import { fetchBillingAccess, formatSubscriptionPrice, type BillingAccess } from '@/lib/billing-client';
import { ToolPaywall } from '@/components/billing/tool-paywall';
import { getUsage, type Usage } from '@/lib/usage';
import { resetUser } from '@/components/posthog-provider';

export default function AccountPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [access, setAccess] = useState<BillingAccess | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [busy, setBusy] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { setUsage(getUsage()); }, []);
  useEffect(() => {
    if (isPending) return;
    if (!session?.user) { router.replace('/login?callbackURL=%2Faccount'); return; }
    setError(null);
    fetchBillingAccess().then(setAccess).catch((e) => setError(e.message));
  }, [isPending, session?.user?.id, router, attempt]);
  async function manageBilling() {
    setBusy(true); setError(null);
    try {
      const response = await fetch('/api/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.detail || 'Could not open billing. Please retry.');
      window.location.assign(data.url);
    } catch (e) { setError(e instanceof Error ? e.message : 'Please retry.'); setBusy(false); }
  }
  return <><Nav /><main className="mx-auto min-h-screen max-w-3xl px-6 pb-16 pt-32 text-ink">
    <h1 className="text-display-lg">Your account</h1>
    {!session?.user ? <p role="status" className="mt-8">Checking your account...</p> : <>
      <p className="mt-4 text-base text-ink-dim">{session.user.email}</p>
      <section className="mt-8 rounded-2xl border border-border-strong bg-bg-1 p-6">
        <h2 className="text-xl font-semibold">Subscription</h2>
        {!access ? <p className="mt-4">Checking billing status...</p> : <>
          <p className="mt-4 text-lg capitalize">{access.plan || 'No plan'} {access.plan && `· ${access.status.replaceAll('_', ' ')}`}</p>
          {access.price && <p className="mt-2 text-ink-dim">{formatSubscriptionPrice(access.price)}</p>}
          {access.status === 'trialing' && <p className="mt-4 text-base text-ink-dim">Your dashboard trial ends {access.trialEndsAt ? new Date(access.trialEndsAt).toLocaleString() : 'seven days after checkout'}. Your subscription renews automatically unless canceled. Running tools now requires confirming payment and ending the trial early.</p>}
          {access.status === 'payment_required' && <p className="mt-4 text-accent-gold">Payment needs attention. Tools remain locked until payment succeeds.</p>}
          {access.status === 'canceled' && <p className="mt-4 text-ink-dim">Your subscription has ended. Start a plan to use tools again.</p>}
          {access.canUseTools && <p className="mt-4 text-accent-green">Payment confirmed. Tools are unlocked.</p>}
          <div className="mt-6 flex flex-wrap gap-4">
            {access.subscriptionId ? <button disabled={busy} className="btn-primary" onClick={manageBilling}>{busy ? 'Opening billing...' : 'Manage or cancel subscription'}</button> : <Link className="btn-primary" href="/start">Start 7-day trial</Link>}
            {access.status === 'trialing' && <button className="btn-ghost" onClick={() => setPaywall(true)}>Unlock tools now</button>}
            {access.paymentUrl && <a className="btn-ghost" href={access.paymentUrl}>Complete payment</a>}
          </div>
          <p className="mt-4 text-sm text-ink-faint">Use Stripe billing to update your card, view invoices, or cancel.</p>
        </>}
      </section>
      <section className="mt-6 rounded-2xl border border-border bg-bg-1 p-6"><h2 className="text-xl font-semibold">Runs on this device</h2><p className="mt-3 text-base text-ink-dim">{usage?.month_runs ?? 0} runs recorded this month. This local activity count does not determine your subscription access.</p></section>
      <div className="mt-6 flex flex-wrap items-center gap-4"><Link href="/app" className="btn-primary">Open dashboard</Link><button className="btn-ghost" onClick={() => signOut({ fetchOptions: { onSuccess: () => { resetUser(); window.location.href = '/'; } } })}>Sign out</button></div>
    </>}
    {error && <div role="alert" className="mt-6 text-accent-gold"><p>{error}</p><button className="mt-2 underline" onClick={() => setAttempt((n) => n + 1)}>Retry billing status</button></div>}
    <ToolPaywall open={paywall} onClose={() => setPaywall(false)} onActivated={setAccess} source="account" />
  </main><Footer /></>;
}

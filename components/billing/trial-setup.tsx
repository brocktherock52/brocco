'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import { fetchBillingAccess, type BillingAccess } from '@/lib/billing-client';

type Plan = { tier: string; interval: string; amount: number; currency: string; available: boolean };
export function TrialSetup({ initialTier, initialInterval }: { initialTier: string; initialInterval: string }) {
  const router = useRouter();
  const [tier, setTier] = useState(initialTier);
  const [interval, setInterval] = useState(initialInterval);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [hostedAvailable, setHostedAvailable] = useState(false);
  const [access, setAccess] = useState<BillingAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    setLoading(true); setError(null);
    Promise.all([fetchBillingAccess(), fetch('/api/billing/plans', { cache: 'no-store' }).then(async (r) => {
      const body = await r.json();
      if (!r.ok) throw new Error(body.detail || 'Plan pricing is temporarily unavailable.');
      return { plans: body.plans as Plan[], hostedAvailable: body.hostedAvailable === true };
    })]).then(([billing, prices]) => {
      if (!current) return;
      setAccess(billing); setPlans(prices.plans); setHostedAvailable(prices.hostedAvailable);
      if (billing.canUseTools || billing.status === 'trialing') router.replace('/app');
    }).catch((e) => { if (current) setError(e.message); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [router, attempt]);
  const selected = plans.find((p) => p.tier === tier && p.interval === interval && p.available);
  const price = selected ? new Intl.NumberFormat('en-US', { style: 'currency', currency: selected.currency }).format(selected.amount / 100) : null;
  async function checkout() {
    if (busy || !selected) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier, interval }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || 'Checkout is temporarily unavailable.');
      if (!data.url) throw new Error('Checkout could not be opened. Please retry.');
      window.location.assign(data.url);
    } catch (e) { setError(e instanceof Error ? e.message : 'Please retry.'); setBusy(false); }
  }
  if (loading) return <p className="mt-8 flex items-center gap-2" role="status"><Loader2 className="h-5 w-5 animate-spin" />Checking account and pricing...</p>;
  return <section className="mt-8 rounded-2xl border border-border-strong bg-bg-1 p-6">
    {access?.status === 'payment_required' ? <><h2 className="text-xl font-semibold">Your subscription needs attention</h2><p className="mt-3 text-ink-dim">Update your payment method or complete your outstanding payment. Your existing subscription will be preserved.</p><Link className="btn-primary mt-6" href="/account">Manage billing</Link>{access.paymentUrl && <a className="mt-4 block text-cyan-glow underline" href={access.paymentUrl}>Complete secure payment</a>}</> : <>
      {!hostedAvailable && <p className="mb-6 rounded-xl border border-accent-gold/30 p-4 text-base text-ink">Live tools currently require your own Anthropic or xAI API key. Your AI provider bills usage separately from your Brocco subscription. Connect your key in the dashboard before running tools.</p>}
      <label className="block text-base font-medium" htmlFor="trial-plan">Choose your plan</label>
      <select id="trial-plan" value={tier} disabled={busy} onChange={(e) => { setTier(e.target.value); if (e.target.value === 'wholesaler') setInterval('monthly'); }} className="mt-2 w-full rounded-xl border border-border-strong bg-bg-2 p-3">
        <option value="solo">Solo</option><option value="team">Team</option>{initialTier === 'wholesaler' && <option value="wholesaler">Wholesaler</option>}
      </select>
      <fieldset disabled={busy} className="mt-6"><legend className="text-base font-medium">Billing interval</legend><div className="mt-2 flex gap-6"><label className="flex items-center gap-2"><input type="radio" name="interval" checked={interval === 'monthly'} onChange={() => setInterval('monthly')} />Monthly</label>{tier !== 'wholesaler' && <label className="flex items-center gap-2"><input type="radio" name="interval" checked={interval === 'annual'} onChange={() => setInterval('annual')} />Annual</label>}</div></fieldset>
      <p className="mt-6 text-2xl font-semibold">{price ? `${price} / ${interval === 'annual' ? 'year' : 'month'}` : 'This plan is currently unavailable'}</p>
      <p className="mt-3 text-base text-ink-dim">$0 for seven days of dashboard access. Card required. {price && `Then ${price} every ${interval === 'annual' ? 'year' : 'month'}, unless canceled before the trial ends.`} Tools remain locked during the trial. You can choose to end it early and pay to unlock them.</p>
      <button className="btn-primary mt-6 w-full justify-center disabled:opacity-50" disabled={!selected || busy} onClick={checkout}>{busy ? 'Opening secure checkout...' : 'Start 7-day trial'}</button>
      <p className="mt-4 flex items-center gap-2 text-sm text-ink-dim"><ShieldCheck className="h-4 w-4" />Your card is entered and stored securely by Stripe.</p>
      <p className="mt-4 text-sm text-ink-faint">Review the <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy policy</Link>. Manage or cancel your subscription in your account.</p>
    </>}
    {error && <div role="alert" className="mt-4 text-accent-gold"><p>{error}</p><button className="mt-2 underline" onClick={() => setAttempt((n) => n + 1)}>Retry account and pricing</button></div>}
  </section>;
}

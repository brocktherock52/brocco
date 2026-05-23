'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles, Shield } from 'lucide-react';

interface Props {
  tier: 'solo' | 'team';
  name: string;
  monthly: number;
  annual: number;
  perks: string[];
  bestFor: string;
  tagline: string;
}

export function CheckoutClient({ tier, name, monthly, annual, perks, bestFor, tagline }: Props) {
  // Default to annual (the better-value path that prepays). The upsell on this
  // page is mostly "switch to annual and save."
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');
  const [community, setCommunity] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = interval === 'monthly' ? monthly : annual;
  const savings = useMemo(() => {
    if (interval !== 'annual') return null;
    const yearMonthly = monthly * 12;
    const yearAnnual = annual * 12;
    const saved = yearMonthly - yearAnnual;
    return saved > 0 ? saved : null;
  }, [interval, monthly, annual]);

  async function go() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval }),
      });
      const data = (await res.json()) as { url?: string; error?: string; detail?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.detail || data.error || 'checkout temporarily unavailable.');
    } catch {
      setError('network error. please retry.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-[1fr_360px]">
      {/* Tier summary card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card overflow-hidden p-7 md:p-8"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-glow">{name} tier</p>
        <h2 className="mt-2 text-[24px] font-semibold tracking-tight">{tagline}</h2>
        <p className="mt-1.5 text-[13.5px] text-ink-faint">{bestFor}</p>

        <ul className="mt-6 space-y-2.5">
          {perks.map((p) => (
            <li key={p} className="flex items-start gap-2 text-[14px] text-ink-dim">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">add ons</p>

          {/* Annual upgrade upsell. Inactive when already annual. */}
          <button
            type="button"
            onClick={() => setInterval((curr) => (curr === 'annual' ? 'monthly' : 'annual'))}
            className={`mt-3 flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
              interval === 'annual'
                ? 'border-emerald-400/40 bg-emerald-400/[0.06]'
                : 'border-white/[0.10] bg-white/[0.02] hover:bg-white/[0.05]'
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                interval === 'annual'
                  ? 'border-emerald-400/60 bg-emerald-400/20 text-emerald-300'
                  : 'border-white/[0.16] bg-white/[0.04]'
              }`}
            >
              {interval === 'annual' ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <span className="flex-1">
              <span className="block text-[13.5px] font-medium">
                Switch to annual. {savings ? `Save $${savings} / year.` : 'Save 17%.'}
              </span>
              <span className="block text-[12.5px] text-ink-faint">
                ${annual}/mo billed yearly. Or ${monthly}/mo billed monthly.
              </span>
            </span>
          </button>

          {/* Community upsell. Adds the Brocco Builders Discord. */}
          <button
            type="button"
            onClick={() => setCommunity((c) => !c)}
            className={`mt-2 flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
              community
                ? 'border-violet-400/40 bg-violet-400/[0.06]'
                : 'border-white/[0.10] bg-white/[0.02] hover:bg-white/[0.05]'
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                community
                  ? 'border-violet-400/60 bg-violet-400/20 text-violet-300'
                  : 'border-white/[0.16] bg-white/[0.04]'
              }`}
            >
              {community ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            <span className="flex-1">
              <span className="block text-[13.5px] font-medium">
                Add Brocco Builders community (Discord + weekly office hours).
              </span>
              <span className="block text-[12.5px] text-ink-faint">
                Auto-invite arrives after checkout. Cancel anytime.
              </span>
            </span>
          </button>
        </div>
      </motion.div>

      {/* Order summary + go button */}
      <motion.aside
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="sticky top-24 self-start"
      >
        <div className="card overflow-hidden p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">order summary</p>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-[38px] font-bold tracking-tight tabular-nums">${price}</span>
            <span className="text-[12.5px] text-ink-faint">
              / mo{interval === 'annual' ? ', billed yearly' : ''}
            </span>
          </div>

          <ul className="mt-5 space-y-2 border-t border-white/[0.06] pt-4 text-[12.5px] text-ink-dim">
            <li className="flex justify-between gap-3">
              <span>{name} tier ({interval})</span>
              <span className="font-mono tabular-nums">${price}/mo</span>
            </li>
            {community ? (
              <li className="flex justify-between gap-3">
                <span>Brocco Builders community</span>
                <span className="font-mono tabular-nums">included</span>
              </li>
            ) : null}
            <li className="flex justify-between gap-3 font-medium text-white">
              <span>charged today</span>
              <span className="font-mono tabular-nums">$0.00</span>
            </li>
          </ul>

          <button
            type="button"
            onClick={go}
            disabled={busy}
            className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-cyan px-5 py-3.5 text-[14.5px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            <span>{busy ? 'opening secure checkout' : 'start 7-day trial'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          {error ? (
            <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-3 py-2 text-[12.5px] text-amber-200">
              {error}
            </p>
          ) : null}

          <div className="mt-5 grid gap-2 border-t border-white/[0.06] pt-4 text-[12px] text-ink-faint">
            <span className="inline-flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-cyan-glow" />
              checkout secured by Stripe
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              your data never trains a model
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-violet-300" />
              cancel anytime in one click
            </span>
          </div>
        </div>

        {community ? (
          <p className="mt-3 text-center text-[11.5px] text-ink-faint">
            Community access added. Discord invite arrives within 5 minutes of payment.
          </p>
        ) : null}
      </motion.aside>
    </div>
  );
}

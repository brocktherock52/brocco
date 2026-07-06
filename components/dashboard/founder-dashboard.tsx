'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Activity,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { Logomark } from '@/components/logo';

interface Metrics {
  generatedAt: string;
  mrr: number;
  arr: number;
  mrrSource: 'stripe' | 'estimate' | 'estimate_stripe_error';
  activeSubscriptions: number;
  trialing: number | null;
  trialingMrr: number | null;
  totalUsers: number;
  paidUsers: number;
  byPlan: Record<string, number>;
  activeSessionUsers: number;
  signups: { d1: number; d7: number; d30: number };
  threads: { total: number; d7: number };
  recentSignups: Array<{
    email: string;
    name: string | null;
    plan: string | null;
    emailVerified: boolean;
    createdAt: string;
  }>;
}

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function FounderDashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/founder/metrics', { cache: 'no-store' });
      if (res.status === 403) {
        setError('This dashboard is founder-only.');
        setData(null);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || `Failed to load metrics (${res.status}).`);
        return;
      }
      setData((await res.json()) as Metrics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error loading metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const paidPct = data && data.totalUsers > 0 ? (data.paidUsers / data.totalUsers) * 100 : 0;
  const live = data?.mrrSource === 'stripe';

  return (
    <div className="min-h-screen bg-bg-0 text-ink">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-bg-1/70 px-4 backdrop-blur-xl">
        <Link href="/app" className="inline-flex items-center gap-2 text-[13px] text-ink-dim hover:text-white">
          <ArrowLeft className="h-4 w-4" /> back to app
        </Link>
        <span className="hidden h-5 w-px bg-white/[0.10] md:block" />
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-tight">
          <Logomark className="h-5 w-5" />
          founder<span className="text-ink-faint">.metrics</span>
        </span>
        <button
          onClick={load}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-[12px] text-ink-dim hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          refresh
        </button>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.05] px-5 py-4 text-[13.5px] text-rose-200">
            {error}
          </div>
        ) : loading && !data ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* hero MRR / ARR */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Kpi
                icon={<DollarSign className="h-4 w-4" />}
                label="MRR"
                value={money(data.mrr)}
                accent="from-brand to-cyan"
                sub={
                  live ? (
                    <span className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> live from Stripe ·{' '}
                        {data.activeSubscriptions} active sub{data.activeSubscriptions === 1 ? '' : 's'}
                      </span>
                      {!!data.trialing && data.trialing > 0 && (
                        <span className="text-cyan-glow">
                          {data.trialing} on trial → {money(data.trialingMrr ?? 0)}/mo when they convert
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-amber-300/90">
                      estimated from plan tiers{data.mrrSource === 'estimate_stripe_error' ? ' (Stripe unavailable)' : ''}
                    </span>
                  )
                }
                big
              />
              <Kpi
                icon={<TrendingUp className="h-4 w-4" />}
                label="ARR (run-rate)"
                value={money(data.arr)}
                accent="from-cyan to-emerald-400"
                sub={<span className="text-ink-faint">MRR × 12</span>}
                big
              />
            </div>

            {/* explain the common "paid users but $0 MRR" confusion */}
            {live && data.mrr === 0 && data.paidUsers > 0 && (
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-3 text-[12.5px] leading-snug text-cyan-100/90">
                <span className="font-semibold">
                  {data.paidUsers} paid user{data.paidUsers === 1 ? '' : 's'}, $0 MRR?
                </span>{' '}
                {data.trialing && data.trialing > 0
                  ? `That's expected: ${data.trialing} ${data.trialing === 1 ? 'is' : 'are'} on a free trial and pay $0 until the trial converts. MRR only counts active paying subscriptions. When ${data.trialing === 1 ? 'it converts' : 'they convert'}, MRR becomes ${money(data.trialingMrr ?? 0)}/mo.`
                  : `These accounts have no active Stripe subscription (likely comped or a test checkout), so they contribute $0 to MRR. MRR counts only live paying subscriptions.`}
              </div>
            )}

            {/* user KPIs */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Kpi icon={<Users className="h-4 w-4" />} label="Total users" value={data.totalUsers.toLocaleString()} />
              <Kpi
                icon={<Wallet className="h-4 w-4" />}
                label="Paid users"
                value={data.paidUsers.toLocaleString()}
                sub={<span className="text-ink-faint">{paidPct.toFixed(1)}% conversion</span>}
              />
              <Kpi
                icon={<Activity className="h-4 w-4" />}
                label="Active now"
                value={data.activeSessionUsers.toLocaleString()}
                sub={<span className="text-ink-faint">live sessions</span>}
              />
              <Kpi
                icon={<Users className="h-4 w-4" />}
                label="New (7d)"
                value={data.signups.d7.toLocaleString()}
                sub={<span className="text-ink-faint">{data.signups.d1} today</span>}
              />
            </div>

            {/* plan breakdown */}
            <Panel title="Plan mix">
              <div className="space-y-2.5">
                {(['free', 'solo', 'team'] as const).map((plan) => {
                  const n = data.byPlan[plan] ?? 0;
                  const pct = data.totalUsers > 0 ? (n / data.totalUsers) * 100 : 0;
                  const color =
                    plan === 'team' ? 'bg-brand' : plan === 'solo' ? 'bg-cyan' : 'bg-white/20';
                  return (
                    <div key={plan} className="flex items-center gap-3">
                      <span className="w-12 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                        {plan}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(pct, n > 0 ? 2 : 0)}%` }} />
                      </div>
                      <span className="w-20 text-right text-[12.5px] text-ink-dim">
                        {n.toLocaleString()} <span className="text-ink-faint">· {pct.toFixed(0)}%</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* growth + engagement */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Panel title="Signups">
                <Stat label="last 24h" value={data.signups.d1} />
                <Stat label="last 7 days" value={data.signups.d7} />
                <Stat label="last 30 days" value={data.signups.d30} />
              </Panel>
              <Panel title="Projects (engagement)">
                <Stat label="total projects" value={data.threads.total} />
                <Stat label="created last 7 days" value={data.threads.d7} />
                <Stat
                  label="projects / paid user"
                  value={data.paidUsers > 0 ? Math.round((data.threads.total / data.paidUsers) * 10) / 10 : 0}
                />
              </Panel>
            </div>

            {/* full signup trail */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
                  signup trail
                </p>
                <span className="font-mono text-[10.5px] text-ink-faint">
                  {data.recentSignups.length} shown{data.totalUsers > data.recentSignups.length ? ` of ${data.totalUsers}` : ''}
                </span>
              </div>
              {data.recentSignups.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-ink-faint">No signups yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-white/[0.06] font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                        <th className="py-2 pr-3 font-normal">when</th>
                        <th className="py-2 pr-3 font-normal">email</th>
                        <th className="py-2 pr-3 font-normal">name</th>
                        <th className="py-2 pr-3 font-normal">plan</th>
                        <th className="py-2 font-normal">verified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentSignups.map((u, i) => (
                        <tr key={`${u.email}-${i}`} className="border-b border-white/[0.04] last:border-0">
                          <td className="whitespace-nowrap py-2 pr-3 text-ink-dim" title={new Date(u.createdAt).toLocaleString()}>
                            {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-2 pr-3 text-ink">{u.email}</td>
                          <td className="py-2 pr-3 text-ink-dim">{u.name || '-'}</td>
                          <td className="py-2 pr-3">
                            <span
                              className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                                u.plan === 'team'
                                  ? 'bg-brand/15 text-brand-glow'
                                  : u.plan === 'solo'
                                    ? 'bg-cyan/15 text-cyan-glow'
                                    : 'bg-white/[0.06] text-ink-faint'
                              }`}
                            >
                              {u.plan || 'free'}
                            </span>
                          </td>
                          <td className="py-2">
                            {u.emailVerified ? (
                              <span className="text-emerald-300">yes</span>
                            ) : (
                              <span className="text-ink-faint">no</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              snapshot {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  accent,
  big,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
  accent?: string;
  big?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4"
    >
      {accent && (
        <div aria-hidden className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent}`} />
      )}
      <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
        <span className="text-brand-glow">{icon}</span>
        {label}
      </div>
      <div className={`mt-2 font-semibold text-ink ${big ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>{value}</div>
      {sub && <div className="mt-1.5 text-[11.5px]">{sub}</div>}
    </motion.div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5 text-[13px] last:border-0 last:pb-0">
      <span className="text-ink-dim">{label}</span>
      <span className="font-semibold text-ink">{value.toLocaleString()}</span>
    </div>
  );
}

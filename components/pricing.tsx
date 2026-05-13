'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { trackPixel } from './meta-pixel';
import { trackEvent } from './posthog-provider';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from './ui/animated-number';
import { SpotlightCard } from './ui/spotlight-card';

type Interval = 'monthly' | 'annual';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    desc: 'For solo builders kicking the tires.',
    monthly: 0,
    annual: 0,
    cta: { label: 'Open the app', href: '/app', primary: false },
    features: [
      '100 agent runs / month (BYOK, your tokens)',
      '1 agent at a time',
      'All built-in tools',
      'Community support',
    ],
  },
  {
    id: 'solo',
    name: 'Solo',
    desc: 'For founders running ops with agents.',
    monthly: 49,
    annual: 41,
    cta: { label: 'Subscribe Solo', tier: 'solo' as const, primary: false },
    features: [
      '2,000 runs / month (we cover tokens)',
      '5 agents in parallel',
      'All integrations',
      'Custom tools (Python factories)',
      'Email support',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    desc: 'For ops teams replacing entire workflows.',
    monthly: 199,
    annual: 166,
    popular: true,
    cta: { label: 'Subscribe Team', tier: 'team' as const, primary: true },
    features: [
      '10,000 runs / month (we cover tokens)',
      'Unlimited agents',
      '5 seats',
      'SSO + audit logs',
      'Slack support, 1-hour SLA',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    desc: 'For scale, compliance, on-prem.',
    monthly: -1,
    annual: -1,
    cta: {
      label: 'Talk to sales',
      href: 'mailto:help@brocco.dev?subject=Brocco%20Enterprise',
      primary: false,
    },
    features: [
      'Unlimited runs and seats',
      'SSO / SCIM / RBAC',
      'SOC 2 Type II report',
      'BYOK + on-prem deploy',
      'Dedicated solutions engineer',
    ],
  },
];

export function Pricing({ standalone = false }: { standalone?: boolean }) {
  const [interval, setInterval] = useState<Interval>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  async function checkout(tier: 'solo' | 'team') {
    setLoading(tier);
    const value =
      tier === 'team'
        ? interval === 'annual'
          ? 1990
          : 199
        : interval === 'annual'
          ? 490
          : 49;
    trackPixel('InitiateCheckout', {
      content_name: tier,
      content_category: 'subscription',
      currency: 'USD',
      value,
    });
    trackEvent('initiate_checkout', { tier, interval, value, currency: 'USD' });
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tier, interval }),
      });
      const data = await r.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error('Checkout offline', {
        description: data.detail || 'Email help@brocco.dev to start a paid plan.',
      });
    } catch (_) {
      toast.error('Could not reach checkout. Try again in a moment.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className={cn('relative py-24 md:py-32', standalone && 'pt-32 md:pt-40')}>
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto">pricing</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">simple. transparent.</span>{' '}
            <span className="text-grad-brand">free to start.</span>
          </h2>
          <p className="mt-4 text-[16px] text-ink-dim">
            byok on free, hosted runs on paid, custom on enterprise. cancel anytime, prorated
            refund.
          </p>

          {/* Sliding-pill billing toggle (shared layout) */}
          <div className="mx-auto mt-7 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 text-[13px]">
            <button
              onClick={() => setInterval('monthly')}
              className={cn(
                'relative rounded-full px-4 py-1.5 font-medium transition-colors',
                interval === 'monthly' ? 'text-white' : 'text-ink-dim hover:text-white',
              )}
            >
              {interval === 'monthly' && (
                <motion.span
                  layoutId="billing-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.10]"
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              )}
              <span className="relative z-10">Monthly</span>
            </button>
            <button
              onClick={() => setInterval('annual')}
              className={cn(
                'relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium transition-colors',
                interval === 'annual' ? 'text-white' : 'text-ink-dim hover:text-white',
              )}
            >
              {interval === 'annual' && (
                <motion.span
                  layoutId="billing-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.10]"
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                Annual
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-px text-[10px] font-semibold text-emerald-300">
                  save 17%
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t, i) => {
            const isCustom = t.monthly === -1;
            const price = interval === 'monthly' ? t.monthly : t.annual;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                style={{ perspective: 1000 }}
              >
                <SpotlightCard
                  tilt={!t.popular}
                  spotlightSize={420}
                  spotlightColor={
                    t.popular ? 'rgba(124, 58, 237, 0.28)' : 'rgba(167, 139, 250, 0.16)'
                  }
                  className={cn(
                    'card relative flex h-full flex-col p-6',
                    t.popular && 'border-brand/40 ring-1 ring-brand/40 shadow-glow',
                  )}
                >
                  {t.popular && (
                    <motion.span
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand to-cyan px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-glow2"
                    >
                      Most popular
                    </motion.span>
                  )}

                  <h3 className="text-[18px] font-semibold tracking-tight">{t.name}</h3>
                  <p className="mt-1 min-h-[40px] text-[13px] text-ink-dim">{t.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    {isCustom ? (
                      <span className="text-[28px] font-bold tracking-tight">Custom</span>
                    ) : (
                      <>
                        <span className="text-[42px] font-bold tracking-tight tabular-nums">
                          $
                          <AnimatedNumber
                            value={price}
                            duration={0.55}
                            format={(v) => `${Math.round(v)}`}
                          />
                        </span>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={interval}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="text-[13px] text-ink-faint"
                          >
                            / mo{interval === 'annual' && t.monthly > 0 ? ', billed yearly' : ''}
                          </motion.span>
                        </AnimatePresence>
                      </>
                    )}
                  </div>

                  {'href' in t.cta ? (
                    <Link
                      href={t.cta.href as string}
                      className={cn('mt-5 w-full', t.cta.primary ? 'btn-primary' : 'btn-ghost')}
                    >
                      <span>{t.cta.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => checkout(t.cta.tier!)}
                      disabled={loading === t.cta.tier}
                      className={cn('mt-5 w-full', t.cta.primary ? 'btn-primary' : 'btn-ghost')}
                    >
                      {loading === t.cta.tier ? (
                        <span className="inline-flex items-center gap-2">
                          <Sparkles className="h-4 w-4 animate-pulse" /> Loading...
                        </span>
                      ) : (
                        <span>{t.cta.label}</span>
                      )}
                    </button>
                  )}

                  <ul className="mt-6 space-y-2.5">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13.5px] text-ink-dim">
                        <Check className="mt-[2px] h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-ink-faint">
          <Trust>SOC 2 Type II in progress</Trust>
          <Trust>GDPR compliant</Trust>
          <Trust>Your data never trains a model</Trust>
          <Trust>99.9% uptime SLA</Trust>
          <Trust>Encrypted at rest and in transit</Trust>
        </div>
      </div>
    </section>
  );
}

function Trust({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3 w-3 text-emerald-400" />
      {children}
    </span>
  );
}

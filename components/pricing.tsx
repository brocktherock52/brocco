'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import { trackPixel } from './meta-pixel';
import { trackEvent } from './posthog-provider';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from './ui/animated-number';
import { SpotlightCard } from './ui/spotlight-card';

type Interval = 'monthly' | 'annual';

// Tiers are data-driven so a new ladder (e.g. a $10/$20 BYOK structure) is a
// data swap, not a redesign. `value` is the psychological anchor line under the
// price; `highlight` makes one plan the visual focal point.
const TIERS = [
  {
    id: 'free',
    name: 'Free',
    desc: 'Kick the tires with your own key.',
    value: 'No card. Ever.',
    monthly: 0,
    annual: 0,
    cta: { label: 'Start free', href: '/signup', primary: false },
    features: [
      'The core agent cast',
      '100 agent runs / month (BYOK)',
      '3 agents in parallel',
      'All built-in tools',
    ],
  },
  {
    id: 'solo',
    name: 'Solo',
    desc: 'Your AI ops team, on tap.',
    value: 'About $1.60 a day.',
    monthly: 49,
    annual: 41,
    popular: true,
    cta: { label: 'Start Solo trial', tier: 'solo' as const, primary: true },
    features: [
      'Unlock all agents + hundreds of skills',
      '2,000 runs / month (we cover tokens)',
      '8 agents in parallel',
      'Custom tools + all integrations',
      'Mission Control + priority support',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    desc: 'Replace an entire workflow.',
    value: '5 seats. ~$40 a seat.',
    monthly: 199,
    annual: 166,
    cta: { label: 'Get Team', tier: 'team' as const, primary: false },
    features: [
      'Everything in Solo, for the whole team',
      '10,000 runs / month (we cover tokens)',
      'Unlimited agents, 5 seats',
      'SSO + audit logs',
      'Slack support, 1-hour response',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    desc: 'Scale, security, on-prem.',
    value: 'Built around you.',
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
      'BYOK + on-prem deploy',
      'Security review + DPA on request',
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
    window.location.href = `/checkout/${tier}`;
  }

  return (
    <section
      id="pricing"
      className={cn('relative overflow-hidden py-24 md:py-32', standalone && 'pt-32 md:pt-40')}
    >
      {/* Vegas glow: layered radial light behind the grid so the section reads as
          the brightest, most important moment on the page. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closed,_circle)] opacity-60 blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(34,211,238,0.10) 38%, transparent 70%)',
          }}
        />
      </div>

      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto">pricing</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">your whole team.</span>{' '}
            <span className="text-grad-brand">for less than lunch.</span>
          </h2>
          <p className="mt-4 text-[16px] text-ink-dim">
            Start free with your own key. Upgrade to unlock every agent, hundreds of skills, and
            hosted runs. No card to start, cancel anytime.
          </p>

          {/* Billing toggle */}
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
                  2 months free
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                className={cn('relative', t.popular && 'lg:-my-3 lg:z-10')}
                style={{ perspective: 1000 }}
              >
                {/* Pulsing neon ring on the focal plan, the "buy this" signal. */}
                {t.popular && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -inset-px rounded-[26px]"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(34,211,238,0.9))',
                    }}
                    animate={{ opacity: [0.55, 0.95, 0.55] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <SpotlightCard
                  tilt={!t.popular}
                  spotlightSize={420}
                  spotlightColor={
                    t.popular ? 'rgba(124, 58, 237, 0.30)' : 'rgba(167, 139, 250, 0.14)'
                  }
                  className={cn(
                    'card relative flex h-full flex-col p-6',
                    t.popular
                      ? 'bg-bg-1/90 shadow-glow'
                      : 'opacity-95',
                  )}
                >
                  {t.popular && (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-brand to-cyan px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-glow2">
                      <Zap className="h-3 w-3" /> Most popular
                    </span>
                  )}

                  <h3 className="text-[18px] font-semibold tracking-tight">{t.name}</h3>
                  <p className="mt-1 min-h-[36px] text-[13px] text-ink-dim">{t.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    {isCustom ? (
                      <span className="text-[40px] font-bold tracking-tight">Custom</span>
                    ) : (
                      <>
                        <span className="text-[44px] font-bold leading-none tracking-tight tabular-nums">
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
                  <p
                    className={cn(
                      'mt-1.5 text-[12.5px] font-medium',
                      t.popular ? 'text-cyan-glow' : 'text-ink-faint',
                    )}
                  >
                    {t.value}
                  </p>

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
                  {/* Risk reversal right under the action, where doubt peaks. */}
                  {!isCustom && (
                    <p className="mt-2 text-center text-[11px] text-ink-faint">
                      {t.monthly === 0 ? 'no card required' : '7-day trial · cancel in one click'}
                    </p>
                  )}

                  <ul className="mt-5 space-y-2.5">
                    {t.features.map((f, fi) => (
                      <li
                        key={f}
                        className={cn(
                          'flex items-start gap-2 text-[13.5px]',
                          fi === 0 ? 'font-medium text-white' : 'text-ink-dim',
                        )}
                      >
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

        {/* Honest trust row. Only claims that are true of the product by design. */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-ink-faint">
          <Trust>No card to start</Trust>
          <Trust>Cancel anytime</Trust>
          <Trust>Bring your own key, we never see it</Trust>
          <Trust>Your data never trains a model</Trust>
          <Trust>Every run audit-logged</Trust>
        </div>

        {/* Community tier via Whop. Hidden until NEXT_PUBLIC_WHOP_URL is set. */}
        {process.env.NEXT_PUBLIC_WHOP_URL ? (
          <div className="mt-16">
            <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.08] via-bg-1/40 to-cyan/[0.06] p-1">
              <div className="rounded-[22px] bg-bg-0/80 p-7 backdrop-blur md:p-9">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-violet-300">
                  community tier. powered by whop.
                </p>
                <h3 className="mt-3 text-[26px] font-semibold tracking-tight md:text-[32px]">
                  Join the brocco builder server.
                </h3>
                <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-ink-dim">
                  Same AI team and skills, plus a private Discord with the brocco team, weekly office
                  hours, recipe drops, and first dibs on every new feature. Whop handles the checkout,
                  the community, and the Discord roles in one click.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Trust>discord access + roles</Trust>
                  <Trust>weekly office hours</Trust>
                  <Trust>recipe drops first</Trust>
                </div>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href={process.env.NEXT_PUBLIC_WHOP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 text-[14px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow"
                  >
                    <Sparkles className="h-4 w-4" />
                    join via whop
                  </a>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                    one click. discord invite by email. no waiting.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
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

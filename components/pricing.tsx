'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { trackEvent } from './posthog-provider';
import { cn } from '@/lib/utils';
import { SpotlightCard } from './ui/spotlight-card';

type Interval = 'monthly' | 'annual';

const TIERS = [
  {
    id: 'solo',
    name: 'Solo',
    desc: 'Your AI ops team, on tap.',
    monthly: 49,
    annual: 490,
    popular: true,
    hostedRuns: '2,000 hosted agent runs / month',
    dailyRuns: 100,
    features: [
      'All agents and the skills library',
      'One seat',
      'Built-in tools and integrations',
      'Export your finished work',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    desc: 'An AI workspace for your whole team.',
    monthly: 199,
    annual: 1990,
    popular: false,
    hostedRuns: '10,000 hosted agent runs / month',
    dailyRuns: 500,
    features: [
      'Everything in Solo',
      'Five seats',
      'Shared team workflows',
      'Export your finished work',
    ],
  },
] as const;

export function Pricing({ standalone = false, hostedAvailable = false }: { standalone?: boolean; hostedAvailable?: boolean }) {
  const [interval, setInterval] = useState<Interval>('monthly');
  const reduce = useReducedMotion();

  return (
    <section id="pricing" className={cn('relative overflow-hidden py-24 md:py-32', standalone && 'pt-32 md:pt-40')}>
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto">pricing</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">meet your AI team.</span>{' '}
            <span className="text-grad-brand">choose your plan.</span>
          </h2>
          <p className="mt-4 text-base text-ink-dim">
            Add your card at secure checkout, then create your account to explore the dashboard for seven days.
            Live tools and agent runs require an active paid subscription.
          </p>
          <p className="mt-3 text-base text-ink-dim">
            {hostedAvailable
              ? 'Hosted AI is included on paid plans, subject to daily fair-use limits. Each agent counts as one run.'
              : 'Your API key required; provider usage billed separately. The subscription covers the Brocco workspace and tools.'}
          </p>
          <div className="mx-auto mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-bg-1 p-1 text-sm" aria-label="Billing interval">
            {(['monthly', 'annual'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setInterval(option)}
                aria-pressed={interval === option}
                className={cn(
                  'min-h-12 rounded-full px-4 py-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                  interval === option ? 'bg-bg-3 text-ink' : 'text-ink-dim hover:text-ink',
                )}
              >
                {option === 'monthly' ? 'Monthly' : 'Annual · save 2 months'}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-6 md:grid-cols-2">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : i * 0.06 }}
              className="relative"
            >
              <SpotlightCard tilt={false} className={cn('card relative flex h-full flex-col p-6', tier.popular && 'border-brand/40 bg-bg-1/90 shadow-glow')}>
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    <Zap className="h-3 w-3" /> Most popular
                  </span>
                )}
                <h3 className="text-xl font-semibold tracking-tight">{tier.name}</h3>
                <p className="mt-1 text-base text-ink-dim">{tier.desc}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight tabular-nums">${tier[interval].toLocaleString('en-US')}</span>
                  <span className="text-base text-ink-faint">/ {interval === 'annual' ? 'year' : 'month'}</span>
                </div>
                <p className="mt-2 text-sm text-ink-dim">After the 7-day dashboard preview, unless canceled.</p>
                <Link
                  href={`/begin?tier=${tier.id}&interval=${interval}`}
                  onClick={() => trackEvent('trial_plan_selected', { tier: tier.id, interval })}
                  className={cn('mt-6 min-h-12 w-full', tier.popular ? 'btn-primary' : 'btn-ghost')}
                  aria-label={`Start 7-day trial with ${tier.name}, billed ${interval === 'annual' ? 'annually' : 'monthly'}`}
                >
                  Start 7-day trial
                </Link>
                <p className="mt-2 text-center text-sm text-ink-faint">Card required · dashboard preview only</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start gap-2 text-base text-ink-dim">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-accent-green" />
                    <span>{hostedAvailable ? tier.hostedRuns : 'Your API key required; provider usage billed separately'}</span>
                  </li>
                  {hostedAvailable && <li className="flex items-start gap-2 text-base text-ink-dim">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-accent-green" />
                    <span>{tier.dailyRuns} hosted agent runs / day fair-use limit; each agent counts separately</span>
                  </li>}
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-base text-ink-dim">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-accent-green" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-3xl space-y-3 text-center text-base text-ink-dim">
          <p>
            Your selected plan starts automatically after seven days and renews at the displayed price
            each billing period. Cancel in billing before the trial ends to avoid the first charge.
            To use live tools sooner, confirm that you want to end the preview and start your paid plan.
          </p>
          <p>
            Review the plan, price, and billing date before confirming checkout.{' '}
            <Link href="/terms" className="text-cyan-glow underline underline-offset-4">Subscription terms</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

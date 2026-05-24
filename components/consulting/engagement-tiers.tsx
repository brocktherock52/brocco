'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpotlightCard } from '@/components/ui/spotlight-card';

/**
 * Three consulting offerings, a trust ladder from low-commitment to retainer.
 * Pricing posture is "starting at" / "custom" and is deliberately SEPARATE
 * from the SaaS tiers in components/pricing.tsx (different buyer, price point).
 *
 * TODO(founder): confirm the "starting at" price points before launch.
 */

const TIERS = [
  {
    id: 'audit',
    name: 'AI Opportunity Audit',
    posture: 'starting at $2,500',
    desc: 'A paid, low-commitment on-ramp. We map your automatable work and hand you a prioritized plan.',
    cta: 'Book an audit',
    features: [
      'Workflow + cost teardown (Discover phase)',
      'Prioritized automation roadmap',
      'ROI projection specific to your team',
      'Credited toward a build if you proceed',
    ],
  },
  {
    id: 'build',
    name: 'Automation Build',
    posture: 'project, starting at $15k',
    desc: 'A fixed-scope engagement. We build and deploy the agents for one high-value workflow.',
    cta: 'Scope a build',
    popular: true,
    features: [
      'Everything in the Audit',
      'Custom agents + tools wired to your data',
      'Human-in-the-loop checkpoints',
      'Deploy into production + measure vs baseline',
      'Replayable JSONL audit trail',
    ],
  },
  {
    id: 'managed',
    name: 'Managed Autonomy',
    posture: 'retainer, custom',
    desc: 'We run the agent workforce for you: monitoring, tuning, cost controls, and a quarterly review.',
    cta: 'Talk to us',
    features: [
      'Everything in a Build',
      'Ongoing monitoring + tuning',
      'Cost controls + rate limiting',
      'New workflows added each quarter',
      'Priority support + quarterly review',
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function EngagementTiers() {
  return (
    <section id="engagements" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto">engagements</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">three ways</span>{' '}
            <span className="text-grad-brand">to work with us.</span>
          </h2>
          <p className="mt-4 text-[16px] text-ink-dim">
            Start small with a paid audit, scope a fixed build, or hand us the
            keys. Each step credits into the next.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-12 grid gap-4 lg:grid-cols-3"
        >
          {TIERS.map((t) => (
            <motion.div key={t.id} variants={cardVariants} whileHover={{ y: -4 }}>
              <SpotlightCard
                spotlightSize={440}
                spotlightColor={
                  t.popular ? 'rgba(124, 58, 237, 0.26)' : 'rgba(167, 139, 250, 0.14)'
                }
                className={cn(
                  'card relative flex h-full flex-col p-6 md:p-7',
                  t.popular && 'border-brand/40 ring-1 ring-brand/40 shadow-glow',
                )}
              >
                {t.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand to-cyan px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-glow2">
                    most chosen
                  </span>
                )}
                <h3 className="text-[19px] font-semibold tracking-tight">{t.name}</h3>
                <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.16em] text-brand-glow">
                  {t.posture}
                </p>
                <p className="mt-3 min-h-[60px] text-[13.5px] leading-relaxed text-ink-dim">
                  {t.desc}
                </p>

                <Link
                  href="#intake"
                  className={cn('mt-5 w-full', t.popular ? 'btn-primary' : 'btn-ghost')}
                >
                  <span>{t.cta}</span>
                </Link>

                <ul className="mt-6 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13.5px] text-ink-dim">
                      <Check className="mt-[2px] h-3.5 w-3.5 shrink-0 text-accent-green" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-center text-[13px] text-ink-faint">
          Looking for self-serve software instead?{' '}
          <Link href="/pricing" className="text-brand-glow underline-offset-4 hover:underline">
            See Brocco platform pricing
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

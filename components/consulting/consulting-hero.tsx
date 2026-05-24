'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock, TrendingDown } from 'lucide-react';

/**
 * Consulting hero. Outcome-led, premium, deliberately NOT mascot-y.
 * Lead with the business result (cut cost + reclaim hours), then route to
 * the paid audit on-ramp (primary) and the methodology (secondary).
 *
 * Mirrors the editorial display + pill + btn-* vocabulary from the home
 * page so /consulting reads as the same product, a different track.
 */
export function ConsultingHero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-radial-glow" />

      <div className="container-x">
        <div className="max-w-3xl">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pill"
          >
            brocco studio
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-display-xl lowercase"
          >
            <span className="text-grad">custom AI automation that cuts cost</span>{' '}
            <span className="text-grad-brand">and reclaims your team&rsquo;s hours.</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-dim"
          >
            We map the repetitive work draining your team, then build and run a
            coordinated team of nine specialist agents to do it. The same
            reviewable platform we ship as software, delivered as a high-touch
            engagement for your business.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="#intake" className="btn-primary">
              <span>Book an AI audit</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#methodology" className="btn-ghost">
              <span>See how it works</span>
            </Link>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] text-ink-faint"
          >
            <span className="inline-flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-accent-green" />
              lower operating cost
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-glow" />
              hours reclaimed every week
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
              reviewable, audit-grade delivery
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

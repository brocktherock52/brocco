'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Compass, Hammer, Rocket, ShieldCheck } from 'lucide-react';

/**
 * Named 4-phase methodology: Discover -> Build -> Deploy -> Govern.
 * This is the engagement process, mapped onto the same agent-team
 * architecture that powers the self-serve product (the "delivery engine").
 *
 * Layout is a connected horizontal timeline on desktop, stacked on mobile.
 * Deliberately not a symmetric 3-up icon-in-circle grid (anti-slop rule 2/3).
 */

const PHASES = [
  {
    n: '01',
    name: 'Discover',
    icon: Compass,
    body: 'We sit with your team, trace the manual workflows, and quantify the hours and cost each one burns. You leave with a prioritized automation map, not a sales deck.',
  },
  {
    n: '02',
    name: 'Build',
    icon: Hammer,
    body: 'We configure the nine specialist agents to your processes: custom tools, your data sources, your guardrails. Each agent owns a slice of the work and reports its own audit trail.',
  },
  {
    n: '03',
    name: 'Deploy',
    icon: Rocket,
    body: 'We ship into your real workflow with a human-in-the-loop checkpoint, measure against the baseline from Discover, and tune until the numbers hold in production.',
  },
  {
    n: '04',
    name: 'Govern',
    icon: ShieldCheck,
    body: 'We keep it running: monitoring, cost controls, replayable JSONL logs, and a quarterly review. Autonomy you can audit, not a black box you have to trust.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Methodology() {
  const reduce = useReducedMotion();

  return (
    <section id="methodology" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">the method</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">discover. build. deploy.</span>{' '}
            <span className="text-grad-brand">govern.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            A four-phase engagement run on the same agent team we ship as
            software. The nine agents are the delivery engine: parallel
            research, competing approaches, and cross-layer coordination on
            every project.
          </p>
        </div>

        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {PHASES.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.li key={p.name} variants={cardVariants} className="relative">
                {/* Connector line between phases on large screens */}
                {i < PHASES.length - 1 && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-[calc(100%+0.25rem)] top-9 hidden h-px w-4 bg-gradient-to-r from-white/20 to-transparent lg:block"
                  />
                )}
                <div className="card card-hover flex h-full flex-col p-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03]">
                      <Icon className="h-4.5 w-4.5 text-brand-glow" strokeWidth={1.75} />
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                      {p.n}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[18px] font-semibold tracking-tight">{p.name}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">{p.body}</p>
                </div>
              </motion.li>
            );
          })}
        </motion.ol>

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 max-w-2xl text-[13.5px] leading-relaxed text-ink-faint"
        >
          The strongest case study we have is our own: we run client engagements
          on Brocco. The platform you can buy is the platform we deliver on.
        </motion.p>
      </div>
    </section>
  );
}

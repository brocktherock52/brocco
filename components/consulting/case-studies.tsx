'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

/**
 * Real client case-study cards. The CLIENT NAMES are real (founder's
 * engagements). The outcome METRICS below are PLACEHOLDERS framed as
 * hours reclaimed / manual work removed / faster turnaround.
 *
 * TODO(founder): confirm or replace every `metric` + `summary` with the
 * real, verified numbers before this page goes live. Do NOT publish these
 * placeholder figures as if they were audited results. Once confirmed,
 * delete this comment and the `placeholder: true` flags.
 */

type CaseStudy = {
  client: string;
  industry: string;
  metric: string;
  metricLabel: string;
  summary: string;
  placeholder: boolean;
};

const CASES: CaseStudy[] = [
  {
    client: 'ChiroVision',
    industry: 'Healthcare / chiropractic',
    metric: '~12 hrs/wk', // TODO(founder): confirm real number
    metricLabel: 'admin hours reclaimed',
    summary:
      'Automated intake triage and patient follow-up so front-desk staff stopped re-keying the same data across systems.',
    placeholder: true,
  },
  {
    client: 'Picture Perfect Health',
    industry: 'Health & wellness',
    metric: 'manual work removed', // TODO(founder): confirm real number / outcome
    metricLabel: 'across reporting + outreach',
    summary:
      'Replaced a recurring manual reporting and content workflow with agents that draft, check, and route the work for sign-off.',
    placeholder: true,
  },
  {
    client: 'Salt Waterfront Kitchen / Point Lookout Marina',
    industry: 'Hospitality / marina',
    metric: 'faster turnaround', // TODO(founder): confirm real number / outcome
    metricLabel: 'on guest + booking ops',
    summary:
      'Streamlined reservations, guest communication, and seasonal operations so the team spends time on guests, not on the inbox.',
    placeholder: true,
  },
  {
    client: 'Marley Select Staffing',
    industry: 'Staffing / recruiting',
    metric: 'faster placements', // TODO(founder): confirm real number / outcome
    metricLabel: 'screening + outreach reclaimed',
    summary:
      'Automated candidate sourcing, resume screening, and first-touch outreach so recruiters spend their time on interviews, not inbox triage.',
    placeholder: true,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function CaseStudies() {
  return (
    <section id="results" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">results</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">work we have</span>{' '}
            <span className="text-grad-brand">already shipped.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            Real engagements across healthcare, wellness, and hospitality. Each
            one started as a manual workflow and ended as an audited agent
            running in production.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {CASES.map((c) => (
            <motion.div key={c.client} variants={cardVariants} whileHover={{ y: -4 }}>
              <SpotlightCard
                spotlightSize={400}
                spotlightColor="rgba(167, 139, 250, 0.14)"
                className="card flex h-full flex-col p-6"
              >
                <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
                  {c.industry}
                </p>
                <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight">
                  {c.client}
                </h3>

                <div className="mt-5">
                  <div className="text-[26px] font-bold tracking-tight text-brand-glow">
                    {c.metric}
                  </div>
                  <div className="mt-1 text-[12px] text-ink-faint">{c.metricLabel}</div>
                </div>

                <p className="mt-4 flex-1 text-[13px] leading-relaxed text-ink-dim">
                  {c.summary}
                </p>

                {c.placeholder && (
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-gold/70">
                    metric pending confirmation
                  </p>
                )}
              </SpotlightCard>
            </motion.div>
          ))}

          {/* "+ more" slot */}
          <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
            <a
              href="#intake"
              className="card card-hover flex h-full flex-col items-start justify-between p-6"
            >
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
                  and more
                </p>
                <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight">
                  Other AI builds in flight
                </h3>
                <p className="mt-4 text-[13px] leading-relaxed text-ink-dim">
                  We are mid-engagement on several more. Yours could be next.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-glow">
                Start a project
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

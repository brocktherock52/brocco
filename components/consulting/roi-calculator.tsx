'use client';

import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { formatNumber } from '@/lib/utils';

/**
 * Interactive ROI / cost-savings calculator. A lead-magnet + table-stakes
 * authority signal for the consulting page.
 *
 * Model (intentionally conservative + transparent):
 *   weekly cost of automatable work = teamSize * hoursPerWeek * hourlyCost
 *   annual cost                      = weekly * 52
 *   automation captures a share of that work (AUTOMATION_RATE).
 *   annual savings                   = annual cost * AUTOMATION_RATE
 *   payback (months)                 = est. engagement cost / monthly savings
 *   hours reclaimed / year           = teamSize * hoursPerWeek * AUTOMATION_RATE * 52
 *
 * These are projections for conversation, not a guarantee. The assumptions
 * are shown inline so the number is defensible.
 */

const AUTOMATION_RATE = 0.6; // share of automatable hours an engagement typically removes
const EST_ENGAGEMENT_COST = 25_000; // representative "Automation Build" anchor for payback math

const SLIDERS = [
  { key: 'teamSize', label: 'People doing this work', min: 1, max: 100, step: 1, suffix: '' },
  { key: 'hourlyCost', label: 'Avg fully-loaded hourly cost', min: 15, max: 200, step: 5, prefix: '$' },
  { key: 'hoursPerWeek', label: 'Hours/week each on automatable work', min: 1, max: 40, step: 1, suffix: ' hrs' },
] as const;

type State = { teamSize: number; hourlyCost: number; hoursPerWeek: number };

export function RoiCalculator() {
  const reduce = useReducedMotion();
  const [state, setState] = useState<State>({ teamSize: 6, hourlyCost: 45, hoursPerWeek: 12 });

  const { annualSavings, paybackMonths, hoursReclaimed } = useMemo(() => {
    const weeklyHours = state.teamSize * state.hoursPerWeek;
    const annualCost = weeklyHours * state.hourlyCost * 52;
    const savings = annualCost * AUTOMATION_RATE;
    const monthlySavings = savings / 12;
    const payback = monthlySavings > 0 ? EST_ENGAGEMENT_COST / monthlySavings : 0;
    const hours = weeklyHours * AUTOMATION_RATE * 52;
    return {
      annualSavings: Math.round(savings),
      paybackMonths: Math.round(payback * 10) / 10,
      hoursReclaimed: Math.round(hours),
    };
  }, [state]);

  function set(key: keyof State, value: number) {
    setState((s) => ({ ...s, [key]: value }));
  }

  return (
    <section id="roi" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">roi calculator</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">see the savings</span>{' '}
            <span className="text-grad-brand">before you commit.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            A conservative projection of what removing the repetitive work is
            worth. Move the sliders; the numbers update instantly.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Inputs */}
          <div className="card flex flex-col gap-7 p-6 md:p-8">
            {SLIDERS.map((s) => {
              const value = state[s.key];
              const display =
                ('prefix' in s ? s.prefix : '') +
                formatNumber(value) +
                ('suffix' in s ? s.suffix : '');
              return (
                <div key={s.key}>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor={s.key} className="text-[14px] font-medium text-ink">
                      {s.label}
                    </label>
                    <span className="font-mono text-[15px] tabular-nums text-brand-glow">
                      {display}
                    </span>
                  </div>
                  <input
                    id={s.key}
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={value}
                    onChange={(e) => set(s.key, Number(e.target.value))}
                    className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-brand outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                  />
                </div>
              );
            })}

            <p className="text-[12px] leading-relaxed text-ink-faint">
              Assumes automation removes {Math.round(AUTOMATION_RATE * 100)}% of
              the targeted hours and a representative ${formatNumber(EST_ENGAGEMENT_COST)} build
              for payback. Your audit produces numbers specific to your
              workflows.
            </p>
          </div>

          {/* Outputs */}
          <div className="card relative overflow-hidden border-brand/30 p-6 ring-1 ring-brand/30 md:p-8">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-glow opacity-40" />
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
              projected, year one
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Output
                label="Annual savings"
                value={
                  <>
                    $
                    <AnimatedNumber
                      value={annualSavings}
                      duration={reduce ? 0 : 0.6}
                      format={(v) => formatNumber(Math.round(v))}
                    />
                  </>
                }
                emphasis
              />
              <Output
                label="Hours reclaimed / year"
                value={
                  <AnimatedNumber
                    value={hoursReclaimed}
                    duration={reduce ? 0 : 0.6}
                    format={(v) => formatNumber(Math.round(v))}
                  />
                }
              />
              <Output
                label="Payback"
                value={
                  <>
                    <AnimatedNumber
                      value={paybackMonths}
                      duration={reduce ? 0 : 0.6}
                      format={(v) => `${(Math.round(v * 10) / 10).toFixed(1)}`}
                    />
                    <span className="ml-1 text-[18px] font-normal text-ink-dim">mo</span>
                  </>
                }
              />
              <Output
                label="Automatable work removed"
                value={`${Math.round(AUTOMATION_RATE * 100)}%`}
              />
            </div>

            <Link href="#intake" className="btn-primary mt-8 w-full">
              <span>Book an AI audit to confirm these</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
              projection only. not a guarantee.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Output({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div>
      <div className="text-[12px] text-ink-faint">{label}</div>
      <motion.div
        className={`mt-1.5 font-bold tabular-nums tracking-tight ${
          emphasis ? 'text-[38px] text-grad-brand' : 'text-[32px] text-ink'
        }`}
      >
        {value}
      </motion.div>
    </div>
  );
}

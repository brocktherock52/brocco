'use client';

/**
 * RealEstateDemo, the "show me what it actually does" console for /real-estate.
 *
 * On the consultant call, a viewer (Ben) said the site needed "a really well
 * put-together demo of what you can actually do inside and what it can do for
 * me." The page told; it never showed. This DEMONSTRATES the wholesale pipeline:
 * one prompt in, then the team works a real-looking deal stage by stage
 * (records -> skip trace -> comps -> contract -> dispo) and converges on a
 * stack of finished deliverables.
 *
 * Honest framing: scripted preview, runs client-side, no key, no network. The
 * real thing lives in /app. Auto-plays when scrolled into view; replayable.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, RotateCcw, FileText, FileSpreadsheet, FileSignature, Sparkles } from 'lucide-react';

type Stage = {
  agent: string;
  accent: string;
  action: string;
  result: string;
};

const PROMPT = 'work a wholesale deal in Wayne County, MI under $120k';

const STAGES: Stage[] = [
  { agent: 'browser', accent: '#67E8F9', action: 'pulling tax-delinquent + absentee-owner records', result: '142 candidate properties' },
  { agent: 'researcher', accent: '#22D3EE', action: 'skip tracing owners, phones + mailing addresses', result: '138 owners found · 96% hit rate' },
  { agent: 'analyst', accent: '#A78BFA', action: 'running comps, ARV and the repair band', result: 'ARV $185k · repairs ~$32k · MAO $97k' },
  { agent: 'outreach', accent: '#FBBF24', action: 'drafting the seller letter, SMS + call opener', result: '5-touch sequence, ready to send' },
  { agent: 'coder', accent: '#4ADE80', action: 'drafting the assignable purchase contract', result: 'PSA with the blanks filled in' },
  { agent: 'ops', accent: '#F472B6', action: 'matching cash buyers + writing the dispo blast', result: '12 buyers matched · blast queued' },
];

const DELIVERABLES = [
  { name: 'leads.csv', Icon: FileSpreadsheet },
  { name: 'deal-analysis.md', Icon: FileText },
  { name: 'seller-outreach.md', Icon: FileText },
  { name: 'assignable-contract.pdf', Icon: FileSignature },
  { name: 'dispo-blast.md', Icon: FileText },
];

export function RealEstateDemo() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  // -1 = idle, 0..STAGES.length-1 = stage streaming, STAGES.length = deliverables
  const [step, setStep] = useState(-1);
  const [started, setStarted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }

  function play() {
    clearTimers();
    setStarted(true);
    if (reduce) {
      setStep(STAGES.length);
      return;
    }
    setStep(0);
    // 900ms per stage, then reveal the deliverables.
    for (let i = 1; i <= STAGES.length; i++) {
      timers.current.push(setTimeout(() => setStep(i), i * 950));
    }
  }

  // Auto-play once when scrolled into view.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      play();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            play();
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '-80px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const done = step >= STAGES.length;

  return (
    <section className="pb-16" ref={wrapRef}>
      <div className="container-x">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">see it work</p>
              <h2 className="mt-3 text-display-lg lowercase">
                <span className="text-grad">one prompt.</span>{' '}
                <span className="font-serif italic font-normal text-grad-brand">a deal ready to sign.</span>
              </h2>
            </div>
            {started && (
              <button
                type="button"
                onClick={play}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-dim transition-colors hover:border-cyan/40 hover:text-white"
              >
                <RotateCcw className="h-3 w-3" /> replay
              </button>
            )}
          </div>

          {/* Console */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-0/60 shadow-glow2 backdrop-blur">
            {/* Title bar */}
            <header className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
              </span>
              <span className="font-mono text-[12px] text-ink-faint">brocco.run · wholesale</span>
              <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-emerald-400">
                <span className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${done ? '' : 'animate-pulse'}`} />
                {done ? 'done' : 'streaming'}
              </span>
            </header>

            <div className="space-y-2.5 p-5 font-mono text-[12.5px] leading-relaxed">
              {/* The prompt */}
              <p className="text-white">
                <span className="text-cyan-glow">{'> '}</span>
                brocco run &quot;{PROMPT}&quot;
              </p>
              <p className="text-ink-faint">[plan] supervisor delegates to 6 specialists, in parallel</p>

              {/* Stages */}
              <div className="space-y-2 pt-1">
                {STAGES.map((s, i) => {
                  const visible = step >= i;
                  const working = step === i && !done;
                  return (
                    <AnimatePresence key={s.agent}>
                      {visible && (
                        <motion.div
                          initial={reduce ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
                        >
                          <span
                            className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] uppercase tracking-[0.14em]"
                            style={{ color: s.accent, background: `${s.accent}14` }}
                          >
                            <span className="h-1 w-1 rounded-full" style={{ background: s.accent, boxShadow: `0 0 6px ${s.accent}` }} />
                            {s.agent}
                          </span>
                          <span className="text-ink-dim">{s.action}</span>
                          {working ? (
                            <span className="text-ink-faint">…</span>
                          ) : (
                            <span className="text-ink" style={{ color: s.accent }}>
                              → {s.result}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>

              {/* Deliverables */}
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mt-3 border-t border-white/[0.06] pt-3"
                  >
                    <p className="text-emerald-400">[done] deal worked in 4m 18s · est $0.31 BYOK · ready to sign</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {DELIVERABLES.map((d, i) => (
                        <motion.span
                          key={d.name}
                          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25, delay: 0.15 + i * 0.07 }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11.5px] text-ink-dim"
                        >
                          <d.Icon className="h-3.5 w-3.5 text-cyan-glow" />
                          {d.name}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Honest label + CTA */}
          <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              scripted preview · the real runs live in the app, on your lists
            </p>
            <Link href="/signup" className="btn-primary text-[14px]">
              <Sparkles className="h-4 w-4" />
              run it on your market · free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

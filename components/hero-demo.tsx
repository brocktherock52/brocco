'use client';

/**
 * BroadcastConsole — the interactive hero centerpiece.
 *
 * The old hero DESCRIBED the product (canned terminal scenes, fake telemetry).
 * This DEMONSTRATES it: the visitor picks or types a goal, hits Broadcast, and
 * watches all nine specialists fan out in PARALLEL, each streaming its own work,
 * then converge into a stack of finished deliverable files. The whole point of
 * Brocco — one prompt, nine agents at once, real output — is now something you
 * feel in five seconds instead of read about.
 *
 * Honest framing: this is a scripted preview (no key required, runs client-side).
 * The real thing lives in /app. We label it "preview" so it never misleads.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, CornerDownLeft, FileText, Download, Sparkles } from 'lucide-react';
import { AGENTS, type AgentName } from '@/lib/agents';
import { cn } from '@/lib/utils';

// A "broadcast" preset: a goal, the agents that lead it, and the files it ships.
type Preset = {
  id: string;
  chip: string;
  goal: string;
  lead: AgentName[];
  deliverables: { name: string; kind: string }[];
};

const PRESETS: Preset[] = [
  {
    id: 'launch',
    chip: 'Launch a product',
    goal: 'Run a launch sprint for my $49/mo SaaS: research the market, draft 5 tweets, write the landing hero, and plan day-1 outreach.',
    lead: ['supervisor', 'researcher', 'outreach', 'planner', 'designer'],
    deliverables: [
      { name: 'market-brief.md', kind: 'research' },
      { name: 'launch-plan.md', kind: 'plan' },
      { name: 'tweets.md', kind: 'copy' },
      { name: 'landing-hero.md', kind: 'copy' },
    ],
  },
  {
    id: 'research',
    chip: 'Research a market',
    goal: 'Brief me on the agentic AI market in 2026: the top 5 platforms, their wedge, pricing, and weaknesses. One page, sourced.',
    lead: ['researcher', 'analyst', 'browser', 'planner'],
    deliverables: [
      { name: 'market-brief.md', kind: 'research' },
      { name: 'competitor-table.csv', kind: 'data' },
      { name: 'recommendation.md', kind: 'analysis' },
    ],
  },
  {
    id: 'outreach',
    chip: 'Draft outreach',
    goal: 'Research 10 founders launching AI tools this quarter and draft a personalized cold email to each that reads like a human did the homework.',
    lead: ['researcher', 'outreach', 'analyst'],
    deliverables: [
      { name: 'prospect-list.csv', kind: 'data' },
      { name: 'cold-emails.md', kind: 'copy' },
      { name: 'send-schedule.md', kind: 'plan' },
    ],
  },
  {
    id: 'build',
    chip: 'Build a tool',
    goal: 'Build a single-file pomodoro timer web app with keyboard shortcuts and dark mode, plus a short README.',
    lead: ['planner', 'coder', 'app_builder', 'designer'],
    deliverables: [
      { name: 'pomodoro.html', kind: 'app' },
      { name: 'README.md', kind: 'docs' },
    ],
  },
];

// Short, plausible actions per agent, shown one at a time while "working".
const ACTIONS: Record<AgentName, string[]> = {
  supervisor: ['decomposing the goal', 'delegating to 8 panes', 'synthesizing the brief'],
  researcher: ['searching 18 sources', 'cross-checking citations', 'saving research_brief'],
  analyst: ['structuring findings', 'scoring 5 options', 'writing the recommendation'],
  outreach: ['pulling prospect data', 'drafting variant A / B', 'setting send times'],
  coder: ['scaffolding the file', 'writing the logic', 'adding tests'],
  browser: ['opening 6 pricing pages', 'extracting the tiers', 'archiving evidence'],
  designer: ['sketching 3 directions', 'picking the palette', 'exporting the hero'],
  planner: ['mapping the phases', 'estimating cycle time', 'sequencing day 1'],
  app_builder: ['wiring the UI', 'bundling one file', 'shipping the build'],
};

type Phase = 'idle' | 'running' | 'done';
type AgentState = { status: 'queued' | 'working' | 'done'; action: string; progress: number };

function initialStates(): Record<AgentName, AgentState> {
  return AGENTS.reduce(
    (acc, a) => {
      acc[a.name] = { status: 'queued', action: '', progress: 0 };
      return acc;
    },
    {} as Record<AgentName, AgentState>,
  );
}

export function BroadcastConsole() {
  const reduce = useReducedMotion();
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [goal, setGoal] = useState<string>(PRESETS[0].goal);
  const [phase, setPhase] = useState<Phase>('idle');
  const [states, setStates] = useState<Record<AgentName, AgentState>>(initialStates);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervals = useRef<ReturnType<typeof setInterval>[]>([]);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    intervals.current.forEach(clearInterval);
    timers.current = [];
    intervals.current = [];
  }, []);

  useEffect(() => () => clearAll(), [clearAll]);

  const pickPreset = (p: Preset) => {
    if (phase === 'running') return;
    setPreset(p);
    setGoal(p.goal);
    setPhase('idle');
    setStates(initialStates());
  };

  const run = useCallback(() => {
    if (phase === 'running' || !goal.trim()) return;
    clearAll();
    setPhase('running');
    setElapsed(0);
    setStates(initialStates());

    const order = AGENTS.map((a) => a.name);
    // Elapsed timer (visual only).
    const startedAt = Date.now();
    const elapsedTick = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 100);
    intervals.current.push(elapsedTick);

    order.forEach((name, i) => {
      // All nine kick off near-simultaneously — that parallelism IS the pitch.
      const startDelay = reduce ? 0 : 120 + i * 60;
      const duration = reduce ? 0 : 1700 + Math.random() * 2600;
      const actions = ACTIONS[name];

      timers.current.push(
        setTimeout(() => {
          setStates((s) => ({ ...s, [name]: { ...s[name], status: 'working', action: actions[0], progress: 6 } }));
          // Step the action label + progress while working.
          let step = 0;
          const prog = setInterval(() => {
            step += 1;
            setStates((s) => {
              const cur = s[name];
              if (cur.status !== 'working') return s;
              const nextProgress = Math.min(94, cur.progress + 8 + Math.random() * 12);
              const action = actions[Math.min(actions.length - 1, Math.floor((step / 6) * actions.length))];
              return { ...s, [name]: { ...cur, progress: nextProgress, action } };
            });
          }, duration / 7);
          intervals.current.push(prog);

          timers.current.push(
            setTimeout(() => {
              clearInterval(prog);
              setStates((s) => ({ ...s, [name]: { status: 'done', action: 'done', progress: 100 } }));
            }, duration),
          );
        }, startDelay),
      );
    });

    // When the slowest agent is comfortably done, reveal deliverables.
    const finishAt = reduce ? 350 : 4900;
    timers.current.push(
      setTimeout(() => {
        clearInterval(elapsedTick);
        setPhase('done');
      }, finishAt),
    );
  }, [phase, goal, reduce, clearAll]);

  const reset = () => {
    clearAll();
    setPhase('idle');
    setStates(initialStates());
    setElapsed(0);
  };

  const doneCount = AGENTS.filter((a) => states[a.name].status === 'done').length;

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-4 md:pb-28" id="try">
      <div className="container-x relative">
        {/* Section label */}
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-dim backdrop-blur">
            <Sparkles className="h-3 w-3 text-cyan-glow" /> broadcast console · live preview
          </span>
          <h2 className="mt-4 text-display-lg">
            <span className="text-grad">Type one goal. </span>
            <span className="text-grad-brand font-serif italic">Nine specialists run it in parallel.</span>
          </h2>
          <p className="mt-3 max-w-[560px] text-[15.5px] leading-relaxed text-ink-dim">
            Pick a starting point, then hit Broadcast. Watch the team fan out and ship real files,
            the same way a run works inside your dashboard.
          </p>
        </div>

        {/* Console */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong relative mx-auto max-w-[940px] overflow-hidden rounded-3xl border border-white/[0.10] shadow-card"
        >
          {/* Prompt bar */}
          <div className="border-b border-white/[0.06] p-4 md:p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickPreset(p)}
                  disabled={phase === 'running'}
                  className={cn(
                    'rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors disabled:opacity-50',
                    preset.id === p.id
                      ? 'border-brand/50 bg-brand/15 text-white'
                      : 'border-white/[0.08] bg-white/[0.02] text-ink-dim hover:border-white/[0.18] hover:text-white',
                  )}
                >
                  {p.chip}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-3">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run();
                }}
                rows={2}
                spellCheck={false}
                disabled={phase === 'running'}
                className="min-h-[52px] flex-1 resize-none rounded-xl border border-white/[0.08] bg-bg-0/60 px-3.5 py-2.5 text-[14.5px] leading-snug text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand/40 disabled:opacity-70"
                placeholder="Describe a goal. The supervisor will split it across the team."
              />
              <button
                type="button"
                onClick={phase === 'done' ? reset : run}
                disabled={phase === 'running'}
                className="btn-primary shrink-0 px-5 py-3 text-[14px] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {phase === 'idle' && (
                  <>
                    Broadcast
                    <CornerDownLeft className="h-3.5 w-3.5" />
                  </>
                )}
                {phase === 'running' && (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Running
                  </>
                )}
                {phase === 'done' && <>Run again</>}
              </button>
            </div>
          </div>

          {/* Agent grid */}
          <div className="relative p-4 md:p-5">
            {/* Status strip */}
            <div className="mb-3 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.18em]">
              <span className={cn(phase === 'idle' ? 'text-ink-faint' : 'text-emerald-400')}>
                {phase === 'idle' && 'idle · ready to broadcast'}
                {phase === 'running' && `running · ${doneCount}/9 agents done`}
                {phase === 'done' && `complete · 9 agents · ${elapsed.toFixed(1)}s`}
              </span>
              <span className="text-ink-faint">parallel run</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {AGENTS.map((a, i) => {
                const st = states[a.name];
                const isLead = preset.lead.includes(a.name);
                return (
                  <motion.div
                    key={a.name}
                    initial={false}
                    animate={{
                      opacity: phase === 'idle' && !isLead ? 0.55 : 1,
                    }}
                    className={cn(
                      'relative overflow-hidden rounded-xl border bg-bg-0/40 p-3 transition-colors',
                      st.status === 'working'
                        ? 'border-white/[0.18]'
                        : st.status === 'done'
                          ? 'border-emerald-400/30'
                          : 'border-white/[0.06]',
                    )}
                  >
                    {/* progress wash */}
                    {st.status !== 'queued' && (
                      <div
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-[2px] transition-all duration-300"
                        style={{ width: `${st.progress}%`, background: a.color, boxShadow: `0 0 8px ${a.color}` }}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <motion.span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: a.color, boxShadow: `0 0 8px ${a.color}` }}
                        animate={
                          st.status === 'working' && !reduce
                            ? { opacity: [0.4, 1, 0.4], scale: [1, 1.25, 1] }
                            : { opacity: st.status === 'queued' ? 0.4 : 1 }
                        }
                        transition={{ duration: 1.1, repeat: st.status === 'working' ? Infinity : 0 }}
                      />
                      <span className="font-mono text-[12px] lowercase text-white">{a.name.replace('_', ' ')}</span>
                      {st.status === 'done' && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto h-3.5 w-3.5 text-emerald-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                      )}
                    </div>
                    <p className="mt-1.5 h-[14px] truncate font-mono text-[10.5px] text-ink-dim">
                      {st.status === 'queued'
                        ? phase === 'idle'
                          ? a.description.toLowerCase().slice(0, 38)
                          : 'queued'
                        : st.action}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Deliverables */}
            <AnimatePresence>
              {phase === 'done' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
                    <div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-emerald-400">
                      <FileText className="h-3.5 w-3.5" />
                      {preset.deliverables.length} files delivered
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preset.deliverables.map((d, i) => (
                        <motion.span
                          key={d.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.10] bg-bg-0/60 px-3 py-2"
                        >
                          <FileText className="h-3.5 w-3.5 text-cyan-glow" />
                          <span className="font-mono text-[12px] text-white">{d.name}</span>
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">
                            {d.kind}
                          </span>
                        </motion.span>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Link href="/app" className="btn-primary px-5 py-2.5 text-[13.5px]">
                        Run this for real
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/app"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim transition-colors hover:text-white"
                      >
                        <Download className="h-3.5 w-3.5" /> download .zip in dashboard
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="mx-auto mt-3 max-w-[940px] text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          preview is scripted · real runs stream live in your dashboard with your own key
        </p>
      </div>
    </section>
  );
}

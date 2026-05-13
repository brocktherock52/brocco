'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

// ScrollAgents — SIGNATURE FEATURE v2.
//
// The crocs are no longer pinned to a dock. They WALK across the page
// at random viewport positions as the visitor scrolls, and they
// physically DROP bento boxes behind them. Each bento has a live task
// the agent is "working on" right now. The cards pile up in a stack
// along the right edge so visitors see the work building up.
//
// Visual rules:
//   - 3-5 crocs visible at once
//   - each croc walks left → right OR right → left at its own speed
//   - the croc emits a "tool spark" then a new bento card materializes
//     where the croc was standing, then drifts to the right-edge stack
//   - the right-edge bento stack scrolls with the page (sticky) so the
//     visitor always sees the latest few
//   - skipped on mobile (<1024px)

interface AgentSpec {
  slug: string;
  label: string;
  accent: string;
  tasks: string[];
}

const AGENTS: AgentSpec[] = [
  { slug: 'researcher', label: 'researcher', accent: '#67E8F9', tasks: [
    'scanning 18 sources',
    'cross-checking citations',
    'flagging a new pricing diff',
    'drafting a brief',
    'tagging hot leads',
  ]},
  { slug: 'planner', label: 'planner', accent: '#FB7185', tasks: [
    'mapping a 7-phase plan',
    'estimating cycle time',
    'spotting blockers',
    'reordering tomorrow',
    'queuing day-1 tasks',
  ]},
  { slug: 'outreach', label: 'outreach', accent: '#FBBF24', tasks: [
    'drafting 12 cold emails',
    'A/B testing subjects',
    'queuing follow-ups',
    'flagging 3 hot replies',
    'researching ICP signals',
  ]},
  { slug: 'coder', label: 'coder', accent: '#4ADE80', tasks: [
    'writing route handler',
    'fixing 11 type errors',
    'adding test coverage',
    'shipping a PR',
    'optimizing a query',
  ]},
  { slug: 'designer', label: 'designer', accent: '#F472B6', tasks: [
    'iterating on the hero',
    'building a moodboard',
    'testing 4 palettes',
    'exporting assets',
    'reviewing copy',
  ]},
  { slug: 'analyst', label: 'analyst', accent: '#A78BFA', tasks: [
    'noticing reply rate drift',
    'proposing 3 A/B fixes',
    'flagging a cohort change',
    'sizing the impact',
    'writing the recommendation',
  ]},
  { slug: 'browser', label: 'browser', accent: '#67E8F9', tasks: [
    'diffing a pricing page',
    'screenshotting a competitor',
    'parsing the changelog',
    'archiving the evidence',
    'logging the change',
  ]},
];

interface Walker {
  id: string;
  agent: AgentSpec;
  yPct: number; // viewport-y where the croc walks (random per spawn)
  dur: number; // how long the walk lasts in seconds
  direction: 'lr' | 'rl';
  task: string;
}

interface Bento {
  id: string;
  agent: AgentSpec;
  task: string;
  ts: number;
}

export function ScrollAgents() {
  const [enabled, setEnabled] = useState(false);
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [bentos, setBentos] = useState<Bento[]>([]);
  const counter = useRef(0);
  const { scrollYProgress } = useScroll();

  // Don't render on mobile or until interactive
  useEffect(() => {
    const onResize = () => setEnabled(window.innerWidth >= 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Spawn a new walker every 2.5-4s. When a walker finishes its walk,
  // the AnimatePresence onExit drops a bento.
  useEffect(() => {
    if (!enabled) return;
    let lastSlug = '';
    const spawn = () => {
      const candidates = AGENTS.filter((a) => a.slug !== lastSlug);
      const agent = candidates[Math.floor(Math.random() * candidates.length)];
      const task = agent.tasks[Math.floor(Math.random() * agent.tasks.length)];
      counter.current += 1;
      const w: Walker = {
        id: `w-${counter.current}-${Math.random().toString(36).slice(2, 6)}`,
        agent,
        yPct: 20 + Math.random() * 60, // never edge-of-viewport
        dur: 8 + Math.random() * 5,
        direction: Math.random() < 0.5 ? 'lr' : 'rl',
        task,
      };
      lastSlug = agent.slug;
      setWalkers((curr) => [...curr, w]);
      // Drop the bento halfway through the walk so the user sees it
      // appear FROM where the croc currently is. We schedule the bento
      // emit slightly before walker exit.
      window.setTimeout(() => {
        const b: Bento = {
          id: `b-${counter.current}-${Math.random().toString(36).slice(2, 6)}`,
          agent: w.agent,
          task: w.task,
          ts: Date.now(),
        };
        setBentos((bs) => [b, ...bs].slice(0, 6));
      }, w.dur * 1000 * 0.6);
      // Despawn after walk
      window.setTimeout(() => {
        setWalkers((curr) => curr.filter((x) => x.id !== w.id));
      }, w.dur * 1000);
    };
    spawn();
    const interval = window.setInterval(spawn, 2500 + Math.random() * 1500);
    return () => window.clearInterval(interval);
  }, [enabled]);

  // Track scroll % for the top progress rail
  const [scrollPct, setScrollPct] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setScrollPct(Math.round(v * 100));
  });

  if (!enabled) return null;

  return (
    <>
      {/* Page-scroll progress rail */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden h-0.5 lg:block"
      >
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400"
          style={{ scaleX: scrollYProgress }}
        />
        <p
          className="absolute right-2 top-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint"
          style={{ opacity: scrollPct > 2 ? 1 : 0, transition: 'opacity 0.3s' }}
        >
          building · {scrollPct}%
        </p>
      </div>

      {/* Walking-agents layer — fixed full viewport, pointer-events none */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 hidden overflow-hidden lg:block"
      >
        <AnimatePresence>
          {walkers.map((w) => (
            <Walker key={w.id} walker={w} />
          ))}
        </AnimatePresence>
      </div>

      {/* Right-edge bento stack — sticky pile of "what just got built" */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
        style={{ width: 260 }}
      >
        <div className="rounded-2xl border border-white/[0.08] bg-bg-1/80 p-2 shadow-glow backdrop-blur-xl pointer-events-auto">
          <p className="flex items-center gap-1.5 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            live · agents building
          </p>
          <ul className="space-y-1.5">
            <AnimatePresence initial={false}>
              {bentos.map((b) => (
                <BentoCard key={b.id} bento={b} />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </>
  );
}

function Walker({ walker }: { walker: Walker }) {
  const startX = walker.direction === 'lr' ? -120 : window.innerWidth + 120;
  const endX = walker.direction === 'lr' ? window.innerWidth + 120 : -120;
  return (
    <motion.div
      className="absolute"
      style={{ top: `${walker.yPct}%`, willChange: 'transform' }}
      initial={{ x: startX, opacity: 0 }}
      animate={{ x: endX, opacity: [0, 1, 1, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: walker.dur, ease: 'linear', times: [0, 0.05, 0.5, 0.95, 1] }}
    >
      {/* slight up-down bob = the "walking" motion */}
      <motion.div
        animate={{ y: [-2, 2, -2], rotate: walker.direction === 'lr' ? [-3, 3, -3] : [3, -3, 3] }}
        transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div
          className="relative h-16 w-16 overflow-hidden rounded-xl bg-black ring-1"
          style={{
            boxShadow: `inset 0 0 0 1.5px ${walker.agent.accent}55, 0 0 24px ${walker.agent.accent}33`,
            transform: walker.direction === 'rl' ? 'scaleX(-1)' : 'none',
          }}
        >
          <Image
            src={`/assets/cast-v6/${walker.agent.slug}.png`}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        {/* small "task" tooltip floats above the croc as it walks */}
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border bg-bg-1/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] backdrop-blur-md"
          style={{ borderColor: `${walker.agent.accent}55`, color: walker.agent.accent }}
        >
          {walker.task}
        </div>
        {/* drop-particle: small sparkle behind the croc indicating it "left a card" */}
        <motion.span
          className="absolute -bottom-1 -left-1 text-[14px]"
          style={{ color: walker.agent.accent }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 1.6] }}
          transition={{ duration: 1.4, delay: walker.dur * 0.55, ease: 'easeOut' }}
        >
          ✦
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

function BentoCard({ bento }: { bento: Bento }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 30, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="rounded-xl border bg-white/[0.02] p-2.5"
        style={{ borderColor: `${bento.agent.accent}26` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-black"
            style={{ boxShadow: `inset 0 0 0 1px ${bento.agent.accent}44` }}
          >
            <Image
              src={`/assets/cast-v6/${bento.agent.slug}.png`}
              alt=""
              fill
              sizes="28px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[9px] uppercase tracking-[0.2em]"
              style={{ color: bento.agent.accent }}
            >
              {bento.agent.label}
            </p>
            <p className="line-clamp-2 text-[11px] leading-snug text-ink">{bento.task}</p>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

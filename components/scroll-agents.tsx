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

      {/* Walking-agents layer — BACKGROUND z (behind content), low opacity.
          The crocs sweep across the screen like cute shooting stars; the
          bento "task drops" follow the same path. Never competes with
          the hero or cards. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden lg:block"
        style={{ opacity: 0.4 }}
      >
        <AnimatePresence>
          {walkers.map((w) => (
            <Walker key={w.id} walker={w} />
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {bentos.map((b) => (
            <BentoComet key={b.id} bento={b} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

function Walker({ walker }: { walker: Walker }) {
  // Small croc that drifts across the background like a shooting star.
  // No tooltip — the BentoComet does the narration. Smaller scale +
  // gentle bob so it reads as ambient motion, never as a UI element.
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const startX = walker.direction === 'lr' ? -80 : viewportW + 80;
  const endX = walker.direction === 'lr' ? viewportW + 80 : -80;
  return (
    <motion.div
      className="absolute"
      style={{ top: `${walker.yPct}%`, willChange: 'transform' }}
      initial={{ x: startX, opacity: 0 }}
      animate={{ x: endX, opacity: [0, 0.7, 0.7, 0.7, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: walker.dur, ease: 'linear', times: [0, 0.05, 0.5, 0.95, 1] }}
    >
      <motion.div
        animate={{ y: [-2, 2, -2], rotate: walker.direction === 'lr' ? [-3, 3, -3] : [3, -3, 3] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div
          className="relative h-9 w-9 overflow-hidden rounded-lg bg-black"
          style={{
            boxShadow: `inset 0 0 0 1px ${walker.agent.accent}55, 0 0 14px ${walker.agent.accent}33`,
            transform: walker.direction === 'rl' ? 'scaleX(-1)' : 'none',
          }}
        >
          <Image
            src={`/assets/cast-v7/${walker.agent.slug}.png`}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// BentoComet — a "task drop" that streaks across the background like a
// shooting star. Random direction, ~9s arc, no sticky stack. Reads as
// ambient evidence the agents keep producing work.
function BentoComet({ bento }: { bento: Bento }) {
  // Spawn at random Y, random horizontal direction, drift across.
  const fromLeft = Math.random() < 0.5;
  const startY = 15 + Math.random() * 70;
  const endY = startY + (Math.random() - 0.5) * 20;
  return (
    <motion.div
      className="absolute"
      style={{ top: `${startY}%`, left: fromLeft ? '-30%' : '110%' }}
      initial={{ x: 0, opacity: 0 }}
      animate={{
        x: fromLeft ? '140vw' : '-140vw',
        opacity: [0, 0.9, 0.9, 0],
        top: `${endY}%`,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 9, ease: 'linear', times: [0, 0.1, 0.9, 1] }}
    >
      <div className="flex items-center gap-2">
        {/* trail */}
        <div
          className="h-px"
          style={{
            width: 80,
            background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${bento.agent.accent}, transparent)`,
            boxShadow: `0 0 8px ${bento.agent.accent}55`,
          }}
        />
        {/* mini bento card head */}
        <div
          className="flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 backdrop-blur-md"
          style={{
            borderColor: `${bento.agent.accent}55`,
            background: `rgba(0,0,0,0.6)`,
            boxShadow: `0 0 12px ${bento.agent.accent}33`,
          }}
        >
          <span
            className="inline-block h-1 w-1 rounded-full"
            style={{ background: bento.agent.accent, boxShadow: `0 0 5px ${bento.agent.accent}` }}
          />
          <span
            className="font-mono text-[8.5px] uppercase tracking-[0.18em]"
            style={{ color: bento.agent.accent }}
          >
            {bento.agent.label}
          </span>
          <span className="whitespace-nowrap text-[10px] text-ink-dim">{bento.task}</span>
        </div>
      </div>
    </motion.div>
  );
}

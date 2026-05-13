'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  useMotionValueEvent,
} from 'framer-motion';

// ScrollAgents — the SIGNATURE feature.
//
// Five cast crocs floating in a fixed dock on the right edge of the
// viewport. As the visitor scrolls down the page, the crocs:
//
//   1. drift smoothly between scroll-anchored Y positions
//   2. emit tool "parts" that fly toward the section currently in view
//   3. spawn live build-cards into a ticker beneath them showing what
//      they're working on right now ("researcher: scanning 5 sources",
//      "coder: writing route handler", etc.) — a never-ending feed
//
// Every visitor becomes a live witness to the agents working in real
// time. This is the daily-ritual mandate made visible: the brocco
// product literally builds the site in front of you.
//
// The component is non-blocking, pointer-events-none on the dock so it
// never traps clicks. It renders only on viewport widths >= 1024px so
// mobile users get the standard page.

interface AgentSpec {
  slug: string;
  label: string;
  accent: string;
  tasks: string[];
}

const AGENTS: AgentSpec[] = [
  {
    slug: 'researcher',
    label: 'researcher',
    accent: '#67E8F9',
    tasks: [
      'scanning 18 sources',
      'extracting key claims',
      'cross-checking citations',
      'drafting brief',
      'flagging contradictions',
    ],
  },
  {
    slug: 'planner',
    label: 'planner',
    accent: '#FB7185',
    tasks: [
      'mapping 7-phase plan',
      'estimating cycle time',
      'spotting blockers',
      'reordering sprint',
      'queuing day-1 tasks',
    ],
  },
  {
    slug: 'outreach',
    label: 'outreach',
    accent: '#FBBF24',
    tasks: [
      'drafting 12 cold emails',
      'researching ICP signals',
      'A/B testing subject lines',
      'queuing follow-ups',
      'flagging hot replies',
    ],
  },
  {
    slug: 'coder',
    label: 'coder',
    accent: '#4ADE80',
    tasks: [
      'writing route handler',
      'fixing type errors',
      'adding test coverage',
      'optimizing query plan',
      'shipping PR',
    ],
  },
  {
    slug: 'designer',
    label: 'designer',
    accent: '#F472B6',
    tasks: [
      'building moodboard',
      'iterating on hero',
      'testing color palette',
      'exporting assets',
      'reviewing micro-copy',
    ],
  },
];

interface TickerItem {
  id: string;
  agent: AgentSpec;
  task: string;
  ts: number;
}

export function ScrollAgents() {
  const [enabled, setEnabled] = useState(false);
  const [ticker, setTicker] = useState<TickerItem[]>([]);
  const { scrollYProgress } = useScroll();

  // Smooth the scroll so the dock doesn't jitter
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 0.4,
  });

  // Don't render on mobile or until the page is interactive
  useEffect(() => {
    const onResize = () => setEnabled(window.innerWidth >= 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Every 1.8s, push a new task into the ticker — different agent each
  // time, never repeats more than 1 in a row.
  useEffect(() => {
    if (!enabled) return;
    let lastSlug = '';
    const push = () => {
      const candidates = AGENTS.filter((a) => a.slug !== lastSlug);
      const agent = candidates[Math.floor(Math.random() * candidates.length)];
      const task = agent.tasks[Math.floor(Math.random() * agent.tasks.length)];
      lastSlug = agent.slug;
      setTicker((t) => {
        const next: TickerItem = {
          id: `${agent.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          agent,
          task,
          ts: Date.now(),
        };
        return [next, ...t].slice(0, 5);
      });
    };
    push();
    const interval = window.setInterval(push, 1800);
    return () => window.clearInterval(interval);
  }, [enabled]);

  // Track scroll progress as a percentage, only for the ProgressBar
  const [scrollPct, setScrollPct] = useState(0);
  useMotionValueEvent(smoothScroll, 'change', (v) => {
    setScrollPct(Math.round(v * 100));
  });

  if (!enabled) return null;

  return (
    <>
      {/* Floating dock pinned to the right edge — five crocs that drift
          vertically as the user scrolls, each at their own offset. */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
        style={{ width: 80 }}
      >
        <div className="flex flex-col items-center gap-3">
          {AGENTS.map((a, i) => (
            <ScrollAgent key={a.slug} agent={a} index={i} progress={smoothScroll} />
          ))}
        </div>

        {/* Live ticker — what each agent is doing right now */}
        <div className="mt-5 w-[260px] -translate-x-[180px] rounded-xl border border-white/[0.08] bg-bg-1/90 p-2 shadow-glow backdrop-blur-xl pointer-events-auto">
          <p className="flex items-center gap-1.5 px-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            live · agents working
          </p>
          <ul className="mt-1.5 space-y-1">
            <AnimatePresence initial={false}>
              {ticker.map((it) => (
                <motion.li
                  key={it.id}
                  layout
                  initial={{ opacity: 0, x: 24, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: -24, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 rounded-md bg-white/[0.02] px-1.5 py-1">
                    <span
                      className="inline-block h-1 w-1 rounded-full"
                      style={{ background: it.agent.accent, boxShadow: `0 0 5px ${it.agent.accent}` }}
                    />
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-[0.18em]"
                      style={{ color: it.agent.accent }}
                    >
                      {it.agent.label}
                    </span>
                    <span className="truncate text-[11px] text-ink-dim">{it.task}</span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>

      {/* Page-scroll progress rail along the top edge */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden h-0.5 lg:block"
      >
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400"
          style={{ scaleX: smoothScroll }}
        />
        <p
          className="absolute right-2 top-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint"
          style={{ opacity: scrollPct > 2 ? 1 : 0, transition: 'opacity 0.3s' }}
        >
          building · {scrollPct}%
        </p>
      </div>

      {/* Parts emitter: tiny floating glyphs that fly inward from the
          dock toward the page center. Hint that the agents are "carrying
          parts" to the section being built. */}
      <PartsEmitter />
    </>
  );
}

function ScrollAgent({
  agent,
  index,
  progress,
}: {
  agent: AgentSpec;
  index: number;
  progress: ReturnType<typeof useSpring>;
}) {
  // Each agent has its own scroll-y range — they descend at slightly
  // different speeds, creating a "team moves together" feel without
  // being a robotic line.
  const drift = useTransform(progress, [0, 1], [index * -8, index * 8]);
  const wobble = useTransform(progress, (v) => Math.sin(v * 6 + index) * 4);

  return (
    <motion.div
      className="relative"
      style={{ y: drift }}
      animate={{ rotate: [-2, 2, -2] }}
      transition={{ duration: 5 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="relative h-14 w-14 overflow-hidden rounded-xl bg-black ring-1"
        style={{
          boxShadow: `inset 0 0 0 1.5px ${agent.accent}55, 0 0 24px ${agent.accent}33`,
          x: wobble,
        }}
      >
        <Image
          src={`/assets/cast-v6/${agent.slug}.png`}
          alt={agent.label}
          fill
          sizes="56px"
          className="object-cover"
          priority={false}
        />
      </motion.div>
      {/* tiny accent dot — implies the agent is online */}
      <span
        className="absolute right-0 top-0 h-2 w-2 rounded-full ring-2 ring-bg-0"
        style={{ background: agent.accent, boxShadow: `0 0 8px ${agent.accent}` }}
      />
    </motion.div>
  );
}

function PartsEmitter() {
  const [parts, setParts] = useState<Array<{ id: number; emoji: string; delay: number }>>([]);
  const counter = useRef(0);

  useEffect(() => {
    const emojis = ['*', '+', '~', '/', '\\', '·', '#', '@'];
    const push = () => {
      counter.current += 1;
      setParts((ps) =>
        [
          ...ps,
          {
            id: counter.current,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            delay: Math.random() * 0.5,
          },
        ].slice(-6),
      );
    };
    const t = window.setInterval(push, 700);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      <AnimatePresence>
        {parts.map((p) => (
          <motion.span
            key={p.id}
            initial={{
              opacity: 0,
              x: `calc(100vw - ${100 + Math.random() * 40}px)`,
              y: `${30 + Math.random() * 40}%`,
              scale: 0.5,
            }}
            animate={{
              opacity: [0, 0.4, 0],
              x: `${20 + Math.random() * 40}%`,
              y: `${20 + Math.random() * 60}%`,
              scale: [0.5, 1, 0.8],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 + Math.random(), delay: p.delay, ease: 'easeOut' }}
            className="absolute font-mono text-[11px] text-emerald-300/40"
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

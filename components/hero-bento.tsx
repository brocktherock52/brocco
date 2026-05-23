'use client';

/**
 * HeroBento — completely reimagined hero.
 *
 * A 5-tile asymmetric bento grid (signature 21st.dev / linear / vercel
 * pattern). Each tile is its own scene with its own choreography. Nothing
 * about this layout reads "centered headline + mascot mosaic" the way
 * the previous hero did.
 *
 * Desktop grid:
 *   +-------------------------------+-----------------+
 *   | HEADLINE  (col-span-8, row 1) |  METRICS  (5,1) |
 *   |                               +-----------------+
 *   |                               |  AGENT STACK    |
 *   +-------------------------------+-----------------+
 *   |  TERMINAL  (col-span-8)       |  INSTALL  (4)   |
 *   +-------------------------------+-----------------+
 *
 * Mobile: single column stack.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import {
  ArrowRight,
  Apple,
  ChevronRight,
  Cpu,
  Download,
  KeySquare,
  Monitor,
  Sparkles,
  TerminalSquare,
  Zap,
} from 'lucide-react';
import { MagneticLink } from './ui/magnetic';
import { AnimatedNumber } from './ui/animated-number';
import { AGENTS } from '@/lib/agents';
import { cn } from '@/lib/utils';
import {
  AnthropicIcon,
  OpenAIIcon,
  OllamaIcon,
  CursorIcon,
  SlackIcon,
  ZapierIcon,
  N8nIcon,
} from './brand-icons';

// -----------------------------------------------------------------------------
// Tile shell — every bento tile uses the same skin so they read as one set.
// -----------------------------------------------------------------------------
function Tile({
  className,
  children,
  hover = true,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}) {
  const reduce = useReducedMotion();
  // Touch devices don't get 3D tilt — the mouseMove handler fires on every
  // touchmove and causes scroll jank on mobile. `pointer: fine` is true for
  // mice/styluses, false for touch. Hover is also disabled on small viewports.
  const [pointerFine, setPointerFine] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine) and (min-width: 1024px)');
    const apply = () => setPointerFine(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  const tiltEnabled = hover && !reduce && pointerFine;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 90, damping: 18 });
  const sy = useSpring(y, { stiffness: 90, damping: 18 });

  return (
    <motion.div
      onMouseMove={
        tiltEnabled
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              x.set(((e.clientX - r.left) / r.width - 0.5) * 6);
              y.set(((e.clientY - r.top) / r.height - 0.5) * 6);
            }
          : undefined
      }
      onMouseLeave={
        tiltEnabled
          ? () => {
              x.set(0);
              y.set(0);
            }
          : undefined
      }
      style={tiltEnabled ? { rotateX: sy, rotateY: sx, transformStyle: 'preserve-3d' } : undefined}
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-white/[0.08]',
        'bg-gradient-to-br from-white/[0.035] via-white/[0.015] to-transparent',
        'shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_30px_60px_-30px_rgba(0,0,0,0.6)]',
        'backdrop-blur-xl',
        className,
      )}
    >
      {/* Edge gradient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(60% 80% at 50% 0%, rgba(167,139,250,0.15) 0%, transparent 60%)',
        }}
      />
      {children}
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// HEADLINE TILE — display type, ambient gradient, dual CTAs
// -----------------------------------------------------------------------------
function HeadlineTile() {
  const reduce = useReducedMotion();

  return (
    <Tile hover={false} className="relative flex flex-col p-7 md:p-10">
      {/* Aurora wash */}
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124,58,237,0.30) 0%, transparent 60%)',
              filter: 'blur(20px)',
            }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-24 -bottom-24 h-[360px] w-[360px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(34,211,238,0.22) 0%, transparent 60%)',
              filter: 'blur(28px)',
            }}
            animate={{ x: [0, -25, 0], y: [0, 20, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </>
      )}

      {/* Status pill */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative inline-flex items-center gap-2 self-start rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 backdrop-blur-md"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-dim">
          live · v2.2 · jsonl audit
        </span>
      </motion.div>

      {/* Display headline */}
      <h1 className="relative mt-7 leading-[0.92] tracking-[-0.045em]">
        <motion.span
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-grad block text-[clamp(3.4rem,6.5vw,6rem)] font-[750]"
        >
          an AI startup.
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-grad-brand block font-serif text-[clamp(3.4rem,6.5vw,6rem)] font-normal italic"
        >
          in a tab.
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative mt-7 max-w-[500px] text-[17px] leading-[1.55] text-ink-dim"
      >
        Nine specialists. One prompt. They split the goal, run in parallel, and brief you back with a
        sourced research drop, a launch plan, and a stack of outreach drafts. Ship before your coffee
        cools. <span className="text-white">100 free runs every month</span>, no card.
      </motion.p>

      {/* CTAs. Two primary paths: start a paid trial via Stripe Checkout (the
          one-click revenue path that works without magic-link), or open the
          free demo dashboard. Both should be the same visual weight so a
          visitor who wants to try-before-buy isn't pushed away. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55 }}
        className="relative mt-9 flex flex-wrap items-center gap-3"
      >
        <HeroSubscribeButton />
        <MagneticLink href="/app" className="btn-ghost group text-[15px] px-6 py-3.5" strength={10}>
          <span>try the demo, no card</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </MagneticLink>
      </motion.div>

      {/* Reassurance row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.85 }}
        className="relative mt-7 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint"
      >
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-cyan-glow" /> 100 free runs / mo
        </span>
        <span>·</span>
        <span>no card</span>
        <span>·</span>
        <span>11 min to first run</span>
      </motion.div>

      {/* SpawnConveyor removed 2026-05-22. The CSS conveyor was decorative
          theater. The real factory belongs in the Higgsfield Kling 3.0 video
          (rendered in components/brocco-factory.tsx) so the hero stays focused
          on the headline and the install CTA. */}
    </Tile>
  );
}

// SpawnConveyor + CONVEYOR_AGENTS deleted 2026-05-22. The real factory animation
// is the Higgsfield Kling 3.0 video in components/brocco-factory.tsx. The hero
// no longer needs a decorative CSS conveyor.

// HeroSubscribeButton - routes to the /checkout/solo upsell page, which then
// posts to /api/checkout (Stripe) on confirm. Lets us anchor value and offer
// the annual upgrade + community add-on before Stripe collects card details.
function HeroSubscribeButton() {
  return (
    <Link
      href="/checkout/solo"
      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-cyan px-6 py-3.5 text-[15px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow"
    >
      <Sparkles className="h-4 w-4" />
      <span>start 7-day trial . $49/mo</span>
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

// -----------------------------------------------------------------------------
// METRICS TILE — animated counters with a pulsing micro-sparkline
// -----------------------------------------------------------------------------
function MetricsTile() {
  const [runs, setRuns] = useState(2847);
  const [tokens, setTokens] = useState(9.2);
  const [cost, setCost] = useState(12.4);
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: 18 }, () => 0.35 + Math.random() * 0.65),
  );

  // Live-ish telemetry: tick the numbers fast so the panel is visibly busy
  useEffect(() => {
    const id = setInterval(() => {
      setRuns((r) => r + Math.floor(Math.random() * 8));
      setTokens((t) => +(t + Math.random() * 0.06).toFixed(2));
      setCost((c) => +(c + Math.random() * 0.12).toFixed(2));
    }, 700);
    return () => clearInterval(id);
  }, []);

  // Rotate sparkline values every 2s so the bars actually change shape
  useEffect(() => {
    const id = setInterval(() => {
      setBars((curr) => [
        ...curr.slice(1),
        0.35 + Math.random() * 0.65,
      ]);
    }, 600);
    return () => clearInterval(id);
  }, []);

  return (
    <Tile className="flex h-full flex-col p-6">
      <header className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          telemetry · last 60s
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          byok meter
        </span>
      </header>

      {/* Three rich metric cards. Each cell has the big number plus its own
          mini-sparkline + delta so the panel reads as a control surface, not
          three lonely digits. */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <MetricCard
          label="runs"
          value={runs}
          format={(v) => Math.round(v).toLocaleString()}
          delta="+12"
          accent="#22C55E"
        />
        <MetricCard
          label="tokens"
          value={tokens}
          format={(v) => `${v.toFixed(1)}M`}
          delta="+0.4M"
          accent="#67E8F9"
        />
        <MetricCard
          label="byok cost"
          value={cost}
          format={(v) => `$${v.toFixed(2)}`}
          delta="+$0.18"
          accent="#A78BFA"
        />
      </div>

      {/* Main sparkline */}
      <div className="mt-4 flex h-10 items-end gap-1">
        {bars.map((b, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-sm bg-gradient-to-t from-brand/50 to-cyan/50"
            style={{ originY: 1 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [b * 0.6, b, b * 0.7, b * 0.95, b] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.05,
            }}
          />
        ))}
      </div>

      {/* Live activity stream */}
      <LiveActivityStream />
    </Tile>
  );
}

// MetricCard - one cell of the Metrics tile. Big number + mini-sparkline +
// delta so each cell reads as its own micro-panel rather than a lonely digit.
function MetricCard({
  label,
  value,
  format,
  delta,
  accent,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
  delta: string;
  accent: string;
}) {
  // Each card gets its own mini-sparkline that ticks independently. The values
  // are stochastic but bounded so the spark always looks alive.
  const [spark, setSpark] = useState<number[]>(() =>
    Array.from({ length: 10 }, () => 0.3 + Math.random() * 0.65),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setSpark((curr) => [...curr.slice(1), 0.3 + Math.random() * 0.65]);
    }, 750);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-2.5 py-2 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">{label}</p>
      <p className="mt-1 font-mono text-[17px] font-semibold tabular-nums" style={{ color: accent }}>
        <AnimatedNumber value={value} format={format} />
      </p>
      <div className="mt-1 flex h-3.5 items-end gap-[2px]">
        {spark.map((s, i) => (
          <span
            key={i}
            className="flex-1 rounded-[1px]"
            style={{ height: `${Math.round(s * 100)}%`, background: `${accent}55` }}
          />
        ))}
      </div>
      <p className="mt-1 font-mono text-[9.5px] tabular-nums text-emerald-400/90">
        <span className="inline-block translate-y-[-0.5px]">▲</span> {delta}
      </p>
    </div>
  );
}

// LiveActivityStream — a tiny terminal-style feed of agent events. New
// row pushes in every ~900ms; oldest row falls off when the stack hits 5.
// Fills what used to be empty space under the network metrics.
function LiveActivityStream() {
  const POOL = [
    { agent: 'researcher', color: 'text-cyan-glow', verb: 'scanning', tail: '18 sources' },
    { agent: 'planner', color: 'text-rose-300', verb: 'mapping', tail: '7 phases' },
    { agent: 'outreach', color: 'text-amber-300', verb: 'drafting', tail: '12 emails' },
    { agent: 'analyst', color: 'text-violet-300', verb: 'analyzing', tail: 'reply rate' },
    { agent: 'coder', color: 'text-emerald-400', verb: 'committing', tail: 'route handler' },
    { agent: 'designer', color: 'text-pink-300', verb: 'iterating', tail: 'hero v3' },
    { agent: 'browser', color: 'text-cyan-glow', verb: 'diffing', tail: 'pricing page' },
    { agent: 'supervisor', color: 'text-emerald-400', verb: 'synthesizing', tail: 'team report' },
    { agent: 'ops', color: 'text-cyan-glow', verb: 'shredding', tail: '412 docs' },
  ];
  const [rows, setRows] = useState<Array<{ id: number; entry: (typeof POOL)[number] }>>(() => [
    { id: 1, entry: POOL[0] },
    { id: 2, entry: POOL[1] },
    { id: 3, entry: POOL[2] },
    { id: 4, entry: POOL[3] },
    { id: 5, entry: POOL[4] },
  ]);
  useEffect(() => {
    let counter = 5;
    const id = setInterval(() => {
      counter += 1;
      const entry = POOL[Math.floor(Math.random() * POOL.length)];
      setRows((curr) => [{ id: counter, entry }, ...curr].slice(0, 5));
    }, 900);
    return () => clearInterval(id);
  }, []);
  return (
    <ul className="mt-4 space-y-1 overflow-hidden font-mono text-[10.5px]">
      {rows.map((r) => (
        <motion.li
          key={r.id}
          layout
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
          <span className={`uppercase tracking-[0.18em] ${r.entry.color}`}>{r.entry.agent}</span>
          <span className="text-ink-faint">{r.entry.verb}</span>
          <span className="text-ink-dim">{r.entry.tail}</span>
        </motion.li>
      ))}
    </ul>
  );
}

// -----------------------------------------------------------------------------
// AGENT STACK TILE — vertical list of running agents (live status colors)
// -----------------------------------------------------------------------------
function AgentStackTile() {
  // Show 5 representative agents so the panel reads as "broadcast in flight"
  const featured = ['supervisor', 'researcher', 'planner', 'coder', 'outreach'];
  const list = AGENTS.filter((a) => featured.includes(a.name));

  return (
    <Tile className="flex h-full flex-col p-6">
      <header className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          broadcast · 5 panes live
        </span>
        <Link
          href="/agents"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-glow transition-colors hover:text-white"
        >
          view all <ChevronRight className="inline h-3 w-3" />
        </Link>
      </header>

      <ul className="mt-5 flex-1 space-y-2.5">
        {list.map((a, i) => (
          <motion.li
            key={a.name}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.45 }}
            className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2 transition-colors hover:border-white/[0.10] hover:bg-white/[0.04]"
          >
            <motion.span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: a.color, boxShadow: `0 0 10px ${a.color}` }}
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            />
            <span className="font-mono text-[12px] lowercase" style={{ color: a.color }}>
              {a.name}
            </span>
            <span className="ml-auto font-mono text-[10.5px] text-ink-faint">
              {a.tools.length} tools
            </span>
          </motion.li>
        ))}
      </ul>
    </Tile>
  );
}

// -----------------------------------------------------------------------------
// TERMINAL TILE — cycling typewriter showing real tool-call JSONL
// -----------------------------------------------------------------------------
const TERMINAL_SCENES = [
  {
    agent: 'researcher',
    color: '#67E8F9',
    lines: [
      '> brocco run --agent researcher',
      '> goal: top 3 agentic ai platforms 2026',
      '[tool] search_web { query: "agentic AI platforms 2026 enterprise" }',
      '[result] 12 sources. crunchbase / a16z / gartner / langchain blog ...',
      '[tool] memory_put { key: "research_brief", chars: 2840 }',
      '[done] 6 steps · 4.2s · $0.012',
    ],
  },
  {
    agent: 'outreach',
    color: '#FBBF24',
    lines: [
      '> brocco run --agent outreach --recipient richard',
      '> goal: 3 cold drafts about 8 detroit westside deals',
      '[tool] http_get { url: "/crm/contacts/richard" }',
      '[tool] memory_put { variant: "A", chars: 412 }',
      '[tool] memory_put { variant: "B", chars: 438 }',
      '[done] 3 drafts · send-time tue 9:14 am pt',
    ],
  },
  {
    agent: 'supervisor',
    color: '#22C55E',
    lines: [
      '> brocco run --agent supervisor --recipe launch-day',
      '[plan] 3 sub-agents: researcher, planner, outreach',
      '[delegate] researcher --> keyword cluster',
      '[delegate] planner --> 14-day calendar',
      '[delegate] outreach --> 5 launch tweets',
      '[synth] 4m 22s · final brief ready',
    ],
  },
];

function TerminalTile() {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduce) {
      setShown(TERMINAL_SCENES[scene].lines.length);
      return;
    }
    setShown(0);
    let i = 0;
    const total = TERMINAL_SCENES[scene].lines.length;
    const reveal = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= total) clearInterval(reveal);
    }, 520);
    const next = setTimeout(() => {
      setScene((s) => (s + 1) % TERMINAL_SCENES.length);
    }, total * 520 + 1500);
    return () => {
      clearInterval(reveal);
      clearTimeout(next);
    };
  }, [scene, reduce]);

  const s = TERMINAL_SCENES[scene];

  return (
    <Tile className="flex h-full flex-col p-0">
      <header className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
        </span>
        <span className="font-mono text-[12px] text-ink-faint">brocco.run</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={s.agent}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            className="font-mono text-[11px] lowercase"
            style={{ color: s.color }}
          >
            · {s.agent}
          </motion.span>
        </AnimatePresence>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          streaming
        </span>
      </header>

      <div className="flex-1 p-5 font-mono text-[12.5px] leading-[1.7]">
        <AnimatePresence mode="popLayout">
          {s.lines.slice(0, shown).map((line, i) => (
            <motion.div
              key={`${scene}-${i}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                line.startsWith('>')
                  ? 'text-white'
                  : line.startsWith('[tool]')
                    ? 'text-cyan-glow'
                    : line.startsWith('[result]')
                      ? 'text-violet-300'
                      : line.startsWith('[plan]') || line.startsWith('[delegate]')
                        ? 'text-amber-300'
                        : line.startsWith('[synth]') || line.startsWith('[done]')
                          ? 'text-emerald-400'
                          : 'text-ink-dim',
              )}
            >
              {line}
            </motion.div>
          ))}
        </AnimatePresence>
        {shown < s.lines.length && (
          <motion.span
            aria-hidden
            className="ml-0.5 inline-block h-3 w-1.5 bg-cyan-glow align-middle"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
    </Tile>
  );
}

// -----------------------------------------------------------------------------
// INSTALL TILE — install paths (mac/win/mcp) as a compact selector card
// -----------------------------------------------------------------------------
const INSTALL_PATHS = [
  { id: 'mac', label: 'macOS', sub: 'Apple silicon / Intel', icon: Apple, href: '/download' },
  { id: 'win', label: 'Windows', sub: 'pwa or .exe', icon: Monitor, href: '/download' },
  { id: 'mcp', label: 'Claude Desktop', sub: 'mcp server', icon: KeySquare, href: '/download#mcp-setup' },
  { id: 'cli', label: 'CLI / curl', sub: 'rest + sse', icon: TerminalSquare, href: '/docs' },
];

function InstallTile() {
  const [active, setActive] = useState('mac');

  return (
    <Tile className="flex h-full flex-col p-6">
      <header className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          install
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-glow">
          4 paths · 1 runtime
        </span>
      </header>

      <ul className="mt-5 grid grid-cols-2 gap-2">
        {INSTALL_PATHS.map((p) => {
          const isActive = active === p.id;
          return (
            <li key={p.id}>
              <button
                onMouseEnter={() => setActive(p.id)}
                onFocus={() => setActive(p.id)}
                className={cn(
                  'relative w-full overflow-hidden rounded-xl border px-3 py-3 text-left transition-colors',
                  isActive
                    ? 'border-brand/40 bg-brand/10 text-white'
                    : 'border-white/[0.06] bg-white/[0.015] text-ink-dim hover:border-white/[0.14] hover:text-white',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="install-pill"
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-brand/20 to-cyan/10"
                  />
                )}
                <div className="flex items-center gap-2">
                  <p.icon className="h-4 w-4" />
                  <span className="text-[13px] font-semibold tracking-tight">{p.label}</span>
                </div>
                <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                  {p.sub}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-5">
        <MagneticLink
          href={INSTALL_PATHS.find((p) => p.id === active)?.href || '/download'}
          className="btn-ghost w-full justify-between text-[13px]"
          strength={8}
        >
          <span className="inline-flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />
            install for {INSTALL_PATHS.find((p) => p.id === active)?.label}
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
        </MagneticLink>
      </div>
    </Tile>
  );
}

// -----------------------------------------------------------------------------
// MAIN: HeroBento composes the 5 tiles in a 12-col bento grid.
// -----------------------------------------------------------------------------
export function HeroBento() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24" id="main">
      {/* Background grid + ambient hue */}
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-30 opacity-50" />
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[10%] -z-20 h-[720px] w-[1100px] -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(124,58,237,0.16) 0%, rgba(34,211,238,0.08) 40%, transparent 70%)',
            filter: 'blur(10px)',
          }}
          animate={{
            opacity: [0.85, 1, 0.85],
            scale: [1, 1.04, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="container-x relative">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
          }}
          className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12"
          style={{ perspective: 2000 }}
        >
          {/* HEADLINE — desktop: 8 wide, 2 rows tall */}
          <motion.div
            variants={tileVariants}
            className="lg:col-span-8 lg:row-span-2 lg:min-h-[540px]"
          >
            <HeadlineTile />
          </motion.div>

          {/* METRICS — desktop: 4 wide, 1 row */}
          <motion.div variants={tileVariants} className="lg:col-span-4 lg:min-h-[260px]">
            <MetricsTile />
          </motion.div>

          {/* AGENT STACK — desktop: 4 wide, 1 row */}
          <motion.div variants={tileVariants} className="lg:col-span-4 lg:min-h-[260px]">
            <AgentStackTile />
          </motion.div>

          {/* TERMINAL — desktop: 8 wide */}
          <motion.div variants={tileVariants} className="lg:col-span-8 lg:min-h-[300px]">
            <TerminalTile />
          </motion.div>

          {/* INSTALL — desktop: 4 wide */}
          <motion.div variants={tileVariants} className="lg:col-span-4 lg:min-h-[300px]">
            <InstallTile />
          </motion.div>
        </motion.div>

        {/* Live network strip — full-bleed agent mesh under the bento.
            Visualizes the running fleet as connected nodes pulsing with
            activity. Replaces the prior empty space between the bento
            grid and the wired-into row. */}
        {/* CosmicTeamShowcase removed 2026-05-22 per user feedback "live network web doesn't fit". */}

        {/* Sub-marquee strip below the bento */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-2xl border border-white/[0.06] bg-bg-1/30 px-5 py-3 backdrop-blur"
        >
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
            wired into
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-ink-dim">
            {[
              { label: 'Anthropic', Icon: AnthropicIcon },
              { label: 'OpenAI', Icon: OpenAIIcon },
              { label: 'Ollama', Icon: OllamaIcon },
              { label: 'Cursor', Icon: CursorIcon },
              { label: 'Claude Desktop', Icon: AnthropicIcon },
              { label: 'Slack', Icon: SlackIcon },
              { label: 'Zapier', Icon: ZapierIcon },
              { label: 'n8n', Icon: N8nIcon },
            ].map(({ label, Icon }) => (
              <span
                key={label}
                title={label}
                className="inline-flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
              >
                <Icon className="h-4 w-4 text-ink-dim" />
                <span className="text-[12.5px]">{label}</span>
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-cyan-glow">
            <Zap className="h-3 w-3" /> 8 integrations on day one
          </span>
        </motion.div>
      </div>
    </section>
  );
}

const tileVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

// -----------------------------------------------------------------------------
// CosmicTeamShowcase — replaces the old draggable Live Network (user feedback:
// "stagnant and tactile, may need to be scrapped"). New approach: full-bleed
// Higgsfield Kling 3.0 video of the crocs floating in nebula space, with
// floating agent name labels + a live activity ticker overlaid. Cinematic,
// not interactive, but reads as truly alive.
// -----------------------------------------------------------------------------
function CosmicTeamShowcase() {
  const reduce = useReducedMotion();
  const [activity, setActivity] = useState<Array<{ id: number; slug: string; accent: string; verb: string }>>(
    () => [
      { id: 1, slug: 'researcher', accent: '#67E8F9', verb: 'scanning 18 sources' },
      { id: 2, slug: 'planner', accent: '#FB7185', verb: 'mapping 7 phases' },
      { id: 3, slug: 'coder', accent: '#4ADE80', verb: 'shipping route handler' },
      { id: 4, slug: 'outreach', accent: '#FBBF24', verb: 'drafting 12 emails' },
    ],
  );
  const SHOWCASE_AGENTS = [
    { slug: 'supervisor', accent: '#22C55E', label: 'supervisor' },
    { slug: 'researcher', accent: '#67E8F9', label: 'researcher' },
    { slug: 'planner', accent: '#FB7185', label: 'planner' },
    { slug: 'outreach', accent: '#FBBF24', label: 'outreach' },
    { slug: 'coder', accent: '#4ADE80', label: 'coder' },
    { slug: 'designer', accent: '#F472B6', label: 'designer' },
    { slug: 'analyst', accent: '#A78BFA', label: 'analyst' },
    { slug: 'browser', accent: '#22D3EE', label: 'browser' },
    { slug: 'app_builder', accent: '#A78BFA', label: 'app builder' },
  ];
  const SHOWCASE_VERBS: Record<string, string[]> = {
    researcher: ['scanning 18 sources', 'cross-checking citations', 'flagging a pricing diff'],
    planner: ['mapping 7 phases', 'estimating cycle time', 'reordering tomorrow'],
    outreach: ['drafting 12 emails', 'A/B testing subjects', 'flagging 3 hot replies'],
    designer: ['iterating on the hero', 'building a moodboard', 'testing 4 palettes'],
    analyst: ['noticing reply rate drift', 'proposing 3 A/B fixes', 'sizing the impact'],
    coder: ['writing route handler', 'fixing 11 type errors', 'shipping a PR'],
    supervisor: ['delegating to 5 panes', 'synthesizing team report', 'rebalancing the queue'],
    browser: ['diffing a pricing page', 'screenshotting a competitor', 'archiving evidence'],
    app_builder: ['ships the fix', 'rewires the worker', 'patches the deploy'],
  };

  useEffect(() => {
    if (reduce) return;
    let counter = activity.length;
    const t = setInterval(() => {
      counter += 1;
      const a = SHOWCASE_AGENTS[Math.floor(Math.random() * SHOWCASE_AGENTS.length)];
      const verbs = SHOWCASE_VERBS[a.slug] ?? ['working'];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      setActivity((curr) => [{ id: counter, slug: a.slug, accent: a.accent, verb }, ...curr].slice(0, 4));
    }, 1500);
    return () => clearInterval(t);
  }, [reduce]);

  // Gate the video to viewport so the 16 MB MP4 doesn't ship to first-visitors.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [videoVisible, setVideoVisible] = useState(false);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVideoVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVideoVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <motion.div
      ref={wrapRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-0/60 backdrop-blur"
    >
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.05] px-5 py-2.5">
        <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-emerald-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          your AI team. live.
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          9 specialists. parallel runs. one prompt.
        </span>
      </div>

      {/* Full-bleed Kling 3.0 video of the crocs drifting in nebula space.
          Audio off so the page stays silent. Activity ticker floats on top. */}
      <div className="relative h-[280px] w-full overflow-hidden md:h-[360px]">
        {videoVisible ? (
          <video
            src="/assets/video/space-crocs.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
            poster="/assets/video-src/space-crocs-startframe.png"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-bg-1 to-cyan-950/40"
          />
        )}

        {/* Subtle vignette so overlays read on top */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(5,4,16,0.55) 100%)',
          }}
        />

        {/* Floating agent name pills drift across the video. They name the
            crocs the visitor sees on screen so the metaphor lands. */}
        {!reduce &&
          SHOWCASE_AGENTS.map((a, i) => {
            const startY = 8 + (i / SHOWCASE_AGENTS.length) * 78;
            return (
              <motion.div
                key={a.slug}
                aria-hidden
                className="pointer-events-none absolute"
                style={{ top: `${startY}%`, left: '-25%' }}
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: '160%', opacity: [0, 0.95, 0.95, 0] }}
                transition={{
                  duration: 14 + (i % 3),
                  delay: i * 1.6,
                  repeat: Infinity,
                  ease: 'linear',
                  times: [0, 0.15, 0.85, 1],
                }}
              >
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border bg-bg-0/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur"
                  style={{ borderColor: `${a.accent}55`, color: a.accent }}
                >
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{ background: a.accent, boxShadow: `0 0 8px ${a.accent}` }}
                  />
                  {a.label}
                </span>
              </motion.div>
            );
          })}

        {/* Centered pitch overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-7 flex flex-col items-center text-center">
          <p className="font-serif text-[20px] italic text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)] md:text-[26px]">
            nine specialists. one prompt.
          </p>
          <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-dim">
            drifting through your goal in parallel.
          </p>
        </div>
      </div>

      {/* Bottom activity strip. Same content as before, now reads as the */}
      {/* live status of the team you just saw. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-white/[0.05] px-5 py-2 font-mono text-[11px]">
        <span className="text-ink-faint">activity</span>
        {activity.map((row) => (
          <motion.span
            key={row.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1.5"
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: row.accent, boxShadow: `0 0 6px ${row.accent}` }}
            />
            <span className="uppercase tracking-[0.18em]" style={{ color: row.accent }}>
              {row.slug.replace('_', ' ')}
            </span>
            <span className="text-ink-dim">{row.verb}</span>
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// LEGACY FullWidthLiveNetwork — kept for reference, no longer rendered. The
// CosmicTeamShowcase above replaces it. Delete when confident no flag flips
// us back. See marketing/audit/critic-*-2026-05-22.md for rationale.
// -----------------------------------------------------------------------------
// Nine mesh nodes - one per agent-nano PNG. Using the cute white-croc set so
// each node shows the actual character, not just a colored dot.
const MESH_AGENTS = [
  { slug: 'supervisor', accent: '#22C55E', label: 'supervisor' },
  { slug: 'researcher', accent: '#67E8F9', label: 'researcher' },
  { slug: 'planner', accent: '#FB7185', label: 'planner' },
  { slug: 'outreach', accent: '#FBBF24', label: 'outreach' },
  { slug: 'analyst', accent: '#A78BFA', label: 'analyst' },
  { slug: 'coder', accent: '#4ADE80', label: 'coder' },
  { slug: 'designer', accent: '#F472B6', label: 'designer' },
  { slug: 'browser', accent: '#22D3EE', label: 'browser' },
  { slug: 'app_builder', accent: '#A78BFA', label: 'app builder' },
];

// Hub-and-spoke topology with supervisor at center (index 0). Every other
// agent connects to the supervisor + a few peer links for visual richness.
const MESH_EDGES: Array<[number, number]> = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
  [1, 2], [3, 4], [5, 6], [7, 8],
  [1, 6], [3, 7], [2, 5],
];

// Default layout: supervisor centered, the other 8 arranged in a ring around
// the hub. Positions are stored as percentages of the container (0 to 100 on
// both axes) so they translate cleanly to absolute-positioned HTML nodes.
const DEFAULT_POSITIONS = MESH_AGENTS.map((a, i) => {
  if (i === 0) {
    // Supervisor sits at center.
    return { x: 50, y: 50, ...a };
  }
  // Place the 8 peers evenly around the hub on an ellipse.
  const angle = ((i - 1) / 8) * Math.PI * 2 - Math.PI / 2;
  const rx = 38; // x-radius as a percentage of container width
  const ry = 32; // y-radius as a percentage of container height
  return { x: 50 + Math.cos(angle) * rx, y: 50 + Math.sin(angle) * ry, ...a };
});

function FullWidthLiveNetwork() {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState(DEFAULT_POSITIONS);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [pulseIdx, setPulseIdx] = useState<number | null>(null);

  const [activity, setActivity] = useState<Array<{ id: number; slug: string; accent: string; verb: string }>>(
    () => [
      { id: 1, slug: 'researcher', accent: '#67E8F9', verb: 'scanning 18 sources' },
      { id: 2, slug: 'planner', accent: '#FB7185', verb: 'mapping 7 phases' },
      { id: 3, slug: 'coder', accent: '#4ADE80', verb: 'shipping route handler' },
      { id: 4, slug: 'outreach', accent: '#FBBF24', verb: 'drafting 12 emails' },
    ],
  );
  const VERBS: Record<string, string[]> = {
    researcher: ['scanning 18 sources', 'cross-checking citations', 'flagging a pricing diff'],
    planner: ['mapping 7 phases', 'estimating cycle time', 'reordering tomorrow'],
    outreach: ['drafting 12 emails', 'A/B testing subjects', 'flagging 3 hot replies'],
    designer: ['iterating on the hero', 'building a moodboard', 'testing 4 palettes'],
    analyst: ['noticing reply rate drift', 'proposing 3 A/B fixes', 'sizing the impact'],
    coder: ['writing route handler', 'fixing 11 type errors', 'shipping a PR'],
    supervisor: ['delegating to 5 panes', 'synthesizing team report', 'rebalancing the queue'],
    browser: ['diffing a pricing page', 'screenshotting a competitor', 'archiving evidence'],
    app_builder: ['ships the fix', 'rewires the worker', 'patches the deploy'],
  };
  useEffect(() => {
    if (reduce) return;
    let counter = activity.length;
    const t = setInterval(() => {
      counter += 1;
      const a = MESH_AGENTS[Math.floor(Math.random() * MESH_AGENTS.length)];
      const verbs = VERBS[a.slug] ?? ['working'];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      setActivity((curr) => [{ id: counter, slug: a.slug, accent: a.accent, verb }, ...curr].slice(0, 4));
    }, 1500);
    return () => clearInterval(t);
  }, [reduce]);

  // Convert pointer client coords to percentage-of-container coordinates so
  // node positions stay correct on any container width.
  function toStagePercent(clientX: number, clientY: number) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: Math.min(96, Math.max(4, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(94, Math.max(6, ((clientY - rect.top) / rect.height) * 100)),
    };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragIdx === null) return;
    const pt = toStagePercent(e.clientX, e.clientY);
    if (!pt) return;
    setPositions((curr) => curr.map((p, i) => (i === dragIdx ? { ...p, x: pt.x, y: pt.y } : p)));
  }

  function onPointerUp() {
    setDragIdx(null);
  }

  function shuffle() {
    setPositions((curr) =>
      curr.map((p, i) => {
        // Keep supervisor near the center even on shuffle so the hub-and-spoke
        // mental model survives a chaotic rearrangement.
        if (i === 0) return { ...p, x: 40 + Math.random() * 20, y: 40 + Math.random() * 20 };
        return { ...p, x: 8 + Math.random() * 84, y: 14 + Math.random() * 72 };
      }),
    );
  }

  function reset() {
    setPositions(DEFAULT_POSITIONS);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-bg-1/40 to-bg-0/60 backdrop-blur"
    >
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.05] px-5 py-2.5">
        <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-emerald-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          live network. drag the crocs.
        </span>
        <span className="inline-flex items-center gap-2">
          <button
            onClick={shuffle}
            className="rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim transition-colors hover:bg-white/[0.08] hover:text-white"
            type="button"
          >
            shuffle
          </button>
          <button
            onClick={reset}
            className="rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim transition-colors hover:bg-white/[0.08] hover:text-white"
            type="button"
          >
            reset
          </button>
        </span>
      </div>

      {/* Stage. HTML divs for the croc icon nodes, SVG layer for the edge lines.
          Lines stretch fine; images render at their natural aspect. */}
      <div
        ref={stageRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className={cn(
          'relative h-[280px] w-full overflow-hidden md:h-[340px] touch-none select-none',
          dragIdx !== null ? 'cursor-grabbing' : 'cursor-default',
        )}
      >
        {/* Edge layer */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="liveNetEdge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(34,197,94,0.5)" />
              <stop offset="100%" stopColor="rgba(167,139,250,0.5)" />
            </linearGradient>
          </defs>
          {MESH_EDGES.map(([a, b], i) => {
            const A = positions[a];
            const B = positions[b];
            return (
              <g key={i}>
                <line
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  stroke="url(#liveNetEdge)"
                  strokeWidth="0.3"
                  opacity={0.7}
                />
                {!reduce && (
                  <motion.circle
                    r="0.7"
                    fill={A.accent}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      cx: [A.x, B.x],
                      cy: [A.y, B.y],
                    }}
                    transition={{
                      duration: 2.6,
                      delay: (i * 0.18) % 4,
                      repeat: Infinity,
                      repeatDelay: 2 + (i % 3),
                      ease: 'easeInOut',
                    }}
                    style={{ filter: `drop-shadow(0 0 1.5px ${A.accent})` }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Croc icon nodes. Each one is an HTML div so the PNG renders at its
            natural aspect ratio (no SVG-stretch distortion). */}
        {positions.map((p, i) => {
          const isDragging = dragIdx === i;
          const isPulsing = pulseIdx === i;
          const isSupervisor = i === 0;
          const size = isSupervisor ? 'h-16 w-16 md:h-20 md:w-20' : 'h-12 w-12 md:h-14 md:w-14';
          return (
            <motion.div
              key={p.slug + i}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2',
                isDragging ? 'cursor-grabbing z-20' : 'cursor-grab z-10',
              )}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                filter: `drop-shadow(0 0 ${isDragging || isPulsing ? '18px' : '10px'} ${p.accent}aa) drop-shadow(0 4px 10px ${p.accent}55)`,
              }}
              animate={
                reduce || isDragging
                  ? { scale: isDragging ? 1.12 : 1 }
                  : { y: isPulsing ? [0, -8, 0] : [0, -2.5, 0] }
              }
              transition={{
                duration: isPulsing ? 0.5 : 4 + (i % 3),
                repeat: isPulsing ? 0 : Infinity,
                ease: 'easeInOut',
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setDragIdx(i);
                setPulseIdx(i);
                setTimeout(() => setPulseIdx((curr) => (curr === i ? null : curr)), 500);
              }}
            >
              <div className={cn('relative flex items-end justify-center', size)}>
                <Image
                  src={`/assets/agents-nano/${p.slug}.png`}
                  alt={`${p.label} agent`}
                  fill
                  sizes={isSupervisor ? '80px' : '56px'}
                  className="object-contain"
                  draggable={false}
                />
                {/* Soft accent ring under the croc */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-1 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full opacity-70 blur-md"
                  style={{ background: p.accent }}
                />
              </div>
              <span
                className="pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.18em]"
                style={{ color: p.accent, textShadow: `0 0 6px ${p.accent}55` }}
              >
                {p.label}
              </span>
            </motion.div>
          );
        })}

        {/* Soft cosmic vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, transparent 65%, rgba(5,4,16,0.55) 100%)',
          }}
        />
      </div>

      {/* Bottom activity strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-white/[0.05] px-5 py-2 font-mono text-[11px]">
        <span className="text-ink-faint">activity</span>
        {activity.map((row) => (
          <motion.span
            key={row.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1.5"
          >
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: row.accent, boxShadow: `0 0 6px ${row.accent}` }} />
            <span className="uppercase tracking-[0.18em]" style={{ color: row.accent }}>
              {row.slug.replace('_', ' ')}
            </span>
            <span className="text-ink-dim">{row.verb}</span>
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

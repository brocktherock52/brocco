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

import { useEffect, useMemo, useState } from 'react';
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 90, damping: 18 });
  const sy = useSpring(y, { stiffness: 90, damping: 18 });

  return (
    <motion.div
      onMouseMove={
        hover && !reduce
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              x.set(((e.clientX - r.left) / r.width - 0.5) * 6);
              y.set(((e.clientY - r.top) / r.height - 0.5) * 6);
            }
          : undefined
      }
      onMouseLeave={
        hover && !reduce
          ? () => {
              x.set(0);
              y.set(0);
            }
          : undefined
      }
      style={hover ? { rotateX: sy, rotateY: sx, transformStyle: 'preserve-3d' } : undefined}
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
          broadcast
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-grad-brand block font-serif text-[clamp(3.4rem,6.5vw,6rem)] font-normal italic"
        >
          one prompt.
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative mt-7 max-w-[460px] text-[17px] leading-[1.55] text-ink-dim"
      >
        9 specialists run concurrently on your goal. parallel panes. greppable audit logs.{' '}
        <span className="text-white">byok</span> on free, hosted on paid, same agents either way.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55 }}
        className="relative mt-9 flex flex-wrap items-center gap-3"
      >
        <MagneticLink href="/app" className="btn-primary group text-[15px] px-6 py-3.5">
          <span>open the dashboard</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </MagneticLink>
        <MagneticLink
          href="/download#mcp-setup"
          className="btn-ghost group text-[15px] px-6 py-3.5"
          strength={10}
        >
          <TerminalSquare className="h-4 w-4" />
          <span>install mcp server</span>
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

      {/* Brocco mascot — floats in the bottom-right of the headline tile.
          Gives the hero a face. Subtle idle float (reduced-motion safe).
          The mascot is decorative; aria-hidden so screen readers skip it. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 30, rotate: -8 }}
        animate={
          reduce
            ? { opacity: 1, y: 0, rotate: 0 }
            : { opacity: 1, y: [0, -8, 0], rotate: [-4, 4, -4] }
        }
        transition={
          reduce
            ? { duration: 0.6, delay: 0.6 }
            : {
                opacity: { duration: 0.8, delay: 0.6 },
                y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
                rotate: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
              }
        }
        whileHover={reduce ? undefined : { scale: 1.06 }}
        className="pointer-events-none absolute bottom-4 right-4 h-32 w-32 sm:bottom-6 sm:right-6 sm:h-40 sm:w-40 md:h-48 md:w-48 lg:h-56 lg:w-56"
      >
        <Image
          src="/assets/brocco-mark-transparent.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 224px, (min-width: 640px) 192px, 128px"
          priority
          className="object-contain drop-shadow-[0_20px_40px_rgba(124,58,237,0.45)]"
        />
      </motion.div>
    </Tile>
  );
}

// -----------------------------------------------------------------------------
// METRICS TILE — animated counters with a pulsing micro-sparkline
// -----------------------------------------------------------------------------
function MetricsTile() {
  const [runs, setRuns] = useState(2847);
  const [tokens, setTokens] = useState(9.2);
  const [cost, setCost] = useState(12.4);

  // Live-ish telemetry: tick the numbers slowly so the panel feels alive
  useEffect(() => {
    const id = setInterval(() => {
      setRuns((r) => r + Math.floor(Math.random() * 3));
      setTokens((t) => +(t + Math.random() * 0.02).toFixed(2));
      setCost((c) => +(c + Math.random() * 0.04).toFixed(2));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // Sparkline points (animated bars)
  const bars = useMemo(
    () => Array.from({ length: 18 }, () => 0.35 + Math.random() * 0.65),
    [],
  );

  return (
    <Tile className="flex h-full flex-col p-6">
      <header className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          live · network
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          last 60s
        </span>
      </header>

      <div className="mt-5 grid flex-1 grid-cols-3 gap-4">
        <div>
          <p className="font-mono text-[18px] font-semibold tabular-nums">
            <AnimatedNumber value={runs} format={(v) => Math.round(v).toLocaleString()} />
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            runs
          </p>
        </div>
        <div>
          <p className="font-mono text-[18px] font-semibold tabular-nums text-cyan-glow">
            <AnimatedNumber value={tokens} format={(v) => `${v.toFixed(1)}M`} />
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            tokens
          </p>
        </div>
        <div>
          <p className="font-mono text-[18px] font-semibold tabular-nums text-violet-300">
            <AnimatedNumber value={cost} format={(v) => `$${v.toFixed(2)}`} />
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            byok cost
          </p>
        </div>
      </div>

      {/* Sparkline */}
      <div className="mt-5 flex h-12 items-end gap-1">
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
    </Tile>
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
          broadcast · 5 / 9 agents
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

        {/* Sub-marquee strip below the bento */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-2xl border border-white/[0.06] bg-bg-1/30 px-5 py-3 backdrop-blur"
        >
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
            wired into
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-ink-dim">
            {[
              'Anthropic',
              'OpenAI',
              'Ollama',
              'Cursor',
              'Claude Desktop',
              'Slack',
              'Zapier',
              'n8n',
            ].map((b) => (
              <span key={b} className="opacity-70 transition-opacity hover:opacity-100">
                {b}
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

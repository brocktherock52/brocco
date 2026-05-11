'use client';

/**
 * SurfacesFilmstrip — completely reimagined "surfaces" section.
 *
 * Desktop (lg+): scroll-tied horizontal filmstrip. A 400vh tall section
 * pins a viewport-height container while the 6 surface cards translate
 * horizontally. Step indicator below tracks progress.
 *
 * Mobile / reduced-motion: graceful fallback to a vertical card list so
 * we don't violate horizontal-scroll a11y rules on small screens.
 */

import { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'framer-motion';
import {
  ArrowRight,
  Boxes,
  TerminalSquare,
  Plug,
  ScrollText,
  Sparkles,
  Wrench,
} from 'lucide-react';

const SURFACES = [
  {
    Icon: Boxes,
    name: 'dashboard',
    one: 'multi-agent panes, broadcast mode',
    body:
      'open the app, type a goal, watch n agents stream in parallel. live token meter, jsonl audit, share via url hash.',
    href: '/app',
    cta: 'open dashboard',
    tint: 'from-brand/30 to-cyan/10',
  },
  {
    Icon: TerminalSquare,
    name: 'rest + sse api',
    one: 'language-agnostic',
    body:
      'POST /api/v1/run with a bearer key (byok passthrough) and stream the agent loop into any runtime.',
    href: '/api/v1/agents',
    cta: 'get /api/v1/agents',
    tint: 'from-cyan/30 to-brand/10',
  },
  {
    Icon: Plug,
    name: 'mcp server',
    one: 'inside claude desktop',
    body:
      'every brocco agent registers as a tool inside claude desktop, cursor, or any mcp-compatible client. one config block.',
    href: '/download#mcp-setup',
    cta: 'mcp setup',
    tint: 'from-violet-500/30 to-brand/10',
  },
  {
    Icon: Wrench,
    name: 'tool factory',
    one: 'wire your stack in 30 lines',
    body:
      'a python factory describing how to talk to your crm, warehouse, or homemade dispatch system. the agent uses it next run.',
    href: '/docs',
    cta: 'tool factory docs',
    tint: 'from-amber-500/30 to-rose-500/10',
  },
  {
    Icon: Sparkles,
    name: 'recipes',
    one: 'one-click multi-agent workflows',
    body:
      'pre-wired goals: market research, launch day, customer deep-dive, content sprint. fork them in /app.',
    href: '/app',
    cta: 'browse recipes',
    tint: 'from-pink-500/30 to-violet-500/10',
  },
  {
    Icon: ScrollText,
    name: 'audit log',
    one: 'jsonl, exportable, greppable',
    body:
      'every prompt, every tool call, every result. one append-only file per run. your siem can ingest it.',
    href: '/security',
    cta: 'security overview',
    tint: 'from-emerald-500/30 to-cyan/10',
  },
];

export function SurfacesFilmstrip() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // -90% so the last card lands on screen with a little air on the right
  const rawX = useTransform(scrollYProgress, [0, 1], ['0%', '-83%']);
  const x = useSpring(rawX, { stiffness: 90, damping: 22, mass: 0.4 });
  const progressBar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Reduced-motion / mobile fallback (vertical card list)
  if (reduce) {
    return (
      <section className="relative border-y border-white/[0.05] bg-bg-1/40 py-24">
        <div className="container-x">
          <SectionHeader />
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SURFACES.map((s) => (
              <li key={s.name}>
                <Link
                  href={s.href}
                  className="card card-hover group flex h-full flex-col p-6"
                >
                  <s.Icon className="h-5 w-5 text-brand-glow" />
                  <h3 className="mt-3 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-faint">
                    {s.name}
                  </h3>
                  <p className="mt-1 text-[16px] font-semibold tracking-tight text-white">
                    {s.one}
                  </p>
                  <p className="mt-3 flex-1 text-[13.5px] text-ink-dim">{s.body}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-[13px] text-cyan-glow">
                    {s.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative border-y border-white/[0.05] bg-bg-1/40 lg:h-[400vh]"
    >
      {/* Sticky stage */}
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="container-x relative">
          <SectionHeader />
        </div>

        {/* Horizontal filmstrip (lg+) */}
        <div className="mt-10 hidden overflow-hidden lg:block">
          <motion.div style={{ x }} className="flex w-max gap-6 pl-[max(2rem,calc((100vw-1200px)/2))]">
            {SURFACES.map((s, i) => (
              <FilmCard key={s.name} surface={s} index={i} />
            ))}
            <div className="w-[max(2rem,calc((100vw-1200px)/2))] shrink-0" aria-hidden />
          </motion.div>
        </div>

        {/* Mobile fallback (sm/md) */}
        <div className="container-x mt-10 grid gap-4 sm:grid-cols-2 lg:hidden">
          {SURFACES.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              className="card card-hover group flex flex-col p-5"
            >
              <s.Icon className="h-5 w-5 text-brand-glow" />
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                {s.name}
              </p>
              <p className="mt-1 text-[15px] font-semibold tracking-tight text-white">{s.one}</p>
              <p className="mt-2 flex-1 text-[13px] text-ink-dim">{s.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] text-cyan-glow">
                {s.cta} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* Progress bar */}
        <div className="container-x mt-10 hidden lg:block">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              scroll to scrub
            </span>
            <div className="relative h-px flex-1 bg-white/[0.06]">
              <motion.span
                style={{ width: progressBar }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand via-brand-glow to-cyan"
              />
            </div>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              6 surfaces
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="max-w-2xl">
      <p className="pill">surfaces</p>
      <h2 className="mt-5 text-display-lg lowercase">
        <span className="text-grad">six ways to use brocco.</span>{' '}
        <span className="text-grad-brand">one runtime under the hood.</span>
      </h2>
      <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
        same 9 agents, same 13 tools, same audit log. pick the surface that fits where you already
        work.
      </p>
    </div>
  );
}

function FilmCard({
  surface,
  index,
}: {
  surface: (typeof SURFACES)[number];
  index: number;
}) {
  const { Icon } = surface;
  return (
    <Link
      href={surface.href}
      className="group relative flex w-[460px] shrink-0 flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-bg-1/70 p-8 backdrop-blur transition-all hover:border-white/[0.16]"
      style={{ minHeight: 460 }}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${surface.tint} opacity-50 transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          surface {String(index + 1).padStart(2, '0')} / 06
        </span>

        <div className="mt-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.04] backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
          <Icon className="h-6 w-6 text-white" />
        </div>

        <h3 className="mt-7 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-faint">
          {surface.name}
        </h3>
        <p className="mt-1 text-[22px] font-semibold tracking-tight text-white text-balance">
          {surface.one}
        </p>
        <p className="mt-4 max-w-[380px] text-[14.5px] leading-relaxed text-ink-dim">
          {surface.body}
        </p>

        <span className="mt-8 inline-flex items-center gap-1.5 text-[14px] text-cyan-glow">
          {surface.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

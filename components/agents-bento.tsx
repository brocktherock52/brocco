'use client';

/**
 * AgentsBento — completely reimagined "9 specialists" section.
 *
 * 9 agents arranged as an asymmetric bento grid (12-col), with supervisor
 * as the hero tile (col-span-6, row-span-2). Each tile glows in the agent's
 * own color. Hover spotlight follows the cursor. Built to feel like a
 * single console of running agents, not a generic 3-up card grid.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { AGENTS, type Agent } from '@/lib/agents';
import { SpotlightCard } from './ui/spotlight-card';
import { AgentCroc } from './agent-croc';
import { cn } from '@/lib/utils';

// Tile placement specs (12-col grid)
const PLACEMENT: Record<string, string> = {
  supervisor: 'lg:col-span-6 lg:row-span-2 lg:min-h-[420px]',
  researcher: 'lg:col-span-6 lg:row-span-1',
  planner: 'lg:col-span-3',
  analyst: 'lg:col-span-3',
  coder: 'lg:col-span-4',
  outreach: 'lg:col-span-4',
  browser: 'lg:col-span-4',
  designer: 'lg:col-span-6',
  app_builder: 'lg:col-span-6',
};

function AgentTile({ a, hero = false }: { a: Agent; hero?: boolean }) {
  const rgb = hexToRgb(a.color);
  const spotlight = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)` : 'rgba(167,139,250,0.22)';

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <SpotlightCard
        spotlightSize={hero ? 600 : 320}
        spotlightColor={spotlight}
        className={cn(
          'card card-hover group relative flex h-full flex-col overflow-hidden',
          hero ? 'p-8' : 'p-5',
        )}
      >
        {/* corner glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-15 blur-3xl transition-opacity duration-700 group-hover:opacity-70"
          style={{ backgroundColor: a.color }}
        />

        {/* row header — persona croc + name + tool count */}
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'shrink-0 rounded-md ring-1 ring-white/[0.06]',
              hero ? 'p-1.5' : 'p-1',
            )}
            style={{ backgroundColor: `${a.color}10` }}
          >
            <AgentCroc agent={a.name} size={hero ? 'md' : 'sm'} accent={a.color} />
          </span>
          <motion.span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: a.color, boxShadow: `0 0 10px ${a.color}` }}
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span
            className="font-mono text-[12px] font-semibold lowercase"
            style={{ color: a.color }}
          >
            {a.name.replace('_', ' ')}
          </span>
          <span className="ml-auto rounded-full border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
            {a.tools.length} tools
          </span>
        </div>

        {/* body */}
        <h3
          className={cn(
            'tracking-tight',
            hero ? 'mt-6 text-[28px] font-semibold leading-[1.1]' : 'mt-3 text-[15px] font-semibold',
          )}
        >
          {a.label}
        </h3>
        <p
          className={cn(
            'text-ink-dim',
            hero ? 'mt-3 text-[15px] leading-relaxed' : 'mt-1 text-[12.5px] leading-relaxed',
          )}
        >
          {a.description}
        </p>

        {/* sample prompt — italic editorial pull */}
        <p
          className={cn(
            'border-l-2 pl-3 font-serif italic leading-snug',
            hero ? 'mt-6 text-[15px]' : 'mt-3 text-[12px]',
          )}
          style={{ borderColor: `${a.color}66` }}
        >
          &ldquo;{a.sample}&rdquo;
        </p>

        {/* hero tile: tool chip strip + cta */}
        {hero && (
          <>
            <div className="mt-7 flex flex-wrap gap-1.5">
              {a.tools.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 font-mono text-[11px] text-ink-dim"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-auto pt-7">
              <Link
                href="/agents/supervisor"
                className="group/cta inline-flex items-center gap-1.5 text-[14px] text-cyan-glow"
              >
                read the supervisor pattern
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" />
              </Link>
            </div>
          </>
        )}
      </SpotlightCard>
    </motion.div>
  );
}

export function AgentsBento() {
  // Order matters here — drives the bento layout
  const order = [
    'supervisor',
    'researcher',
    'planner',
    'analyst',
    'coder',
    'outreach',
    'browser',
    'designer',
    'app_builder',
  ] as const;
  const byName = Object.fromEntries(AGENTS.map((a) => [a.name, a]));

  return (
    <section className="relative py-24 md:py-28">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="pill">agents</p>
            <h2 className="mt-5 text-display-lg lowercase">
              <span className="text-grad">nine specialists.</span>{' '}
              <span className="text-grad-brand">one prompt.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
              each agent is a markdown spec with its own tool list. broadcast a goal and they fan
              out in parallel.
            </p>
          </div>
          <Link
            href="/agents"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-[13px] text-ink-dim transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            view all 9 specs <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[180px]"
        >
          {order.map((name, i) => {
            const a = byName[name];
            return (
              <div key={name} className={cn(PLACEMENT[name] ?? 'lg:col-span-4', 'h-full')}>
                <AgentTile a={a} hero={i === 0} />
              </div>
            );
          })}
        </motion.div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[12px] text-ink-faint">
            13 tools in the registry · drop-in custom tools via the python factory pattern
          </p>
          <Link
            href="/app"
            className="group inline-flex items-center gap-1.5 text-[13px] text-cyan-glow hover:underline"
          >
            try them in /app
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function hexToRgb(hex: string) {
  const m = hex.replace('#', '').match(/.{1,2}/g);
  if (!m || m.length < 3) return null;
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
}

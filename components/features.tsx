'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';

/**
 * Features, was a 9-card spotlight grid; now a comparison diff table that
 * animates row-by-row on scroll. Two columns: "Generic agent stack" (red
 * strike) and "brocco runtime" (green check + glow). One row per capability.
 *
 * Why this layout: the prompt called out that sections 8-12 all read as
 * card grids. Comparison-diff is one of the listed alternative treatments,
 * and it lets us keep all 9 capabilities while making the section feel
 * like its own moment.
 */

const ROWS = [
  {
    capability: 'Multi-agent orchestration',
    them: 'write separate prompts for each task',
    us: 'select multiple agents and broadcast one goal',
  },
  {
    capability: 'Tool registry',
    them: 'copy source material between tabs',
    us: 'built-in web search and page-reading tools',
  },
  {
    capability: 'Audit trails',
    them: 'reconstruct the steps from separate chats',
    us: 'review streamed messages, tool calls, and results',
  },
  {
    capability: 'Persistent memory',
    them: 'paste the same background into new chats',
    us: 'save project context for later work',
  },
  {
    capability: 'Prompt caching',
    them: 'configure provider caching yourself',
    us: 'Anthropic prompt-cache support where available',
  },
  {
    capability: 'Workspace access',
    them: 'assemble a separate interface for each task',
    us: 'one browser workspace for your agents',
  },
  {
    capability: 'BYOK',
    them: 'manage provider settings across tools',
    us: 'Anthropic or xAI key on a paid plan; provider usage billed separately',
  },
  {
    capability: 'Streaming',
    them: 'switch between task windows for updates',
    us: 'responses and tool progress stream in agent panes',
  },
  {
    capability: 'Data retention',
    them: 'review the data policy for each service',
    us: 'provider data policies apply; see our privacy policy',
  },
];

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function Features() {
  const reduce = useReducedMotion();

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">features</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">one workspace.</span>{' '}
            <span className="text-grad-brand">clear steps.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            Bring your tasks into one workspace. Here is how the dashboard helps you organize and review the work.
          </p>
        </div>

        {/* Header row */}
        <div className="mt-12 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_minmax(0,1fr)] md:gap-4">
          <div className="hidden font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint md:block">
            capability
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint">
            <span className="inline-flex items-center gap-1.5">
              <X className="h-3 w-3 text-accent-rose" />
              manual setup
            </span>
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-brand-glow">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3 w-3 text-accent-green" />
              brocco
            </span>
          </div>
        </div>

        {/* Rows */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="mt-4 divide-y divide-white/[0.06] border-y border-white/[0.06]"
        >
          {ROWS.map((r) => (
            <motion.div
              key={r.capability}
              variants={rowVariants}
              className="grid grid-cols-1 gap-2 py-4 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_minmax(0,1fr)] md:gap-4 md:py-5"
            >
              <div className="text-[13.5px] font-semibold tracking-tight text-white md:text-[14px]">
                {r.capability}
              </div>

              <div className="flex items-start gap-2 text-[13.5px] leading-relaxed text-ink-faint">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-rose/80" />
                <span className="line-through decoration-accent-rose/40 decoration-1">
                  {r.them}
                </span>
              </div>

              <div className="relative flex items-start gap-2 text-[13.5px] leading-relaxed text-ink/95">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-green" />
                <span className="relative">
                  {r.us}
                  {!reduce && (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute -inset-x-1 -inset-y-0.5 rounded-md bg-brand/0"
                      animate={{ backgroundColor: ['rgba(167,139,250,0)', 'rgba(167,139,250,0.08)', 'rgba(167,139,250,0)'] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-[13.5px] leading-relaxed text-ink-faint">
            The trial previews the dashboard. A paid plan and configured model access are required for live runs.
          </p>
          <Link
            href="/begin"
            className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-gradient-to-r from-brand to-cyan px-6 py-3.5 text-[15px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow md:self-auto"
          >
            <span>Start 7-day trial</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

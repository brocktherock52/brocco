'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';

/**
 * Features — was a 9-card spotlight grid; now a comparison diff table that
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
    them: 'one mega-prompt, vibes',
    us: 'supervisor + sub-agents, each with own tools + memory',
  },
  {
    capability: 'Tool registry',
    them: 'JSON schemas pasted into a system prompt',
    us: 'Python factory in, agent uses it next run',
  },
  {
    capability: 'Audit trails',
    them: 'whatever the model logged, if anything',
    us: 'every prompt + tool call + result in JSONL, replayable',
  },
  {
    capability: 'Persistent memory',
    them: 'rebuild context every call',
    us: 'per-agent KV survives across runs',
  },
  {
    capability: 'Prompt caching',
    them: 'flip a flag, hope for the best',
    us: 'on by default, ~80% hit on repeated workflows',
  },
  {
    capability: 'Hosting',
    them: 'one of two SaaS lock-ins',
    us: 'self-host on Hetzner / Vercel / laptop, or hosted',
  },
  {
    capability: 'BYOK',
    them: 'paid add-on or not supported',
    us: 'Anthropic + OpenAI + Ollama + Groq on every plan',
  },
  {
    capability: 'Streaming',
    them: 'poll, wait, refresh',
    us: 'SSE end-to-end, every token, every tool call',
  },
  {
    capability: 'Data retention',
    them: '"we may use your data to improve the product"',
    us: 'ZDR enabled by default on paid, never trained on',
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
            <span className="text-grad">production-grade. audit-ready.</span>{' '}
            <span className="text-grad-brand">yours.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            nine capabilities side by side: how everyone else does it, how brocco does it. each row
            is a thing we got tired of reinventing.
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
              generic agent stack
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

        <p className="mt-8 max-w-xl text-[13.5px] leading-relaxed text-ink-faint">
          this is what we mean by &ldquo;production-grade.&rdquo; not a buzzword. nine concrete
          decisions we already made on your behalf.
        </p>
      </div>
    </section>
  );
}

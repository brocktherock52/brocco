'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Boxes,
  TerminalSquare,
  Plug,
  ScrollText,
  Sparkles,
  Wrench,
} from 'lucide-react';

/**
 * Inference.sh-style product cards. Six surfaces brocco ships, each a
 * proper noun on its own. Click-through to the live page that proves it.
 */
const PRODUCTS = [
  {
    Icon: Boxes,
    name: 'dashboard',
    one: 'multi-agent panes, broadcast mode',
    body: 'open-the-app, type a goal, watch n agents stream in parallel. live token meter, jsonl audit, share via url hash.',
    href: '/app',
    cta: 'open dashboard',
  },
  {
    Icon: TerminalSquare,
    name: 'api',
    one: 'rest + sse',
    body: 'post /api/v1/run with a bearer key (byok passthrough) and stream the agent loop into any language, any runtime.',
    href: '/api/v1/agents',
    cta: 'get /api/v1/agents',
  },
  {
    Icon: Plug,
    name: 'mcp server',
    one: 'inside claude desktop',
    body: 'every brocco agent registers as a tool inside claude desktop, cursor, or any mcp-compatible client. one config block.',
    href: '/download#mcp-setup',
    cta: 'mcp setup',
  },
  {
    Icon: Wrench,
    name: 'tool factory',
    one: 'wire your stack in 30 lines',
    body: 'a python factory describing how to talk to your crm, warehouse, or homemade dispatch system. the agent uses it next run.',
    href: '/docs',
    cta: 'tool factory docs',
  },
  {
    Icon: Sparkles,
    name: 'recipes',
    one: 'one-click workflows',
    body: 'pre-wired multi-agent goals: market research, launch day, customer deep-dive, content sprint. fork them in /app.',
    href: '/app',
    cta: 'browse recipes',
  },
  {
    Icon: ScrollText,
    name: 'audit log',
    one: 'jsonl, exportable',
    body: 'every prompt, every tool call, every result. one append-only file per run. greppable, diffable, your siem can ingest it.',
    href: '/security',
    cta: 'security overview',
  },
];

export function ProductCards() {
  return (
    <section className="relative border-y border-white/[0.05] bg-bg-1/40 py-24 md:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">surfaces</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">six ways to use brocco.</span>{' '}
            <span className="text-grad-brand">one runtime under the hood.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            same 9 agents, same 13 tools, same audit log. pick the surface that fits where you already work.
          </p>
        </div>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {PRODUCTS.map((p) => (
            <motion.li
              key={p.name}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={p.href}
                className="card card-hover group flex h-full flex-col p-6"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.08]">
                  <p.Icon className="h-4 w-4 text-brand-glow" />
                </div>
                <div className="mt-4">
                  <h3 className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-faint">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-[16px] font-semibold tracking-tight text-white">{p.one}</p>
                </div>
                <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink-dim">{p.body}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-[13px] text-cyan-glow">
                  {p.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

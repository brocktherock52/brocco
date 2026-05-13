'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import {
  AnthropicIcon,
  OpenAIIcon,
  N8nIcon,
  CursorIcon,
  ZapierIcon,
  SlackIcon,
  McpIcon,
  OllamaIcon,
} from './brand-icons';

/**
 * Integrations — was an 8-spotlight-card grid; now a hub-and-spoke radial
 * diagram. brocco runtime sits at the center, eight integrations orbit on
 * a circle. Hover (or tap on mobile via the fallback list) any node to pop
 * a tooltip with mechanism + body copy. The hub gently breathes; the spokes
 * stagger in on scroll-in.
 *
 * Mobile: the radial view stays visible but compressed; we also render a
 * stacked list of names under it so touch users can read every integration
 * without aiming for small dots.
 */

type Item = {
  Icon: typeof AnthropicIcon;
  name: string;
  via: string;
  body: string;
};

const ITEMS: Item[] = [
  {
    Icon: AnthropicIcon,
    name: 'Claude Desktop',
    via: 'MCP server',
    body: 'Every brocco agent registers as a callable tool inside Claude Desktop. Run a researcher, planner, or outreach agent without leaving the chat.',
  },
  {
    Icon: OpenAIIcon,
    name: 'ChatGPT and OpenAI',
    via: 'OpenAI-compatible',
    body: 'Plug brocco into ChatGPT custom GPTs, Assistants, and any OpenAI-compatible endpoint. Same agents, same audit log.',
  },
  {
    Icon: N8nIcon,
    name: 'n8n',
    via: 'HTTP node',
    body: 'Drop a brocco run into your n8n workflow with one HTTP node. Stream tool calls back into the next step. SSE supported natively.',
  },
  {
    Icon: CursorIcon,
    name: 'Cursor and VS Code',
    via: 'Extension + REST',
    body: 'Trigger brocco agents from your editor command palette. Pipe results into the diff view. Built for the way you already code.',
  },
  {
    Icon: ZapierIcon,
    name: 'Zapier and Make',
    via: 'REST webhook',
    body: 'Use brocco as the agentic step in any Zap or Make scenario. Pass any input shape, get a structured artifact back.',
  },
  {
    Icon: SlackIcon,
    name: 'Slack and Discord',
    via: 'Bot + slash command',
    body: 'Mention @brocco in any channel to spin up a research, outreach, or planning agent. Results post inline.',
  },
  {
    Icon: OllamaIcon,
    name: 'Ollama and local LLMs',
    via: 'OpenAI-compatible endpoint',
    body: 'Point brocco at any OpenAI-compatible local server. Llama 3, Qwen, Mistral, anything you run on your own GPU.',
  },
  {
    Icon: McpIcon,
    name: 'Custom HTTP / Postgres / Stripe',
    via: 'Tool factory',
    body: 'Drop a Python tool factory describing your CRM, your warehouse, your dispatch system. The agent uses it on the next run.',
  },
];

// Place 8 nodes evenly around a circle starting from the top.
function nodePosition(i: number, total: number, radius: number) {
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
  return {
    left: 50 + Math.cos(angle) * radius,
    top: 50 + Math.sin(angle) * radius,
  };
}

export function Integrations() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const activeItem = active === null ? null : ITEMS[active];

  return (
    <section id="integrations" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">integrations</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">works with the tools you</span>{' '}
            <span className="text-grad-brand">already love.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            brocco is the runtime, not a walled garden. eight first-class integrations on day one,
            plus a tool factory so your custom stack ships next.
          </p>
        </div>

        {/* Radial hub diagram */}
        <div className="relative mt-14 mx-auto aspect-square w-full max-w-[560px]">
          {/* Concentric ring */}
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(167,139,250,0.30)" />
                <stop offset="60%" stopColor="rgba(34,211,238,0.08)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
              <linearGradient id="spokeStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(167,139,250,0.65)" />
                <stop offset="100%" stopColor="rgba(167,139,250,0.05)" />
              </linearGradient>
            </defs>
            {/* outer ring */}
            <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" strokeDasharray="0.6 1.4" />
            {/* hub glow */}
            <circle cx="50" cy="50" r="24" fill="url(#hubGlow)" />
            {/* spokes */}
            {ITEMS.map((_, i) => {
              const { left, top } = nodePosition(i, ITEMS.length, 36);
              return (
                <motion.line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={left}
                  y2={top}
                  stroke="url(#spokeStroke)"
                  strokeWidth="0.18"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}
          </svg>

          {/* Hub center */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="rounded-full bg-gradient-to-br from-brand/30 to-cyan/20 p-[1px] shadow-[0_0_40px_-6px_rgba(167,139,250,0.55)]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-1/95 ring-1 ring-white/[0.08] backdrop-blur md:h-24 md:w-24">
                <div className="text-center">
                  <div className="font-serif text-[18px] italic text-grad-brand md:text-[20px]">
                    brocco
                  </div>
                  <div className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-ink-faint md:text-[9px]">
                    runtime
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Nodes */}
          {ITEMS.map((it, i) => {
            const { left, top } = nodePosition(i, ITEMS.length, 38);
            const Icon = it.Icon;
            const isActive = active === i;
            return (
              <motion.button
                key={it.name}
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive((curr) => (curr === i ? null : curr))}
                onFocus={() => setActive(i)}
                onBlur={() => setActive((curr) => (curr === i ? null : curr))}
                onClick={() => setActive((curr) => (curr === i ? null : i))}
                aria-label={`${it.name} integration via ${it.via}`}
                aria-expanded={isActive}
                className="absolute -translate-x-1/2 -translate-y-1/2 outline-none"
                style={{ left: `${left}%`, top: `${top}%` }}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.08 }}
              >
                <div
                  className={
                    'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] ring-1 transition-all duration-300 md:h-14 md:w-14 ' +
                    (isActive
                      ? 'ring-brand/60 shadow-[0_0_24px_-4px_rgba(167,139,250,0.7)]'
                      : 'ring-white/[0.10] hover:ring-white/[0.22]')
                  }
                >
                  <Icon className="h-4 w-4 text-white md:h-5 md:w-5" />
                </div>
              </motion.button>
            );
          })}

          {/* Tooltip card pinned center-bottom of the diagram */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
            <AnimatePresence mode="wait">
              {activeItem && (
                <motion.div
                  key={activeItem.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="card pointer-events-auto w-[min(94%,360px)] translate-y-[calc(100%+12px)] p-4 backdrop-blur"
                >
                  <h3 className="text-[14px] font-semibold tracking-tight text-white">
                    {activeItem.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
                    {activeItem.via}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">
                    {activeItem.body}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile-friendly fallback list. On desktop it sits below the
            diagram and the tooltip; on touch devices it gives you a
            scroll-readable list of every integration. */}
        <div className="mt-44 md:mt-32">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] text-ink-dim sm:grid-cols-3 md:grid-cols-4">
            {ITEMS.map((it, i) => {
              const Icon = it.Icon;
              const isActive = active === i;
              return (
                <button
                  key={`list-${it.name}`}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive((curr) => (curr === i ? null : i))}
                  className={
                    'group flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ' +
                    (isActive
                      ? 'bg-white/[0.04] text-white'
                      : 'hover:bg-white/[0.03] hover:text-white')
                  }
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-80 group-hover:opacity-100" />
                  <span className="truncate">{it.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-10 text-center text-[13px] text-ink-faint">
          Don&apos;t see your tool?{' '}
          <a
            href="mailto:help@brocco.dev?subject=Brocco%20integration%20request"
            className="text-cyan-glow underline-offset-4 hover:underline"
          >
            Tell us, we will build it.
          </a>
        </p>
      </div>
    </section>
  );
}

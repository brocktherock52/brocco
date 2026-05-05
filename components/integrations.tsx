'use client';

import { motion } from 'framer-motion';
import {
  MessageSquareCode,
  Workflow,
  Sparkles,
  Code2,
  Plug,
  Zap,
  Bot,
  TerminalSquare,
} from 'lucide-react';

const ITEMS = [
  {
    icon: Sparkles,
    name: 'Claude Desktop',
    via: 'MCP server',
    body: 'Every brocco agent registers as a callable tool inside Claude Desktop. Run a researcher, planner, or outreach agent without leaving the chat.',
  },
  {
    icon: MessageSquareCode,
    name: 'ChatGPT and OpenAI',
    via: 'OpenAI-compatible',
    body: 'Plug brocco into ChatGPT custom GPTs, Assistants, and any OpenAI-compatible endpoint. Same agents, same audit log.',
  },
  {
    icon: Workflow,
    name: 'n8n',
    via: 'HTTP node',
    body: 'Drop a brocco run into your n8n workflow with one HTTP node. Stream tool calls back into the next step. SSE supported natively.',
  },
  {
    icon: Code2,
    name: 'Cursor and VS Code',
    via: 'Extension + REST',
    body: 'Trigger brocco agents from your editor command palette. Pipe results into the diff view. Built for the way you already code.',
  },
  {
    icon: Zap,
    name: 'Zapier and Make',
    via: 'REST webhook',
    body: 'Use brocco as the agentic step in any Zap or Make scenario. Pass any input shape, get a structured artifact back.',
  },
  {
    icon: Bot,
    name: 'Slack and Discord',
    via: 'Bot + slash command',
    body: 'Mention @brocco in any channel to spin up a research, outreach, or planning agent. Results post inline.',
  },
  {
    icon: TerminalSquare,
    name: 'REST API',
    via: 'POST /api/v1/run',
    body: 'Bearer auth. SSE stream. Bring your own key as the bearer token (BYOK passthrough). Every language, every runtime.',
  },
  {
    icon: Plug,
    name: 'Custom HTTP / Postgres / Stripe',
    via: 'Tool factory',
    body: 'Drop a Python tool factory describing your CRM, your warehouse, your dispatch system. The agent uses it on the next run.',
  },
];

export function Integrations() {
  return (
    <section id="integrations" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">Integrations</p>
          <h2 className="mt-5 text-display-lg">
            <span className="text-grad">Works with the tools you</span>{' '}
            <span className="font-serif italic font-medium text-grad-brand">already love.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            Brocco is the runtime, not a walled garden. Eight first-class integrations on day one, plus a tool factory so your custom stack ships next.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
          className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {ITEMS.map((it) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.name}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                }}
                whileHover={{ y: -4 }}
                className="card card-hover group relative overflow-hidden p-5"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/0 blur-2xl transition-all duration-500 group-hover:bg-brand/15" />

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.08]">
                  <Icon className="h-4 w-4 text-brand-glow" />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold tracking-tight">{it.name}</h3>
                </div>
                <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
                  {it.via}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-dim">{it.body}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="mt-10 text-center text-[13px] text-ink-faint">
          Don't see your tool?{' '}
          <a
            href="mailto:hello@brocco.ai?subject=Brocco%20integration%20request"
            className="text-cyan-glow underline-offset-4 hover:underline"
          >
            Tell us, we will build it.
          </a>
        </p>
      </div>
    </section>
  );
}

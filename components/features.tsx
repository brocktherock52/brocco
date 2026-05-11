'use client';

import { motion } from 'framer-motion';
import {
  Boxes,
  Layers,
  ListChecks,
  Brain,
  Bolt,
  ServerCog,
  Lock,
  Key,
  Activity,
} from 'lucide-react';
import { SpotlightCard } from './ui/spotlight-card';

const FEATURES = [
  {
    icon: Boxes,
    title: 'Multi-agent orchestration',
    body:
      'Supervisor pattern with sub-agent delegation. Specialists for research, code, outreach, ops, each with its own tool set and memory.',
  },
  {
    icon: Layers,
    title: 'Tool registry',
    body:
      'File, shell, HTTP, search, your custom APIs. Each tool is a Python factory. Type signature in, the agent gets it on next run.',
  },
  {
    icon: ListChecks,
    title: 'Full audit trails',
    body:
      'Every prompt, tool call, and result is appended to JSONL. Replay any run. Diff two runs. Compliance-ready by default.',
  },
  {
    icon: Brain,
    title: 'Persistent memory',
    body:
      'Per-agent KV that survives across runs. The agent remembers what it learned yesterday, today, and uses it.',
  },
  {
    icon: Bolt,
    title: 'Prompt caching, on by default',
    body:
      'System prompts and tool definitions cached on Anthropic edge. Cuts cost ~80% on repeated workflows. No flag to flip.',
  },
  {
    icon: ServerCog,
    title: 'Self-host or hosted',
    body:
      'Run on Hetzner, Vercel, your laptop. SOC 2 Type II in progress. BYOK. Encrypted at rest. Your data never trains a model.',
  },
  {
    icon: Key,
    title: 'BYOK on every plan',
    body:
      'Anthropic, OpenAI, OpenAI-compatible (Ollama, vLLM, OpenRouter, Groq). Your key, your tokens, your data path.',
  },
  {
    icon: Activity,
    title: 'Streaming everywhere',
    body:
      'Server-sent events end-to-end. Watch each token, each tool call, each parallel agent. No polling, no spinners.',
  },
  {
    icon: Lock,
    title: 'Zero data retention',
    body:
      'On paid plans, brocco calls Anthropic with ZDR enabled by default. We never log your prompts after the run completes.',
  },
];

export function Features() {
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
            everything you need to ship agentic workflows you would actually trust with revenue.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <SpotlightCard
                  spotlightSize={320}
                  spotlightColor="rgba(167, 139, 250, 0.16)"
                  className="card card-hover group relative h-full overflow-hidden p-6"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/0 blur-2xl transition-all duration-500 group-hover:bg-brand/10" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.08] transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-4 w-4 text-brand-glow" />
                  </div>
                  <h3 className="mt-4 text-[16.5px] font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">{f.body}</p>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

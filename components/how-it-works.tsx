'use client';

import { motion } from 'framer-motion';
import { Plug, FileText, Zap } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: Plug,
    eyebrow: 'CONNECT',
    title: 'Wire up your stack',
    body:
      'Stripe, Gmail, Notion, Slack, Shopify, Postgres, custom HTTP. Drop a tool definition, the agent gets superpowers. Every connection is an embedded workflow.',
  },
  {
    num: '02',
    icon: FileText,
    eyebrow: 'DESCRIBE',
    title: 'Write the agent in markdown',
    body:
      'A few lines of prose plus a tool list. No code. The agent decomposes your goal, picks the right tool, runs it, reads the result, decides what is next.',
  },
  {
    num: '03',
    icon: Zap,
    eyebrow: 'RUN',
    title: 'Trigger or schedule, walk away',
    body:
      'Webhook, cron, or chat. Every step logged as JSONL. Human-overrideable, audit-grade, persistent across restarts. Real work, on autopilot.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">How it works</p>
          <h2 className="mt-5 text-display-lg">
            <span className="text-grad">One prompt. Three agents.</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">Zero tab-switching.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            A peek at the dashboard live. Real layout, real streaming, real tool calls. Open <a href="/app" className="text-cyan-glow underline-offset-4 hover:underline">/app</a> to drive your own.
          </p>
        </div>

        {/* mock dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mt-12 overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-1/80 shadow-card backdrop-blur"
        >
          <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
            </span>
            <span className="font-mono text-[12px] text-ink-faint">brocco.ai/app - broadcast - 3 agents</span>
            <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              streaming live
            </span>
          </div>
          <div className="grid gap-2 p-2 md:grid-cols-3 md:gap-3 md:p-3">
            <MockPane name="researcher" color="text-cyan-glow" step="step 2 / 6" tool="search_web">
              Top 3 alternatives to brocco for parallel agents: Cursor 3 (IDE-bound), Devin (one-pane), and AutoGPT (no UI). All run on similar models, none ship multi-pane in browser.
            </MockPane>
            <MockPane name="outreach" color="text-amber-300" step="step 3 / 6" tool="memory_put">
              Subject: 8 detroit deals
              {'\n'}Richard, saw your 2025 Westside closings. Built a disposition pack: 8 props, ranked by ARV minus rehab. Reply &apos;send&apos;.
            </MockPane>
            <MockPane name="planner" color="text-brand-glow" step="step 1 / 6" tool="memory_put">
              Plan in 4 bullets:
              {'\n'}1. Define ICP and reach
              {'\n'}2. Draft hero copy variants
              {'\n'}3. Ship 3 subreddit posts
              {'\n'}4. Email 30 warm contacts
            </MockPane>
          </div>
        </motion.div>

        {/* steps */}
        <div className="mt-14 grid gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card card-hover relative overflow-hidden p-6"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand/30 to-cyan/20 ring-1 ring-white/[0.08]">
                    <Icon className="h-4.5 w-4.5 text-brand-glow" />
                  </div>
                  <span className="font-mono text-[11px] tracking-wider text-ink-faint">
                    {s.num} / {s.eyebrow}
                  </span>
                </div>
                <h3 className="mt-5 text-[20px] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-dim">{s.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MockPane({
  name,
  color,
  step,
  tool,
  children,
}: {
  name: string;
  color: string;
  step: string;
  tool: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-bg-2/70 p-3.5">
      <div className="flex items-center gap-2 text-[12px]">
        <span className={`font-mono font-semibold ${color}`}>{name}</span>
        <span className="ml-auto font-mono text-[10.5px] text-ink-faint">{step}</span>
      </div>
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10.5px] text-ink-dim">
        <span className="h-1 w-1 rounded-full bg-cyan" /> {tool}
      </div>
      <pre className="mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink/90 font-sans">
        {children}
      </pre>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';

const TOOLS = [
  'file_read',
  'file_write',
  'shell_exec',
  'http_get',
  'http_post',
  'search_web',
  'memory_get',
  'memory_put',
  'delegate',
];
const BRAND_TOOLS = ['stripe_*', 'gmail_*', 'your_api_*'];

export function Wedge() {
  return (
    <section id="wedge" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-bg-1 to-transparent" />
      <div className="container-x relative">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="pill">The wedge</p>
            <h2 className="mt-5 text-display-lg">
              <span className="text-grad">Generic agents read the internet.</span>
              <br />
              <span className="font-serif italic font-medium text-grad-brand">Brocco reads your business.</span>
            </h2>
            <blockquote className="mt-7 border-l-2 border-brand/60 pl-5 italic text-[18px] leading-relaxed text-ink/95">
              &quot;The agent is the cheap part. The workflow is the moat. Brocco hands you both.&quot;
              <div className="mt-2 not-italic font-mono text-[11.5px] tracking-wider text-ink-faint">
                BROCCO PRINCIPLE NO. 1
              </div>
            </blockquote>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-dim">
              Brocco is not another orchestration framework. It is the runtime that wires Claude, GPT, and local models
              into <em className="not-italic text-white">your</em> stack. Drop a tool factory describing how to talk to
              your CRM, your warehouse, your homemade dispatch system, and the agent uses it on the next run. That is
              the wedge, and we hand it to you.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="card relative overflow-hidden p-6"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan/10 blur-3xl" />
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-[12px] tracking-wider text-ink-faint">YOUR TOOL REGISTRY</h4>
              <span className="font-mono text-[11px] text-ink-faint">13 tools</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-3">
              {TOOLS.map((t) => (
                <span
                  key={t}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-center font-mono text-[12px] text-ink-dim"
                >
                  {t}
                </span>
              ))}
              {BRAND_TOOLS.map((t) => (
                <span
                  key={t}
                  className="rounded-lg border border-brand/30 bg-brand/10 px-2.5 py-2 text-center font-mono text-[12px] text-brand-glow"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-5 font-mono text-[12px] text-ink-dim">
              → drop a tool definition, the agent uses it next run.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AGENTS } from '@/lib/agents';

/**
 * Inference.sh-style agents-grid section. Each agent renders as a dense
 * card: color dot, name, role, sample goal (italic, claude-design touch),
 * tool count chip. Hover lifts. Ships our 9 agents as a recognizable
 * catalog — the same way inference.sh shows 250+ tools.
 */
export function AgentsGrid() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="pill">agents</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">nine specialists.</span>{' '}
            <span className="text-grad-brand">one prompt.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[16px] text-ink-dim">
            each agent is a markdown spec with a tool list. broadcast a goal and they fan out in parallel. drop-in custom agents take ~30 lines of yaml.
          </p>
        </div>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3"
        >
          {AGENTS.map((a) => (
            <motion.li
              key={a.name}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -3 }}
              className="card card-hover group relative overflow-hidden p-5"
            >
              {/* gradient wash */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                style={{ backgroundColor: a.color }}
              />
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-flex h-2 w-2 rounded-full"
                  style={{ backgroundColor: a.color }}
                />
                <span className="font-mono text-[12px] font-semibold lowercase" style={{ color: a.color }}>
                  {a.name}
                </span>
                <span className="ml-auto rounded-full border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
                  {a.tools.length} tools
                </span>
              </div>
              <h3 className="mt-3 text-[14.5px] font-semibold tracking-tight">{a.label}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-dim">{a.description}</p>
              <p className="mt-3 border-l-2 border-white/[0.08] pl-2.5 font-serif italic text-[12px] leading-snug text-ink-faint">
                &ldquo;{a.sample}&rdquo;
              </p>
            </motion.li>
          ))}
        </motion.ul>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[12px] text-ink-faint">
            13 tools in the registry · drop-in custom tools via the python factory pattern
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-[13px] text-cyan-glow hover:underline"
          >
            try them in /app <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Pause, Play, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { getCastMember } from '@/lib/agent-cast';
import type { AgentName } from '@/lib/agents';

// MorningBriefing — the daily-essential home tab.
//
// Goal: the first thing the user sees when they open the dashboard cold.
// It simulates "what brocco did while you slept" — one row per agent, each
// with a real-looking output and a CTA to act on it.
//
// Data is local-stub for now. Replace `BRIEFING_FIXTURES` with the real
// per-user feed once background workers (DAILY-ESSENTIAL-FEATURES.md #2)
// ship. The component itself is data-shape-stable: it expects an array
// of BriefingItem and renders identically.

interface BriefingItem {
  slug: AgentName;
  agent: string;
  accent: string;
  output: string;
  meta: string;
  // CTA verb that the row uses ("act on", "open", "send", ...)
  cta: string;
}

const BRIEFING_FIXTURES: BriefingItem[] = [
  {
    slug: 'researcher',
    agent: 'researcher',
    accent: '#67E8F9',
    output: 'Found 3 new agentic-AI platforms launched this week. Lindy raised $20M, Multion shipped browser autopilot, CrewAI hit 30k stars.',
    meta: 'ran at 04:12  ·  18 sources  ·  2,400 tokens',
    cta: 'read brief',
  },
  {
    slug: 'planner',
    agent: 'planner',
    accent: '#FB7185',
    output: 'Drafted a 7-phase plan for your $49/mo launch. Phase 1 ships Monday. 4 deep-work blocks scheduled this week.',
    meta: 'ran at 05:31  ·  v3 plan  ·  saved to /threads',
    cta: 'review plan',
  },
  {
    slug: 'outreach',
    agent: 'outreach',
    accent: '#FBBF24',
    output: '12 personalized cold emails drafted to design leads at YC W26 companies. 3 high-fit. None sent — waiting on your nod.',
    meta: 'ran at 06:02  ·  12 drafts  ·  3 flagged hot',
    cta: 'review drafts',
  },
  {
    slug: 'analyst',
    agent: 'analyst',
    accent: '#A78BFA',
    output: 'Your reply rate dropped to 6.2% this week (was 11.4%). Two subject-line patterns underperforming. Suggested 3 A/B fixes.',
    meta: 'ran at 06:14  ·  pulled from gmail  ·  decision-grade',
    cta: 'view report',
  },
  {
    slug: 'browser',
    agent: 'browser',
    accent: '#67E8F9',
    output: 'Competitor X bumped pricing $20 and shipped a tier-3 plan. Their docs added a "background agents" page overnight.',
    meta: 'ran at 06:22  ·  3 pages diffed  ·  screenshots saved',
    cta: 'open diff',
  },
  {
    slug: 'supervisor',
    agent: 'supervisor',
    accent: '#22C55E',
    output: 'Today: 4 deep-work blocks, 2 calls, 1 deadline. Suggested I run designer on the landing-hero refresh during your 2-4 block.',
    meta: 'ran at 06:30  ·  synthesizing today',
    cta: 'accept plan',
  },
];

interface MorningBriefingProps {
  onAct?: (item: BriefingItem) => void;
}

export function MorningBriefing({ onAct }: MorningBriefingProps) {
  const [items, setItems] = useState<BriefingItem[]>(BRIEFING_FIXTURES);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState<string>('');

  useEffect(() => {
    // Local time string — only on client to avoid hydration mismatch.
    const fmt = () => {
      const d = new Date();
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };
    setNow(fmt());
    const t = setInterval(() => setNow(fmt()), 60_000);
    return () => clearInterval(t);
  }, []);

  function dismiss(slug: AgentName) {
    setItems((curr) => curr.filter((it) => it.slug !== slug));
  }

  return (
    <section className="w-full max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/30 to-emerald-400/5 ring-1 ring-emerald-400/30">
            <Sparkles className="h-4 w-4 text-emerald-300" />
          </span>
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              your morning briefing
            </p>
            <h2 className="mt-0.5 text-[20px] font-semibold tracking-tight lowercase">
              <span className="text-grad">while you slept,</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">six agents worked.</span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          <Clock className="h-3 w-3" />
          {now || '--:--'}
          <button
            onClick={() => setPaused((p) => !p)}
            className="ml-2 inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-ink-dim hover:bg-white/[0.04] hover:text-white"
            title={paused ? 'resume daily briefing' : 'pause daily briefing'}
          >
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {paused ? 'resume' : 'pause daily'}
          </button>
        </div>
      </div>

      {/* Rows */}
      <ul className="mt-5 space-y-2.5">
        {items.length === 0 ? (
          <li className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-6 text-center text-[13px] text-ink-faint">
            briefing cleared. it'll refresh at 06:00 your local time.
          </li>
        ) : (
          items.map((it, idx) => (
            <BriefingRow
              key={it.slug}
              item={it}
              index={idx}
              onAct={() => onAct?.(it)}
              onDismiss={() => dismiss(it.slug)}
            />
          ))
        )}
      </ul>

      <p className="mt-5 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
        recurring runs · auto-refreshed at 06:00 · powered by 9 specialists
      </p>
    </section>
  );
}

function BriefingRow({
  item,
  index,
  onAct,
  onDismiss,
}: {
  item: BriefingItem;
  index: number;
  onAct: () => void;
  onDismiss: () => void;
}) {
  const member = getCastMember(item.slug);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-bg-1/60 p-3 transition-colors hover:border-white/[0.14] hover:bg-bg-1/80"
      style={{ ['--accent' as string]: item.accent }}
    >
      {/* Accent glow on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
        style={{ background: `radial-gradient(circle, ${item.accent}66 0%, transparent 70%)` }}
      />

      <div className="flex items-start gap-3">
        {/* Croc avatar — uses the AI emoji PNG with constant motion */}
        <motion.div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black ring-1"
          style={{ boxShadow: `inset 0 0 0 1px ${item.accent}33` }}
          animate={{
            y: [0, -4, 0, 2, 0],
            rotate: [-2, 2, -2, 1, -2],
            scale: [1, 1.03, 1, 1.015, 1],
          }}
          transition={{
            duration: 4 + (index % 3) * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.18,
          }}
        >
          {member?.imagePath && (
            <Image
              src={member.imagePath}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </motion.div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: item.accent, border: `1px solid ${item.accent}40`, background: `${item.accent}15` }}
            >
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: item.accent, boxShadow: `0 0 6px ${item.accent}` }}
              />
              {item.agent}
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              {item.meta}
            </span>
          </div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink">{item.output}</p>

          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={onAct}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-80"
              style={{ color: item.accent }}
            >
              {item.cta}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onDismiss}
              className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-ink-faint transition-colors hover:text-ink-dim"
            >
              <X className="h-3 w-3" />
              dismiss
            </button>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

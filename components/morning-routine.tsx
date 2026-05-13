'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getCastMember } from '@/lib/agent-cast';

// MorningRoutine — marketing-page section that previews the daily-essential
// loop. Renders 4 "while you slept" cards as a peek into the dashboard's
// morning briefing. Lives on the landing page above the agent cast so the
// daily-habit positioning hits before specs.

interface PeekRow {
  slug: 'researcher' | 'planner' | 'outreach' | 'analyst' | 'browser' | 'supervisor';
  agent: string;
  accent: string;
  output: string;
  meta: string;
}

const PEEKS: PeekRow[] = [
  {
    slug: 'researcher',
    agent: 'researcher',
    accent: '#67E8F9',
    output: 'three competitors shipped overnight. brief on your desk, sources cited.',
    meta: '04:12 · 18 sources',
  },
  {
    slug: 'outreach',
    agent: 'outreach',
    accent: '#FBBF24',
    output: '12 cold drafts ready to review. three flagged hot. nothing sent.',
    meta: '06:02 · 12 drafts',
  },
  {
    slug: 'analyst',
    agent: 'analyst',
    accent: '#A78BFA',
    output: 'reply rate dropped to 6.2%. two subject-line patterns underperforming. three a/b fixes proposed.',
    meta: '06:14 · gmail synced',
  },
  {
    slug: 'supervisor',
    agent: 'supervisor',
    accent: '#22C55E',
    output: 'today: 4 deep-work blocks, 2 calls, 1 deadline. designer queued for the 2-4 block.',
    meta: '06:30 · today plan',
  },
];

export function MorningRoutine() {
  return (
    <section className="relative py-24 md:py-32" id="morning">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            the new morning routine
          </p>
          <h2 className="mt-5 text-display-xl">
            <span className="text-grad">open the app.</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">your team already worked.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
            brocco runs on a schedule you set once. every morning your hand-picked specialists ship a briefing.
            you wake up, scan four lines, accept or dismiss. the day is already in motion.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-3 md:grid-cols-2">
          {PEEKS.map((row, i) => (
            <PeekCard key={row.slug} row={row} index={i} />
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              runs at 06:00 your time
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              learns your habits
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
              one-tap to act
            </span>
          </div>
          <Link
            href="/app"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-[13.5px] font-medium text-white transition hover:border-white/30 hover:bg-white/[0.08]"
          >
            see your first briefing
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PeekCard({ row, index }: { row: PeekRow; index: number }) {
  const member = getCastMember(row.slug);
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-1/60 p-4 transition-transform hover:-translate-y-1 hover:border-white/[0.14]"
      style={{ ['--accent' as string]: row.accent }}
    >
      {/* hover accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: `radial-gradient(circle at 30% 20%, ${row.accent}33 0%, transparent 60%)` }}
      />

      <div className="flex items-start gap-3">
        {/* per-agent croc avatar. cast-v7 PNGs have true alpha so the
            CSS chroma-key hack (mixBlendMode + contrast/saturate) has
            been removed. the radial accent wash now just sits behind
            the transparent croc as a themed backdrop. */}
        <motion.div
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1"
          style={{
            background: `radial-gradient(120% 90% at 50% 35%, ${row.accent}40 0%, ${row.accent}15 40%, #050b16 80%)`,
            boxShadow: `inset 0 0 0 1px ${row.accent}33, inset 0 -28px 36px -16px rgba(5,8,16,0.95)`,
          }}
          animate={{
            y: [0, -5, 0, 3, 0],
            rotate: [-2, 2, -2, 1, -2],
            scale: [1, 1.04, 1, 1.02, 1],
          }}
          transition={{
            duration: 4 + (index % 3) * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.15,
          }}
        >
          {member?.imagePath && (
            <Image
              src={member.imagePath}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          )}
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{
                color: row.accent,
                border: `1px solid ${row.accent}40`,
                background: `${row.accent}15`,
              }}
            >
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: row.accent, boxShadow: `0 0 6px ${row.accent}` }}
              />
              {row.agent}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              {row.meta}
            </span>
          </div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink">{row.output}</p>
        </div>
      </div>
    </motion.article>
  );
}

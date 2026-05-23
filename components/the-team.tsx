'use client';

/**
 * TheTeam — single consolidated section that replaces three earlier ones
 * (MorningRoutine + AgentsBento + AgentCast). Less repetition, one
 * scrollable beat instead of three.
 *
 * Layout:
 *   1. "open the app. your team already worked." headline (from old morning routine)
 *   2. 9-card grid of croc specialists with calm float animation + top-right
 *      agent-nano icon mapped to a canonical croc for every cast slug
 *   3. "today's briefing" mini-preview (4 peek lines) below the grid
 *   4. CTA to /app
 *
 * Animation: calmer than the prior cast section. No rotation. Scale clamped
 * 1.0 to 1.015. 9s float duration. Removed the 5-keyframe shake.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AGENT_CAST, type AgentCastMember } from '@/lib/agent-cast';

// Map any cast slug to its closest canonical agent-nano croc slug so every
// top-right card icon resolves to a real transparent PNG, even for legacy
// cast slugs like cs/finance/marketer that don't have nano renders.
const ICON_MAP: Record<string, string> = {
  researcher: 'researcher',
  planner: 'planner',
  outreach: 'outreach',
  designer: 'designer',
  analyst: 'analyst',
  coder: 'coder',
  browser: 'browser',
  supervisor: 'supervisor',
  app_builder: 'app_builder',
  copywriter: 'designer',
  cs: 'outreach',
  data_eng: 'coder',
  finance: 'analyst',
  founder: 'supervisor',
  marketer: 'outreach',
  ops: 'planner',
  qa: 'analyst',
  recruiter: 'outreach',
};

function iconFor(slug: string): string {
  return `/assets/agents-nano/${ICON_MAP[slug] || 'supervisor'}.png`;
}

interface PeekRow {
  agent: string;
  accent: string;
  output: string;
  meta: string;
}

const PEEKS: PeekRow[] = [
  {
    agent: 'researcher',
    accent: '#67E8F9',
    output: 'three competitors shipped overnight. brief on your desk, sources cited.',
    meta: '04:12 . 18 sources',
  },
  {
    agent: 'outreach',
    accent: '#FBBF24',
    output: '12 cold drafts ready to review. three flagged hot. nothing sent.',
    meta: '06:02 . 12 drafts',
  },
  {
    agent: 'analyst',
    accent: '#A78BFA',
    output: 'reply rate dropped to 6.2%. two subject-line patterns underperforming. three fixes proposed.',
    meta: '06:14 . gmail synced',
  },
  {
    agent: 'supervisor',
    accent: '#22C55E',
    output: 'today: 4 deep-work blocks, 2 calls, 1 deadline. designer queued for the 2-4 block.',
    meta: '06:30 . today plan',
  },
];

export function TheTeam() {
  // Show the first 9 cast members. Any extra slugs (founder, marketer, etc)
  // are filtered out so the grid stays clean and matches the 9-specialist
  // promise on the rest of the site.
  // 'app_builder' is not in lib/agent-cast.ts so it filtered to nothing.
  // Use 'ops' instead (which exists in cast-v7) to keep the count at 9.
  // The icon top-right still maps via ICON_MAP so it shows the canonical
  // app_builder croc.
  const PRIORITY = [
    'researcher',
    'planner',
    'outreach',
    'designer',
    'analyst',
    'coder',
    'browser',
    'supervisor',
    'ops',
  ];
  const cast = PRIORITY.map((slug) => AGENT_CAST.find((c) => c.slug === slug)).filter(
    (c): c is AgentCastMember => !!c,
  );

  return (
    <section className="relative py-24 md:py-32" id="team">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            your AI team
          </p>
          <h2 className="mt-5 text-display-xl">
            <span className="text-grad">open the app.</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">
              your team already worked.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
            nine specialists. each with a costume, a desk, a job. they show up when you broadcast.
            they ship while you sleep.
          </p>
        </div>

        <ul className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cast.map((member, i) => (
            <TeamCard key={member.slug} member={member} index={i} />
          ))}
        </ul>

        <div className="mx-auto mt-14 max-w-4xl rounded-2xl border border-white/[0.08] bg-bg-1/40 p-6 md:p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              today's briefing . 06:30 local
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {PEEKS.map((row) => (
              <li
                key={row.agent}
                className="rounded-xl border border-white/[0.06] bg-bg-2/40 p-4"
              >
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em]">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: row.accent, boxShadow: `0 0 8px ${row.accent}` }}
                  />
                  <span style={{ color: row.accent }}>{row.agent}</span>
                  <span className="text-ink-faint">. {row.meta}</span>
                </div>
                <p className="mt-2 text-[14px] leading-snug text-ink-dim">{row.output}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-10 flex flex-col items-center gap-3">
          <Link
            href="/app"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-cyan px-6 py-3.5 text-[15px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow"
          >
            <Sparkles className="h-4 w-4" />
            <span>open the app . it's running</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <span className="text-[12.5px] text-ink-faint">100 free runs every month. no card.</span>
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member, index }: { member: AgentCastMember; index: number }) {
  const accent = member.accent;
  const hasVideo = !!member.videoPath;
  const hasImage = !!member.imagePath;
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Lazy-load the cast video: don't fetch the .mp4 until the card is near the
  // viewport. Saves ~8.5 MB on initial page load (9 cast videos x ~1 MB each).
  const [videoVisible, setVideoVisible] = useState(false);
  useEffect(() => {
    if (!hasVideo) return;
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVideoVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVideoVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasVideo]);

  // STILL by default. User requested no float/breath on images. Cards stay
  // completely still; only the hover lift remains for tactile feedback.

  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={member.href ?? `/agents/${member.slug}`}
        ref={cardRef as React.Ref<HTMLAnchorElement>}
        className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-1/60 p-1 transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow"
        style={{ ['--accent' as string]: accent }}
      >
        {/* Soft accent halo on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-0.5 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: `radial-gradient(circle at 30% 20%, ${accent}33 0%, transparent 60%)` }}
        />

        <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
          {hasVideo ? (
            <div className="absolute inset-0">
              {videoVisible ? (
                <video
                  src={member.videoPath as string}
                  poster={member.posterPath ?? member.imagePath ?? undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : member.posterPath || member.imagePath ? (
                <Image
                  src={(member.posterPath ?? member.imagePath) as string}
                  alt={`${member.name} poster`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-bg-1 to-bg-0" />
              )}
            </div>
          ) : hasImage ? (
            <div className="absolute inset-0">
              <Image
                src={member.imagePath as string}
                alt={`${member.name} brocco-croc vignette`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-bg-1 to-bg-0" />
          )}

          {/* Inner ring + soft inset shadow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06] transition-colors duration-300"
            style={{
              boxShadow:
                'inset 0 -90px 120px -50px rgba(0,0,0,0.98), inset 0 90px 120px -60px rgba(0,0,0,0.85)',
            }}
          />

          {/* Top-left: agent name chip */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border bg-bg-1/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur-md"
              style={{ borderColor: `${accent}55`, color: accent }}
            >
              <span
                className="h-1 w-1 rounded-full"
                style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
              />
              {member.name}
            </span>
          </div>

          {/* Top-right: agent-nano croc icon. Mapped via ICON_MAP so every
              cast slug resolves to a real transparent PNG. */}
          <div className="absolute right-3 top-3">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-bg-1/80 backdrop-blur-md ring-1 ring-white/[0.06]"
              style={{ borderColor: `${accent}40` }}
            >
              <Image
                src={iconFor(member.slug)}
                alt={`${member.name} icon`}
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            </span>
          </div>

          {/* Bottom: costume + scene + open link */}
          <div className="absolute inset-x-3 bottom-3">
            <p className="text-[14px] font-semibold tracking-tight text-white">
              {member.costume.split(',')[0]}
            </p>
            <p className="mt-1 text-[12px] leading-snug text-ink-dim line-clamp-2">
              {member.scene}
            </p>
            <span
              className="mt-2 inline-flex items-center gap-1 text-[11.5px] opacity-70 transition-opacity group-hover:opacity-100"
              style={{ color: accent }}
            >
              open profile
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.li>
  );
}

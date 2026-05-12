'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Code2,
  FileText,
  GitBranch,
  Glasses,
  Hammer,
  Headphones,
  ListMusic,
  Mail,
  MapPin,
  Palette,
  Pencil,
  Printer,
  ScrollText,
  Search,
  Sparkles,
  Stamp,
  StickyNote,
  Terminal as TerminalIcon,
  Trello,
  Wand2,
  Wine,
} from 'lucide-react';
import { AGENT_CAST } from '@/lib/agent-cast';
import { AgentCroc } from '@/components/agent-croc';
import type { AgentName } from '@/lib/agents';

/**
 * AgentCast — the brocco-croc playing every role in the office.
 * Renders a kinetic gallery of vignette cards. Each card lifts +
 * tilts on hover (mouse-tracked rotation), revealing the agent's
 * costume + scene caption.
 *
 * If an image hasn't been generated yet (imagePath: null), the card
 * falls back to a placeholder frame with the brand mark + a "still
 * being illustrated" mono badge so the section never feels empty.
 */
export function AgentCast() {
  return (
    <section className="relative py-24 md:py-32" id="cast">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto">the cast</p>
          <h2 className="mt-5 text-display-xl">
            <span className="text-grad">nine specialists.</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">one office.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
            meet the brocco team. each agent has a costume, a desk, and a job. they show up when
            you broadcast. they go home when the run is done.
          </p>
        </div>

        <ul className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {AGENT_CAST.map((c, i) => (
            <CastCard key={c.slug} member={c} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function CastCard({ member, index }: { member: typeof AGENT_CAST[number]; index: number }) {
  const accent = member.accent;
  const hasVideo = !!member.videoPath;
  const hasImage = !!member.imagePath;

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/agents/${member.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-1/60 p-1 transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow"
        style={{ ['--accent' as string]: accent }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-0.5 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: `radial-gradient(circle at 30% 20%, ${accent}33 0%, transparent 60%)` }}
        />

        <div
          className="relative aspect-[4/5] overflow-hidden rounded-xl"
          style={{ backgroundColor: '#070d12' }}
        >
          {hasVideo ? (
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.02, 1], y: [0, -4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <video
                src={member.videoPath as string}
                poster={member.posterPath ?? member.imagePath ?? undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </motion.div>
          ) : hasImage ? (
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.02, 1], y: [0, -4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src={member.imagePath as string}
                alt={`${member.name} brocco-croc vignette`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </motion.div>
          ) : (
            <CastPlaceholder accent={accent} slug={member.slug} index={index} />
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 ring-1 ring-inset transition-colors duration-300"
            style={{ ['--ring' as string]: `${accent}55`, boxShadow: 'inset 0 -80px 100px -40px rgba(5,8,10,0.85)' }}
          />

          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-y-2 -left-1/3 w-1/3"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}22, transparent)` }}
            animate={{ x: ['0%', '500%'] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3, repeatDelay: 4 }}
          />

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border bg-bg-1/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur-md"
              style={{ borderColor: `${accent}55`, color: accent }}
            >
              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }} />
              {member.name}
            </span>
          </div>

          {/* Persona croc SVG — top-right badge. Pairs the photographic
              croc-character with our 2-bit codey iconography so the
              brand language is consistent across raster + vector. */}
          <div className="absolute right-3 top-3">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-bg-1/80 backdrop-blur-md ring-1 ring-white/[0.06]"
              style={{ borderColor: `${accent}40` }}
            >
              <AgentCroc
                agent={(member.slug === 'ops' ? 'planner' : member.slug) as AgentName}
                size="sm"
                accent={accent}
              />
            </span>
          </div>

          <div className="absolute inset-x-3 bottom-3">
            <p className="text-[14px] font-semibold tracking-tight text-white">
              {member.costume.split(',')[0]}
            </p>
            <p className="mt-1 text-[12px] leading-snug text-ink-dim line-clamp-2">{member.scene}</p>
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

interface PropSpec {
  Icon: React.ComponentType<{ className?: string }>;
  pos: { top: string; left: string };
  size: number;
  rot?: number;
  bob?: { dur: number; delay: number };
}

const SCENE: Record<string, PropSpec[]> = {
  researcher: [
    { Icon: BookOpen, pos: { top: '12%', left: '14%' }, size: 22, rot: -8, bob: { dur: 4.8, delay: 0 } },
    { Icon: Glasses, pos: { top: '20%', left: '64%' }, size: 26, rot: 6, bob: { dur: 5.6, delay: 0.4 } },
    { Icon: StickyNote, pos: { top: '70%', left: '12%' }, size: 18, rot: -14, bob: { dur: 5.2, delay: 0.9 } },
    { Icon: Search, pos: { top: '74%', left: '68%' }, size: 18, rot: 10, bob: { dur: 5.0, delay: 0.6 } },
  ],
  planner: [
    { Icon: Trello, pos: { top: '14%', left: '12%' }, size: 24, rot: -6, bob: { dur: 5.4, delay: 0.2 } },
    { Icon: ClipboardList, pos: { top: '18%', left: '68%' }, size: 22, rot: 8, bob: { dur: 4.6, delay: 0.5 } },
    { Icon: Pencil, pos: { top: '74%', left: '14%' }, size: 18, rot: -10, bob: { dur: 5.1, delay: 0.8 } },
    { Icon: MapPin, pos: { top: '70%', left: '70%' }, size: 18, rot: 12, bob: { dur: 5.5, delay: 0 } },
  ],
  outreach: [
    { Icon: Mail, pos: { top: '14%', left: '14%' }, size: 22, rot: -10, bob: { dur: 4.7, delay: 0.1 } },
    { Icon: Headphones, pos: { top: '14%', left: '68%' }, size: 24, rot: 6, bob: { dur: 5.3, delay: 0.5 } },
    { Icon: Mail, pos: { top: '72%', left: '12%' }, size: 18, rot: -14, bob: { dur: 4.9, delay: 0.7 } },
    { Icon: Stamp, pos: { top: '72%', left: '70%' }, size: 18, rot: 12, bob: { dur: 5.2, delay: 0.3 } },
  ],
  designer: [
    { Icon: Palette, pos: { top: '14%', left: '14%' }, size: 24, rot: -8, bob: { dur: 5.0, delay: 0.2 } },
    { Icon: Pencil, pos: { top: '14%', left: '68%' }, size: 22, rot: 12, bob: { dur: 4.8, delay: 0.6 } },
    { Icon: Wand2, pos: { top: '72%', left: '14%' }, size: 18, rot: -12, bob: { dur: 5.4, delay: 0.4 } },
    { Icon: Sparkles, pos: { top: '72%', left: '68%' }, size: 18, rot: 6, bob: { dur: 5.1, delay: 0 } },
  ],
  analyst: [
    { Icon: FileText, pos: { top: '14%', left: '14%' }, size: 22, rot: -6, bob: { dur: 4.9, delay: 0.3 } },
    { Icon: BookOpen, pos: { top: '16%', left: '68%' }, size: 22, rot: 8, bob: { dur: 5.4, delay: 0 } },
    { Icon: ListMusic, pos: { top: '74%', left: '14%' }, size: 18, rot: -10, bob: { dur: 5.0, delay: 0.7 } },
    { Icon: ScrollText, pos: { top: '72%', left: '70%' }, size: 18, rot: 10, bob: { dur: 4.7, delay: 0.5 } },
  ],
  coder: [
    { Icon: Code2, pos: { top: '14%', left: '14%' }, size: 24, rot: -10, bob: { dur: 4.6, delay: 0.2 } },
    { Icon: TerminalIcon, pos: { top: '16%', left: '66%' }, size: 22, rot: 6, bob: { dur: 5.1, delay: 0.6 } },
    { Icon: GitBranch, pos: { top: '72%', left: '12%' }, size: 18, rot: -8, bob: { dur: 5.4, delay: 0.4 } },
    { Icon: Sparkles, pos: { top: '74%', left: '70%' }, size: 16, rot: 12, bob: { dur: 4.8, delay: 0 } },
  ],
  ops: [
    { Icon: Printer, pos: { top: '14%', left: '14%' }, size: 24, rot: -8, bob: { dur: 5.2, delay: 0.2 } },
    { Icon: ClipboardList, pos: { top: '16%', left: '66%' }, size: 22, rot: 8, bob: { dur: 4.7, delay: 0.5 } },
    { Icon: FileText, pos: { top: '72%', left: '14%' }, size: 18, rot: -12, bob: { dur: 5.0, delay: 0.7 } },
    { Icon: Hammer, pos: { top: '72%', left: '70%' }, size: 18, rot: 10, bob: { dur: 5.3, delay: 0.4 } },
  ],
  supervisor: [
    { Icon: Wand2, pos: { top: '12%', left: '14%' }, size: 24, rot: -10, bob: { dur: 4.9, delay: 0.1 } },
    { Icon: ListMusic, pos: { top: '16%', left: '66%' }, size: 22, rot: 6, bob: { dur: 5.3, delay: 0.5 } },
    { Icon: Sparkles, pos: { top: '72%', left: '14%' }, size: 18, rot: -8, bob: { dur: 5.0, delay: 0.4 } },
    { Icon: Sparkles, pos: { top: '72%', left: '68%' }, size: 18, rot: 12, bob: { dur: 4.7, delay: 0.7 } },
  ],
  browser: [
    { Icon: Wine, pos: { top: '14%', left: '14%' }, size: 22, rot: -10, bob: { dur: 5.1, delay: 0.3 } },
    { Icon: ScrollText, pos: { top: '16%', left: '68%' }, size: 22, rot: 8, bob: { dur: 4.8, delay: 0.5 } },
    { Icon: Stamp, pos: { top: '72%', left: '14%' }, size: 18, rot: -12, bob: { dur: 5.4, delay: 0.7 } },
    { Icon: Sparkles, pos: { top: '74%', left: '70%' }, size: 16, rot: 8, bob: { dur: 5.0, delay: 0 } },
  ],
};

function CastPlaceholder({ accent, slug, index }: { accent: string; slug: string; index: number }) {
  const props = SCENE[slug] ?? SCENE.researcher;
  return (
    <div className="relative h-full w-full">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${accent}26 0%, transparent 60%), linear-gradient(135deg, #050807 0%, #0a1116 100%)`,
        }}
      />
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />

      {/* Stage props arranged around the mascot */}
      {props.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: p.pos.top, left: p.pos.left, color: accent }}
          animate={{ y: [0, -6, 0, 4, 0], rotate: [(p.rot ?? 0), (p.rot ?? 0) + 4, (p.rot ?? 0)] }}
          transition={{
            duration: p.bob?.dur ?? 5,
            delay: p.bob?.delay ?? 0,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <p.Icon className="drop-shadow-[0_0_8px_rgba(103,232,249,0.45)]" />
        </motion.div>
      ))}

      {/* Mascot center */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.04, 1], y: [0, -6, 0], rotate: index % 2 === 0 ? [-1.5, 1.5, -1.5] : [1.5, -1.5, 1.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image
          src="/assets/brocco-mark-transparent.png"
          alt=""
          width={180}
          height={180}
          className="h-auto w-[42%] opacity-95 drop-shadow-[0_0_24px_rgba(103,232,249,0.30)]"
          style={{ filter: `drop-shadow(0 0 18px ${accent}55)` }}
        />
      </motion.div>

    </div>
  );
}

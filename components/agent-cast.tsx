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
import { CAST_CROCS } from '@/components/cast-croc-characters';

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

/*
 * COSTUME — per-agent accessory overlay layered ON the brocco mascot.
 *
 * Each entry positions 1-3 large lucide icons OVER the croc image to
 * "dress" the mascot in their role's outfit. Coordinates are percentages
 * relative to the card's image area (4:5 aspect, croc occupies the
 * center ~60%).
 *
 * The croc image is rendered first (z-10), then SCENE props float in
 * the corners (z-20), then COSTUME accessories overlay the croc (z-30).
 */
interface CostumeItem {
  // Wider type than PropSpec — lucide icons accept style + width/height/strokeWidth.
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Position of the accessory ON the croc, as % of card area */
  pos: { top: string; left: string };
  /** Pixel size — these are LARGE so the costume reads from a distance */
  size: number;
  /** Rotation degrees */
  rot?: number;
  /** Fill mode for the icon: solid (filled) or outline */
  fill?: 'solid' | 'outline';
}

const COSTUME: Record<string, CostumeItem[]> = {
  // wire-frame glasses + a paper in front
  researcher: [
    { Icon: Glasses, pos: { top: '38%', left: '50%' }, size: 56, rot: -2, fill: 'outline' },
    { Icon: FileText, pos: { top: '64%', left: '36%' }, size: 32, rot: -8, fill: 'solid' },
  ],
  // marker in claw + sticky note headband
  planner: [
    { Icon: Pencil, pos: { top: '60%', left: '60%' }, size: 40, rot: 28, fill: 'solid' },
    { Icon: StickyNote, pos: { top: '22%', left: '52%' }, size: 38, rot: -10, fill: 'solid' },
  ],
  // headset across the head + coffee mug in claw
  outreach: [
    { Icon: Headphones, pos: { top: '24%', left: '50%' }, size: 64, rot: 0, fill: 'outline' },
    { Icon: Wine, pos: { top: '62%', left: '60%' }, size: 34, rot: 10, fill: 'solid' },
  ],
  // paint palette in claw + stylus on head
  designer: [
    { Icon: Palette, pos: { top: '62%', left: '60%' }, size: 44, rot: 12, fill: 'solid' },
    { Icon: Pencil, pos: { top: '24%', left: '54%' }, size: 36, rot: -28, fill: 'solid' },
  ],
  // glasses + clipboard
  analyst: [
    { Icon: Glasses, pos: { top: '38%', left: '50%' }, size: 52, rot: 0, fill: 'outline' },
    { Icon: ClipboardList, pos: { top: '62%', left: '38%' }, size: 36, rot: -10, fill: 'solid' },
  ],
  // big hipster glasses + laptop in front
  coder: [
    { Icon: Glasses, pos: { top: '36%', left: '50%' }, size: 64, rot: 0, fill: 'outline' },
    { Icon: TerminalIcon, pos: { top: '64%', left: '50%' }, size: 40, rot: 0, fill: 'solid' },
  ],
  // tie hanging + folder
  ops: [
    { Icon: ScrollText, pos: { top: '50%', left: '50%' }, size: 38, rot: 0, fill: 'solid' },
    { Icon: FileText, pos: { top: '64%', left: '38%' }, size: 32, rot: -10, fill: 'solid' },
  ],
  // conductor baton in claw + crown-like sparkle on head
  supervisor: [
    { Icon: Wand2, pos: { top: '60%', left: '62%' }, size: 44, rot: 30, fill: 'solid' },
    { Icon: Sparkles, pos: { top: '20%', left: '50%' }, size: 36, rot: 0, fill: 'solid' },
  ],
  // fedora-ish wine glass on top + pipe
  browser: [
    { Icon: Wine, pos: { top: '22%', left: '50%' }, size: 38, rot: 0, fill: 'solid' },
    { Icon: ScrollText, pos: { top: '62%', left: '38%' }, size: 32, rot: -8, fill: 'solid' },
  ],
};

/*
 * SCENE_BG — per-agent dramatic backdrop scene. Each card gets a
 * radically different visual context: terminal-text lines for coder,
 * blueprint grid for planner, vinyl record rings for designer, etc.
 *
 * This makes each card read as a distinct "themed poster" even though
 * they all use the same mascot image underneath. Wes-Anderson-character
 * -poster pattern.
 */
const SCENE_BG: Record<string, React.CSSProperties> = {
  researcher: {
    // Old library / book spines
    backgroundImage: `
      radial-gradient(ellipse at 70% 30%, rgba(103,232,249,0.18) 0%, transparent 55%),
      repeating-linear-gradient(180deg, transparent 0px, transparent 26px, rgba(103,232,249,0.07) 27px, rgba(103,232,249,0.07) 30px),
      linear-gradient(180deg, #0a1d22 0%, #050b0e 100%)
    `,
  },
  planner: {
    // Blueprint grid — pink on dark
    backgroundImage: `
      radial-gradient(circle at 30% 30%, rgba(251,113,133,0.22) 0%, transparent 60%),
      linear-gradient(rgba(251,113,133,0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(251,113,133,0.08) 1px, transparent 1px),
      linear-gradient(135deg, #1a0f13 0%, #060304 100%)
    `,
    backgroundSize: 'auto, 28px 28px, 28px 28px, auto',
  },
  outreach: {
    // Warm spotlight from upper-left
    backgroundImage: `
      radial-gradient(ellipse at 20% 0%, rgba(251,191,36,0.30) 0%, transparent 60%),
      radial-gradient(circle at 80% 100%, rgba(251,191,36,0.12) 0%, transparent 55%),
      linear-gradient(160deg, #1a1408 0%, #050402 100%)
    `,
  },
  designer: {
    // Color-swatch grid — pinks/purples
    backgroundImage: `
      radial-gradient(circle at 50% 40%, rgba(244,114,182,0.20) 0%, transparent 65%),
      conic-gradient(from 0deg at 50% 50%, rgba(244,114,182,0.10), rgba(251,113,133,0.05), rgba(167,139,250,0.10), rgba(244,114,182,0.10)),
      linear-gradient(180deg, #1a0a17 0%, #050204 100%)
    `,
  },
  analyst: {
    // Monitor glow — dual columns of violet
    backgroundImage: `
      linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.18) 8%, transparent 22%, transparent 78%, rgba(167,139,250,0.18) 92%, transparent 100%),
      repeating-linear-gradient(0deg, transparent 0px, transparent 6px, rgba(167,139,250,0.04) 7px, rgba(167,139,250,0.04) 8px),
      linear-gradient(180deg, #0e0a1a 0%, #04030a 100%)
    `,
  },
  coder: {
    // CRT terminal — emerald rows + scanlines
    backgroundImage: `
      radial-gradient(ellipse at 50% 50%, rgba(74,222,128,0.20) 0%, transparent 65%),
      repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(74,222,128,0.06) 4px, rgba(74,222,128,0.06) 5px),
      linear-gradient(180deg, #051410 0%, #02060a 100%)
    `,
  },
  ops: {
    // Office fluorescent + paper shred
    backgroundImage: `
      radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.18) 0%, transparent 50%),
      repeating-linear-gradient(20deg, transparent 0px, transparent 40px, rgba(34,211,238,0.05) 41px, rgba(34,211,238,0.05) 43px),
      linear-gradient(180deg, #061418 0%, #02080a 100%)
    `,
  },
  supervisor: {
    // Command center — 8 small glow points around the center
    backgroundImage: `
      radial-gradient(circle at 20% 25%, rgba(34,197,94,0.18) 0%, transparent 18%),
      radial-gradient(circle at 80% 25%, rgba(34,197,94,0.12) 0%, transparent 18%),
      radial-gradient(circle at 20% 75%, rgba(34,197,94,0.12) 0%, transparent 18%),
      radial-gradient(circle at 80% 75%, rgba(34,197,94,0.18) 0%, transparent 18%),
      radial-gradient(ellipse at 50% 50%, rgba(34,197,94,0.10) 0%, transparent 60%),
      linear-gradient(180deg, #0a1a10 0%, #02070a 100%)
    `,
  },
  browser: {
    // Detective noir — green banker's lamp + smoke wisps
    backgroundImage: `
      radial-gradient(ellipse at 30% 20%, rgba(103,232,249,0.28) 0%, transparent 45%),
      radial-gradient(ellipse at 70% 90%, rgba(34,42,55,0.7) 0%, transparent 60%),
      linear-gradient(180deg, #0a1418 0%, #050709 100%)
    `,
  },
};

/*
 * MOOD — per-agent CSS filter applied to the croc image itself, so the
 * same mascot reads as a different character in each card via color
 * grading. This is the strongest single tool we have for differentiation
 * without regenerating the source image.
 */
const MOOD: Record<string, string> = {
  // soft cyan-tinted, slight desaturate (library mood)
  researcher: 'hue-rotate(170deg) saturate(0.85) brightness(1.05) contrast(1.05)',
  // pink-tinted, slight blur (planning room marker glow)
  planner: 'hue-rotate(320deg) saturate(1.1) brightness(1.0)',
  // warm amber (golden hour sales call)
  outreach: 'hue-rotate(35deg) saturate(1.2) brightness(1.08) contrast(1.0)',
  // hot pink studio (designer)
  designer: 'hue-rotate(300deg) saturate(1.3) brightness(1.05)',
  // cool violet (analyst monitor glow)
  analyst: 'hue-rotate(250deg) saturate(1.1) brightness(0.95)',
  // saturated emerald terminal (coder)
  coder: 'hue-rotate(95deg) saturate(1.4) brightness(0.95) contrast(1.15)',
  // cyan crisp office (ops)
  ops: 'hue-rotate(180deg) saturate(1.0) brightness(1.0)',
  // warm emerald spotlight (supervisor)
  supervisor: 'hue-rotate(85deg) saturate(1.15) brightness(1.05)',
  // noir desaturated + green tint (browser/detective)
  browser: 'grayscale(0.4) sepia(0.2) hue-rotate(140deg) saturate(1.1) brightness(0.95) contrast(1.1)',
};

function CastPlaceholder({ accent, slug, index }: { accent: string; slug: string; index: number }) {
  const bgStyle = SCENE_BG[slug] ?? SCENE_BG.researcher;
  // Look up the bespoke croc character for this agent. Each one is a
  // unique SVG illustration with its own body shape, pose, and integrated
  // costume — defined in components/cast-croc-characters.tsx.
  const CharacterComponent = CAST_CROCS[slug] ?? CAST_CROCS.researcher;
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Per-agent dramatic backdrop — radically different per slug */}
      <div aria-hidden className="absolute inset-0" style={bgStyle} />
      {/* faint dot grid layered on top of the backdrop for texture */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.12]" />

      {/* The bespoke character SVG fills the card. Each agent's
          illustration includes their costume, props, and scene-context
          elements drawn AS PART of the SVG — not as separate overlays.
          The SVG uses preserveAspectRatio=meet (default) to fit fully
          within the 4:5 card area without cropping. */}
      <motion.div
        className="absolute inset-0 z-10"
        animate={{
          y: [0, -4, 0],
          rotate: index % 2 === 0 ? [-1, 1, -1] : [1, -1, 1],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <CharacterComponent
          accent={accent}
          className="absolute inset-0 h-full w-full"
          style={{
            filter: `drop-shadow(0 12px 32px ${accent}55) drop-shadow(0 0 24px ${accent}22)`,
          }}
        />
      </motion.div>
    </div>
  );
}

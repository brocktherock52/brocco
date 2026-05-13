'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
            <span className="text-grad">888 specialists.</span>{' '}
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
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Mouse-tracked 3D tilt — desktop+fine-pointer only. Disabling on touch
  // killed the mobile scroll-jank where every touchmove was triggering tilt.
  const [tiltEnabled, setTiltEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine) and (min-width: 1024px)');
    const apply = () => setTiltEnabled(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 24 });
  const sy = useSpring(my, { stiffness: 200, damping: 24 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-8, 8]);
  const glareX = useTransform(sx, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(sy, [-0.5, 0.5], ['0%', '100%']);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!tiltEnabled) return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    mx.set(x);
    my.set(y);
  }
  function onLeave() {
    if (!tiltEnabled) return;
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={tiltEnabled ? onMove : undefined}
        onMouseLeave={tiltEnabled ? onLeave : undefined}
        style={tiltEnabled ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
      >
      <Link
        href={member.href ?? `/agents/${member.slug}`}
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
          style={{ backgroundColor: '#000000' }}
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
              animate={{
                scale: [1, 1.05, 1.02, 1.05, 1],
                y: [0, -8, 0, -4, 0],
                rotate: [-0.8, 0.8, -0.8, 0.4, -0.8],
              }}
              transition={{
                duration: 5 + (index % 3) * 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.2,
              }}
            >
              <Image
                src={member.imagePath as string}
                alt={`${member.name} brocco-croc vignette`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
              />
              {/* accent underlay. cast-v7 PNGs ship with true alpha
                  channels so we no longer need the CSS chroma-key
                  hack (mix-blend-mode: screen + contrast/saturate
                  tweaks). this radial just gives each card a slight
                  themed wash behind the transparent croc. */}
              <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                  background: `radial-gradient(120% 90% at 50% 35%, ${accent}40 0%, ${accent}18 35%, #050b16 75%)`,
                }}
              />
            </motion.div>
          ) : (
            <CastPlaceholder accent={accent} slug={member.slug} index={index} />
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 ring-1 ring-inset transition-colors duration-300"
            style={{
              ['--ring' as string]: `${accent}55`,
              boxShadow:
                'inset 0 -90px 120px -50px rgba(5,8,16,0.95), inset 0 90px 120px -60px rgba(5,8,16,0.75)',
            }}
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
      </motion.div>
    </motion.li>
  );
}

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

function CastPlaceholder({ accent, slug, index }: { accent: string; slug: string; index: number }) {
  const bgStyle = SCENE_BG[slug] ?? SCENE_BG.researcher;
  const CrocCharacter = CAST_CROCS[slug] ?? CAST_CROCS.researcher;
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Per-agent dramatic backdrop — radically different per slug */}
      <div aria-hidden className="absolute inset-0" style={bgStyle} />
      {/* faint dot grid layered on top of the backdrop for texture */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.10]" />

      {/* Soft halo behind the croc — pulls eye to the bespoke character */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[18%] h-[60%] w-[70%] -translate-x-1/2 rounded-full blur-3xl opacity-50"
        style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)` }}
      />

      {/* The bespoke per-agent croc — each one is a distinct illustration
          (researcher at his desk, planner at the whiteboard, browser in his
          leather chair, etc.). The whole scene IS the SVG so we don't need
          to overlay separate prop icons. */}
      <motion.div
        className="absolute inset-x-0 top-0 z-10 flex justify-center"
        animate={{ y: [0, -5, 0, 3, 0], rotate: index % 2 === 0 ? [-1, 1, -1] : [1, -1, 1] }}
        transition={{ duration: 6 + (index % 3) * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          filter: `drop-shadow(0 10px 24px ${accent}55) drop-shadow(0 0 22px ${accent}33)`,
        }}
      >
        <CrocCharacter
          accent={accent}
          className="h-[88%] w-auto"
          style={{ aspectRatio: '4 / 5' }}
        />
      </motion.div>

      {/* Subtle accent vignette in the upper-right corner — pulls the eye
          to the badge area without competing with the character. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)` }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4 + (index % 3), repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

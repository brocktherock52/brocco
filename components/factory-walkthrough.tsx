'use client';

/**
 * The brocco factory section. Condensed 2026-05-27 (was five 88vh scroll
 * stages, way too much scrolling). Now:
 *   1. Intro headline.
 *   2. Cinematic Higgsfield/Kling factory render (16:9), full-width.
 *   3. A single compact row of five stage cards, each a small 9:16 Seedance
 *      clip that autoplays when the row scrolls into view.
 * No posters anywhere: the clips open on motion, never a frozen still.
 *
 * Sources: public/assets/video/factory.mp4 (cinematic),
 *          public/assets/factory/stage-{1..5}.mp4 (stage clips).
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface AgentChip {
  label: string;
  color: string;
}

interface Stage {
  id: string;
  num: string;
  title: string;
  copy: string;
  video: string;
  chip: AgentChip;
}

const STAGES: Stage[] = [
  {
    id: 'receive',
    num: '01',
    title: 'type one prompt',
    copy: 'no kanban, no tickets. you say what you want.',
    video: '/assets/factory/stage-1.mp4',
    chip: { label: 'your prompt', color: '#FFFFFF' },
  },
  {
    id: 'dispatch',
    num: '02',
    title: 'team dispatched',
    copy: 'sully splits it into parallel tracks across the team.',
    video: '/assets/factory/stage-2.mp4',
    chip: { label: 'supervisor', color: '#22C55E' },
  },
  {
    id: 'execute',
    num: '03',
    title: 'all in parallel',
    copy: 'research, plans, code, design. all at once.',
    video: '/assets/factory/stage-3.mp4',
    chip: { label: 'specialists', color: '#67E8F9' },
  },
  {
    id: 'deliver',
    num: '04',
    title: 'outputs land',
    copy: 'finished artifacts hit your dashboard.',
    video: '/assets/factory/stage-4.mp4',
    chip: { label: 'artifacts', color: '#A78BFA' },
  },
  {
    id: 'ship',
    num: '05',
    title: 'you ship',
    copy: 'one prompt in, finished work out.',
    video: '/assets/factory/stage-5.mp4',
    chip: { label: 'shipped', color: '#22C55E' },
  },
];

/** Lazy, poster-free video. Gates download on scroll, opens on motion. */
function LazyVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      <div aria-hidden className="absolute inset-0 bg-[#06080f]" />
      {visible && (
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full bg-[#06080f] object-cover"
        />
      )}
    </div>
  );
}

// Cinematic opener: the Higgsfield/Kling 3.0 factory render (16:9, 25 MB),
// lazy-loaded, no poster.
function CinematicOpener() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative mt-10 md:mt-12"
    >
      <div className="relative mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-[24px] border border-white/10 bg-[#06080f] shadow-[0_40px_140px_-40px_rgba(124,58,237,0.5)]">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px z-10 rounded-[24px]"
          style={{
            background:
              'linear-gradient(120deg, rgba(124,58,237,0.6), rgba(34,211,238,0.45), transparent 70%)',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: 1,
          }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <LazyVideo src="/assets/video/factory.mp4" className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(0,0,0,0.4)_92%)]" />
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-2 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 pt-12 font-mono text-[11px] uppercase tracking-[0.18em] text-white/75">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
          </span>
          the line, rendered in motion
        </div>
      </div>
    </motion.div>
  );
}

function StageCard({ stage, index }: { stage: Stage; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#06080f] transition-colors group-hover:border-white/20">
        <LazyVideo src={stage.video} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(0,0,0,0.45)_90%)]" />
        <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] text-white/80 backdrop-blur">
          {stage.num}
        </span>
        <span
          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] backdrop-blur"
          style={{ color: stage.chip.color }}
        >
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: stage.chip.color, boxShadow: `0 0 6px ${stage.chip.color}` }}
          />
          {stage.chip.label}
        </span>
      </div>
      <h3 className="mt-3 text-[15px] font-semibold lowercase tracking-tight text-ink">
        {stage.title}
      </h3>
      <p className="mt-1 text-[12.5px] leading-snug text-ink-dim">{stage.copy}</p>
    </motion.div>
  );
}

export function FactoryWalkthrough() {
  return (
    // id="how": this is the "how it works" section (replaced the old one).
    <section id="how" className="relative w-full bg-[#06080f] py-24 md:py-32">
      <div className="container-x relative">
        {/* Intro */}
        <div className="max-w-2xl">
          <div className="pill mb-5">the factory</div>
          <h2 className="text-display-lg lowercase">
            <span className="text-grad">walk through</span>{' '}
            <span className="text-grad-brand">the brocco factory.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-dim">
            one prompt in, finished work out. here is the whole line, start to ship.
          </p>
        </div>

        {/* Cinematic opener */}
        <CinematicOpener />

        {/* Compact five-stage strip */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STAGES.map((stage, i) => (
            <StageCard key={stage.id} stage={stage} index={i} />
          ))}
        </div>

        {/* Single CTA */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
          <Link
            href="/checkout/solo"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-cyan px-6 py-3.5 text-[15px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow"
          >
            <Sparkles className="h-4 w-4" />
            <span>start your trial . $49/mo</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <span className="text-[12.5px] text-ink-faint">7-day free trial. cancel anytime.</span>
        </div>
      </div>
    </section>
  );
}

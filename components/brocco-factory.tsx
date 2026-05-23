'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

// BroccoFactory — multi-station conveyor that visibly assembles agents.
//
// 2026-05-13 rebuild. Old version was a flat backdrop + emoji runners.
// New version layers:
//   - cosmic-matched gradient backplate (no whiteboard photo)
//   - left-side SPAWN portal that emits a fresh croc head every cycle
//   - three sequential build stations (costume / tools / brief) each
//     with their own robotic arm + spark animation
//   - moving belt of cast-v7 agent heads riding through all stations
//   - right-side READY stamp + queue counter ticking up
//
// If a marketing-quality factory video has been generated (e.g. via
// Higgsfield Seedance 2.0, prompt in /prompts/factory-seedance.md),
// drop the path into FACTORY_VIDEO_PATH and the component will swap to
// the video while preserving captions/CTAs.

const FACTORY_VIDEO_PATH: string | null = '/assets/video/factory.mp4'; // Higgsfield Kling 3.0 (pro) job 9d236581-2549-4ca2-bba3-a0a5e3f7c584 (2026-05-22, white-croc rebrand). Backup of 2026-05-13 Seedance cut at factory.backup-20260522.mp4.

const LINE: Array<{ slug: string; accent: string }> = [
  { slug: 'researcher', accent: '#67E8F9' },
  { slug: 'planner', accent: '#FB7185' },
  { slug: 'outreach', accent: '#FBBF24' },
  { slug: 'designer', accent: '#F472B6' },
  { slug: 'analyst', accent: '#A78BFA' },
  { slug: 'coder', accent: '#4ADE80' },
  { slug: 'supervisor', accent: '#22C55E' },
  { slug: 'browser', accent: '#67E8F9' },
  { slug: 'recruiter', accent: '#A78BFA' },
  { slug: 'qa', accent: '#4ADE80' },
];

const BELT_DURATION = 14; // seconds for one croc to cross
const STATIONS = [
  { xPct: 26, label: 'costume', accent: '#F472B6' },
  { xPct: 50, label: 'tools', accent: '#67E8F9' },
  { xPct: 74, label: 'brief', accent: '#FBBF24' },
];

// LazyFactoryVideo. The Kling 3.0 mp4 is 25 MB. Don't ship it to every visitor.
// Gate playback on the video actually scrolling into view, and skip download
// entirely until then. Saves ~25 MB of bandwidth and ~1.5s of LCP on the
// landing page.
function LazyFactoryVideo({ path }: { path: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {visible ? (
        <video
          src={path}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-bg-1 to-bg-0"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
            factory loading on scroll
          </span>
        </div>
      )}
    </div>
  );
}

export function BroccoFactory() {
  const [counter, setCounter] = useState(2854);
  useEffect(() => {
    const t = setInterval(() => setCounter((c) => c + 1 + Math.floor(Math.random() * 3)), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative py-24 md:py-32" id="factory">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            the brocco factory
          </p>
          <h2 className="mt-5 text-display-xl">
            <span className="text-grad">an endless line</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">of specialists.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
            you'll never need to staff your AI team again. brocco's line spawns a fresh specialist,
            fits a costume, slots tools, and prints a briefing. then the next one is already on the belt.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-white/[0.08] shadow-glow"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.10) 0%, transparent 55%), linear-gradient(180deg, #0d0a1a 0%, #050410 100%)',
          }}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            {FACTORY_VIDEO_PATH ? (
              <LazyFactoryVideo path={FACTORY_VIDEO_PATH} />
            ) : (
              <CssFactory counter={counter} />
            )}
          </div>
        </motion.div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              06:00 line start
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
              4-step wizard
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              your specialists, on demand
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/app/agents/new"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-cyan px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow"
            >
              build your own agent
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/agents"
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-white/[0.05]"
            >
              meet the cast
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CssFactory({ counter }: { counter: number }) {
  return (
    <>
      {/* Backplate scanlines + grid */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(167,139,250,0.04) 4px, rgba(167,139,250,0.04) 5px), linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)',
          backgroundSize: 'auto, 40px 40px, 40px 40px',
        }}
      />

      {/* Ceiling pipes (decorative) */}
      <div className="absolute inset-x-0 top-[8%] flex h-1 items-center px-[8%]">
        <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-fuchsia-500/30 via-violet-500/40 to-cyan-500/30" />
      </div>

      {/* Stations */}
      {STATIONS.map((s, i) => (
        <Station key={s.label} station={s} idx={i} />
      ))}

      {/* Belt baseline */}
      <div className="absolute inset-x-[4%] bottom-[28%] h-[3px] rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      {/* Belt rollers */}
      <div className="absolute inset-x-[4%] bottom-[27%] h-2 overflow-hidden">
        <motion.div
          className="flex h-full items-center gap-3"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ width: '200%' }}
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-3 shrink-0 rounded-full bg-white/30"
              style={{ boxShadow: '0 0 4px rgba(255,255,255,0.2)' }}
            />
          ))}
        </motion.div>
      </div>

      {/* SPAWN portal — left end */}
      <div className="absolute left-[3%] bottom-[22%] flex h-[24%] w-[110px] items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-2xl border border-violet-400/40"
          style={{
            background:
              'radial-gradient(circle at 35% 35%, rgba(167,139,250,0.45) 0%, transparent 65%), radial-gradient(circle at 65% 65%, rgba(34,211,238,0.32) 0%, transparent 65%)',
            boxShadow: '0 0 36px rgba(167,139,250,0.55), inset 0 0 28px rgba(34,211,238,0.22)',
          }}
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="relative font-mono text-[11px] uppercase tracking-[0.22em] text-violet-200">
          spawn
        </span>
      </div>

      {/* Moving crocs on belt */}
      {LINE.map((c, i) => (
        <BeltCroc key={c.slug + i} agent={c} delay={i * (BELT_DURATION / LINE.length)} />
      ))}

      {/* End fade */}
      <div className="absolute right-0 top-0 bottom-0 w-[14%] bg-gradient-to-l from-[#050410] to-transparent" />

      {/* READY stamp top-right */}
      <div className="absolute right-[3%] bottom-[28%] flex flex-col items-end gap-1">
        <div
          className="rounded-md border border-emerald-400/60 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200"
          style={{ boxShadow: '0 0 14px rgba(74,222,128,0.4)' }}
        >
          ready · ship
        </div>
        <span className="font-mono text-[10px] tabular-nums text-emerald-400/70">
          #{counter.toLocaleString()}
        </span>
      </div>

      {/* Status overlays — top corners */}
      <div className="absolute left-[3%] top-[6%] rounded-md border border-violet-400/30 bg-bg-0/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-violet-200 backdrop-blur">
        line · live
      </div>
      <div className="absolute right-[3%] top-[6%] rounded-md border border-white/15 bg-bg-0/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim backdrop-blur">
        seedance · queued
      </div>
    </>
  );
}

function Station({
  station,
  idx,
}: {
  station: { xPct: number; label: string; accent: string };
  idx: number;
}) {
  return (
    <div
      aria-hidden
      className="absolute"
      style={{
        left: `${station.xPct}%`,
        top: '14%',
        transform: 'translateX(-50%)',
        width: 90,
        height: '64%',
      }}
    >
      {/* Robotic arm */}
      <motion.div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        animate={{ y: [0, 110, 0] }}
        transition={{
          duration: BELT_DURATION / LINE.length,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: (idx * BELT_DURATION) / LINE.length / STATIONS.length,
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className="h-20 w-1.5 rounded"
            style={{
              background: `linear-gradient(to bottom, ${station.accent}99, ${station.accent}33)`,
            }}
          />
          <div
            className="-mt-1 h-3 w-7 rounded-b"
            style={{
              background: station.accent,
              boxShadow: `0 0 14px ${station.accent}88`,
            }}
          />
          <motion.span
            className="-mt-1 text-base"
            style={{ color: station.accent }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.5, 0.6] }}
            transition={{
              duration: BELT_DURATION / LINE.length,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (idx * BELT_DURATION) / LINE.length / STATIONS.length,
            }}
          >
            ✦
          </motion.span>
        </div>
      </motion.div>

      {/* Station label */}
      <div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-md border bg-bg-0/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] backdrop-blur"
        style={{ borderColor: `${station.accent}55`, color: station.accent }}
      >
        {station.label}
      </div>
    </div>
  );
}

function BeltCroc({
  agent,
  delay,
}: {
  agent: { slug: string; accent: string };
  delay: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ bottom: '24%', left: '7%', width: 72, height: 72 }}
      animate={{ x: ['0%', '900%'], opacity: [0, 1, 1, 0] }}
      transition={{
        duration: BELT_DURATION,
        repeat: Infinity,
        ease: 'linear',
        times: [0, 0.06, 0.92, 1],
        delay,
      }}
    >
      <motion.div
        className="relative h-full w-full overflow-hidden rounded-xl border"
        style={{
          borderColor: `${agent.accent}55`,
          boxShadow: `inset 0 0 0 1px ${agent.accent}33, 0 6px 20px ${agent.accent}33`,
          background: `radial-gradient(120% 90% at 50% 35%, ${agent.accent}40 0%, ${agent.accent}15 40%, #050b16 80%)`,
        }}
        animate={{ y: [-1, 1, -1] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image
          src={`/assets/cast-v7/${agent.slug}.png`}
          alt=""
          fill
          sizes="72px"
          className="object-cover"
        />
        <span
          className="absolute inset-x-0 bottom-0 px-1 pb-0.5 text-center font-mono text-[8px] uppercase tracking-[0.18em]"
          style={{ color: agent.accent, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}
        >
          {agent.slug}
        </span>
      </motion.div>
    </motion.div>
  );
}

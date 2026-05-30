'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// CosmicBg, site-wide retro-futuristic space backdrop (revamped 2026-05-27).
//
// Direction: Cowboy Bebop x cyberpunk. Deep navy-black void, warm-noir +
// neon. Cool teal/cyan dominates, with sparing magenta and amber pops (the
// Bebop signature: moody blues, jazzy neon accents). Layered nebula clouds,
// a distant ringed gas giant, a red-giant ember sun, neon meteor streaks,
// fine film grain, and faint CRT scanlines for the analog-future feel.
//
// Palette (chosen, see docs/internal/VISUAL_REVAMP_2026-05-27.md):
//   void     #06070F / #0A0A14   base navy-black
//   teal     #22D3EE / #2DD4BF   primary neon (cool)
//   cyan-lt  #67E8F9             star highlights
//   magenta  #E0457B / #FB7185   accent pop
//   amber    #FBBF24             ember / warm pop
//   ice      #C7D2FE             cool star tint
//
// Layers (back to front):
//   1. Deep-space gradient wash (navy + faint teal/magenta vignettes)
//   2. Soft neon nebula clouds (teal, magenta, amber), slow drift
//   3. Starfield, ~280 (auto-thinned on mobile + reduced-motion), tinted
//   4. Distant ringed gas giant + red-giant ember sun
//   5. Neon meteor streaks + a couple of slow comets
//   6. Fine grain + faint horizontal scanlines (CRT/film-noir grade)
//
// Performance: starfield thins to 90 on narrow viewports; when the user
// prefers reduced motion we drop animated streaks/twinkle and render a
// calm static field. Stays behind content (z-0, pointer-events none).

// Cool-leaning star tints with rare warm/magenta pops (Bebop ratio).
const STAR_TINTS = [
  '#FFFFFF',
  '#FFFFFF',
  '#FFFFFF',
  '#C7D2FE', // ice
  '#67E8F9', // cyan
  '#22D3EE', // teal
  '#FBBF24', // amber pop
  '#FB7185', // magenta pop
];

interface Dot {
  id: number;
  xPct: number;
  yPct: number;
  size: number;
  dur: number;
  delay: number;
  color: string;
}

// Soft neon nebula cloud (radial gradient blob, slow parallax drift).
interface Nebula {
  id: number;
  xPct: number;
  yPct: number;
  size: number;
  color: string;
  driftX: number;
  driftY: number;
  dur: number;
}

const NEBULAE: Nebula[] = [
  { id: 0, xPct: 18, yPct: 22, size: 560, color: 'rgba(34,211,238,0.16)', driftX: 24, driftY: -14, dur: 38 },
  { id: 1, xPct: 82, yPct: 28, size: 520, color: 'rgba(224,69,123,0.13)', driftX: -22, driftY: 16, dur: 44 },
  { id: 2, xPct: 64, yPct: 74, size: 640, color: 'rgba(45,212,191,0.12)', driftX: 18, driftY: 18, dur: 52 },
  { id: 3, xPct: 30, yPct: 82, size: 460, color: 'rgba(251,191,36,0.08)', driftX: -16, driftY: -12, dur: 48 },
  { id: 4, xPct: 50, yPct: 4, size: 720, color: 'rgba(124,58,237,0.10)', driftX: 12, driftY: 10, dur: 60 },
];

export function CosmicBg() {
  const [stars, setStars] = useState<Dot[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  // On phones we render the whole field calm + static. The infinite per-star
  // twinkle (90 framer-motion RAF loops), the drifting nebulae/meteors, and the
  // two full-screen mix-blend-mode layers each force the browser to recomposite
  // the fixed backdrop on every scroll frame, which is what made scrolling
  // glitch on mobile. Freezing them keeps the look while killing the jank.
  const calm = reduced || isMobile;

  useEffect(() => {
    const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsMobile(mobile);
    setReduced(prefersReduced);

    const STAR_COUNT = mobile ? 90 : 280;
    const sList: Dot[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const x = Math.random() * 100;
      let y: number;
      // ~65% of stars hug a soft diagonal "milky way" band for depth.
      if (Math.random() < 0.65) {
        const bandY = 18 + (x / 100) * 64;
        const jitter = (Math.random() - 0.5) * 34;
        y = Math.max(0, Math.min(100, bandY + jitter));
      } else {
        y = Math.random() * 100;
      }
      sList.push({
        id: i,
        xPct: x,
        yPct: y,
        size: Math.random() * 1.7 + 0.5,
        dur: 2.4 + Math.random() * 5,
        delay: Math.random() * 6,
        color: STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)],
      });
    }
    setStars(sList);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        // Navy-black void with cool/warm neon vignettes. Sits on top of
        // BgDecor's opaque #0A0A0F base, so we keep this mostly translucent.
        background:
          'radial-gradient(120% 90% at 50% -10%, rgba(34,211,238,0.05) 0%, transparent 45%), ' +
          'radial-gradient(90% 70% at 85% 18%, rgba(224,69,123,0.05) 0%, transparent 55%), ' +
          'radial-gradient(110% 80% at 15% 85%, rgba(45,212,191,0.05) 0%, transparent 55%), ' +
          'linear-gradient(180deg, rgba(6,7,15,0.55) 0%, rgba(6,7,15,0.15) 35%, rgba(6,7,15,0.55) 100%)',
        opacity: 0.92,
      }}
    >
      {/* Neon nebula clouds, soft and slow. On reduced-motion / mobile they
          stay put. */}
      {NEBULAE.map((n) => (
        <NebulaCloud key={n.id} n={n} reduced={calm} />
      ))}

      {/* Starfield. Static (no twinkle) on reduced-motion + mobile. */}
      {stars.map((s) => (
        <Star key={s.id} s={s} reduced={calm} />
      ))}

      {/* Distant ringed gas giant (cool) + red-giant ember sun (warm pop) */}
      <GasGiant />
      <EmberSun />

      {/* Neon meteors + slow comets, only when motion is allowed and not on a
          phone (moving elements behind the fixed bar trigger reblur on scroll). */}
      {!calm && (
        <>
          <Meteor delay={0} top="12%" angle={-12} color="#67E8F9" len={150} />
          <Meteor delay={5} top="34%" angle={-8} color="#FB7185" len={120} />
          <Meteor delay={9} top="56%" angle={-15} color="#FBBF24" len={135} />
          <Meteor delay={13} top="72%" angle={-6} color="#67E8F9" len={110} />
          {!isMobile && <Meteor delay={17} top="86%" angle={-18} color="#2DD4BF" len={160} />}
          <SlowComet delay={3} startTop="14%" endTop="40%" color="#67E8F9" />
          {!isMobile && <SlowComet delay={20} startTop="68%" endTop="34%" color="#E0457B" />}
        </>
      )}

      {/* Faint CRT scanlines + film grain, retro-future grade. Both use
          full-screen mix-blend-mode, which is cheap to paint once but forces a
          recomposite of the fixed backdrop on every scroll frame. That is a
          major scroll-jank source on phones, so we skip both on mobile. */}
      {!isMobile && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)',
              mixBlendMode: 'overlay',
              opacity: 0.4,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
              opacity: 0.05,
              mixBlendMode: 'soft-light',
            }}
          />
        </>
      )}

      {/* Horizon haze at the very bottom, teal-noir glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[26%]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.05) 60%, rgba(224,69,123,0.05) 100%)',
        }}
      />
    </div>
  );
}

function Star({ s, reduced }: { s: Dot; reduced: boolean }) {
  const base = {
    left: `${s.xPct}%`,
    top: `${s.yPct}%`,
    width: s.size,
    height: s.size,
    background: s.color,
    boxShadow: `0 0 ${s.size * 2.6}px ${s.color}aa`,
  } as const;
  if (reduced) {
    return <span aria-hidden className="absolute rounded-full" style={{ ...base, opacity: 0.6 }} />;
  }
  return (
    <motion.span
      aria-hidden
      className="absolute rounded-full"
      style={{ ...base, opacity: 0.75 }}
      animate={{ opacity: [0.18, 0.95, 0.18] }}
      transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function NebulaCloud({ n, reduced }: { n: Nebula; reduced: boolean }) {
  const style = {
    left: `${n.xPct}%`,
    top: `${n.yPct}%`,
    width: n.size,
    height: n.size,
    transform: 'translate(-50%, -50%)',
    background: `radial-gradient(circle at 50% 50%, ${n.color} 0%, transparent 68%)`,
    filter: 'blur(26px)',
  } as const;
  if (reduced) {
    return <div aria-hidden className="absolute" style={{ ...style, opacity: 0.7 }} />;
  }
  return (
    <motion.div
      aria-hidden
      className="absolute"
      style={style}
      animate={{ x: [0, n.driftX, 0], y: [0, n.driftY, 0], opacity: [0.55, 0.85, 0.55] }}
      transition={{ duration: n.dur, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// Distant ringed gas giant. Cool teal-lit crescent, sits upper-left.
// The outer ring (rx=13, rotated -20deg) extends past the planet's body, so the
// viewBox + container are sized with padding around the body so the ring isn't
// clipped at either end. Old viewBox "-2 -2 24 24" cut the rings off; the wider
// box gives ~4 units of clearance on each side, and the container bumps up
// proportionally so the planet looks the same size.
function GasGiant() {
  return (
    <motion.div
      aria-hidden
      className="absolute"
      style={{ left: '9%', top: '20%', width: 180, height: 180, transform: 'translate(-50%, -50%)', opacity: 0.5 }}
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="-4 -4 28 28" className="h-full w-full" overflow="visible">
        <defs>
          <radialGradient id="gg-body" cx="34%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#22D3EE" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0A0A14" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <circle cx="10" cy="10" r="8.4" fill="url(#gg-body)" stroke="#67E8F9" strokeWidth="0.4" strokeOpacity="0.5" />
        {/* banding */}
        <ellipse cx="10" cy="9" rx="8" ry="1" fill="#22D3EE" opacity="0.12" />
        <ellipse cx="10" cy="11.4" rx="7.4" ry="0.8" fill="#0A0A14" opacity="0.28" />
        {/* ring */}
        <ellipse
          cx="10"
          cy="10"
          rx="13"
          ry="2.6"
          fill="none"
          stroke="#67E8F9"
          strokeWidth="0.5"
          strokeOpacity="0.7"
          transform="rotate(-20 10 10)"
        />
        <ellipse
          cx="10"
          cy="10"
          rx="11"
          ry="2.1"
          fill="none"
          stroke="#FB7185"
          strokeWidth="0.3"
          strokeOpacity="0.4"
          transform="rotate(-20 10 10)"
        />
      </svg>
    </motion.div>
  );
}

// Red-giant ember sun, the warm Bebop pop. Lower-right, soft pulse.
function EmberSun() {
  return (
    <motion.div
      aria-hidden
      className="absolute"
      style={{ left: '88%', top: '78%', width: 120, height: 120, transform: 'translate(-50%, -50%)' }}
      animate={{ opacity: [0.4, 0.62, 0.4] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.55) 0%, rgba(224,69,123,0.22) 42%, transparent 70%)',
          filter: 'blur(4px)',
        }}
      />
    </motion.div>
  );
}

function Meteor({
  delay,
  top,
  angle,
  color,
  len,
}: {
  delay: number;
  top: string;
  angle: number;
  color: string;
  len: number;
}) {
  return (
    <motion.div
      className="absolute -left-[20%]"
      style={{ top, transform: `rotate(${angle}deg)`, opacity: 0.7 }}
      animate={{ x: ['0vw', '142vw'] }}
      transition={{ duration: 3, delay, repeat: Infinity, repeatDelay: 8.5, ease: 'easeOut' }}
    >
      <div className="flex items-center">
        <div
          className="h-px"
          style={{
            width: len,
            background: `linear-gradient(90deg, transparent, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${color}88`,
          }}
        />
        <div
          className="h-[3px] w-[3px] rounded-full"
          style={{ background: '#fff', boxShadow: `0 0 10px #fff, 0 0 20px ${color}` }}
        />
      </div>
    </motion.div>
  );
}

function SlowComet({
  delay,
  startTop,
  endTop,
  color,
}: {
  delay: number;
  startTop: string;
  endTop: string;
  color: string;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ left: '-20%', top: startTop, opacity: 0.5 }}
      animate={{ x: ['0vw', '130vw'], top: [startTop, endTop] }}
      transition={{ duration: 24, delay, repeat: Infinity, repeatDelay: 16, ease: 'linear' }}
    >
      <div className="flex items-center">
        <div
          className="h-px"
          style={{
            width: 240,
            background: `linear-gradient(90deg, transparent, ${color}88, rgba(255,255,255,0.9))`,
            boxShadow: `0 0 12px ${color}77`,
          }}
        />
        <div
          className="h-1.5 w-1.5 rounded-full bg-white"
          style={{ boxShadow: `0 0 14px rgba(255,255,255,0.85), 0 0 28px ${color}99` }}
        />
      </div>
    </motion.div>
  );
}

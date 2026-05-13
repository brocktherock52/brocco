'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// CosmicBg — site-wide cartoony space overlay.
//
// Fixed-position behind everything (pointer-events-none, z-0). Stars,
// shooting stars, planets, galaxies in white + soft purple at LOW
// opacity so content stays readable. Each element is an absolute-
// positioned HTML element with px sizing so the dots never stretch into
// ovals on wide screens.

const PURPLE = ['#A78BFA', '#C4B5FD', '#DDD6FE'];
const WHITE = '#FFFFFF';

interface Dot {
  id: number;
  xPct: number;
  yPct: number;
  size: number; // px diameter
  dur: number;
  delay: number;
  color: string;
}

interface PlanetData {
  id: number;
  xPct: number;
  yPct: number;
  size: number; // px diameter
  ring: boolean;
  color: string;
}

export function CosmicBg() {
  const [stars, setStars] = useState<Dot[]>([]);
  const [planets, setPlanets] = useState<PlanetData[]>([]);

  useEffect(() => {
    // Desert-night-sky density: ~280 stars sprinkled across the sky,
    // 70% concentrated in a wide diagonal "milky way" band running
    // from upper-left to lower-right. The band rule is: pick a
    // distance-from-band coefficient and bias the y toward the band.
    const sList: Dot[] = [];
    for (let i = 0; i < 280; i++) {
      const x = Math.random() * 100;
      // Probabilistic band placement: 70% near band, 30% scattered
      let y: number;
      if (Math.random() < 0.7) {
        // band y = f(x) with small noise
        const bandY = 20 + (x / 100) * 60;
        const jitter = (Math.random() - 0.5) * 30;
        y = Math.max(0, Math.min(100, bandY + jitter));
      } else {
        y = Math.random() * 100;
      }
      sList.push({
        id: i,
        xPct: x,
        yPct: y,
        size: Math.random() * 1.8 + 0.6, // 0.6-2.4px — tighter dots = more desert pinpoint
        dur: 2 + Math.random() * 5,
        delay: Math.random() * 5,
        color: Math.random() < 0.18 ? PURPLE[Math.floor(Math.random() * PURPLE.length)] : WHITE,
      });
    }
    setStars(sList);

    // 6 cartoony planets scattered
    setPlanets([
      { id: 0, xPct: 8, yPct: 18, size: 64, ring: true, color: PURPLE[0] },
      { id: 1, xPct: 92, yPct: 30, size: 40, ring: false, color: WHITE },
      { id: 2, xPct: 14, yPct: 72, size: 32, ring: false, color: PURPLE[2] },
      { id: 3, xPct: 88, yPct: 80, size: 72, ring: true, color: PURPLE[1] },
      { id: 4, xPct: 50, yPct: 6, size: 28, ring: false, color: WHITE },
      { id: 5, xPct: 60, yPct: 92, size: 44, ring: false, color: PURPLE[0] },
    ]);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        // Desert-night-sky layers: deeper black core + a soft diagonal
        // "milky way" band of faint purple wash + a violet glow up-right
        background:
          'linear-gradient(135deg, rgba(196,181,253,0.025) 22%, transparent 52%, rgba(167,139,250,0.022) 70%, transparent 90%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.04) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(196,181,253,0.028) 0%, transparent 55%)',
        opacity: 0.55,
      }}
    >
      {/* Stars layer — each star is a tiny absolutely-positioned div */}
      {stars.map((s) => (
        <motion.span
          key={s.id}
          aria-hidden
          className="absolute rounded-full"
          style={{
            left: `${s.xPct}%`,
            top: `${s.yPct}%`,
            width: s.size,
            height: s.size,
            background: s.color,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}66`,
            opacity: 0.55,
          }}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Galaxy swirls in the corners — slow rotation */}
      <CornerGalaxy x="6%" y="6%" size={120} />
      <CornerGalaxy x="94%" y="50%" size={80} delay={2} />
      <CornerGalaxy x="50%" y="95%" size={100} delay={4} />

      {/* Planets — cartoony outline with optional rings */}
      {planets.map((p) => (
        <Planet key={p.id} planet={p} />
      ))}

      {/* Shooting stars sweep across at staggered intervals */}
      <ShootingStar delay={0} top="22%" angle={-12} />
      <ShootingStar delay={5} top="55%" angle={-8} />
      <ShootingStar delay={11} top="78%" angle={-15} />

      {/* Slow drifting comets — long arcs across the full viewport. Like
          the cosmic-website Dribbble references (Marcato, FANCY). */}
      <SlowComet delay={3} startTop="12%" endTop="40%" />
      <SlowComet delay={20} startTop="68%" endTop="34%" />

      {/* Desert horizon silhouette at the bottom — mesa-shaped, slightly
          translucent so it reads as the curve of the earth seen from a
          dark-sky preserve. Matches the user direction "stars and sky
          when you're in the middle of a desert". */}
      <div className="absolute inset-x-0 bottom-0 h-[28%] opacity-30">
        <svg
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M 0 200 L 0 140 Q 80 130 140 138 L 220 110 L 280 122 L 360 90 L 440 105 L 540 78 L 640 98 L 760 85 L 860 112 L 960 95 L 1080 118 L 1200 100 L 1200 200 Z"
            fill="#08060f"
            stroke="#A78BFA"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />
        </svg>
      </div>
    </div>
  );
}

function SlowComet({
  delay,
  startTop,
  endTop,
}: {
  delay: number;
  startTop: string;
  endTop: string;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ left: '-20%', top: startTop, opacity: 0.5 }}
      animate={{ x: ['0vw', '130vw'], top: [startTop, endTop] }}
      transition={{ duration: 22, delay, repeat: Infinity, repeatDelay: 18, ease: 'linear' }}
    >
      <div className="flex items-center">
        <div
          className="h-px"
          style={{
            width: 200,
            background: 'linear-gradient(90deg, transparent, rgba(196,181,253,0.5), rgba(255,255,255,0.85))',
            boxShadow: '0 0 10px rgba(196,181,253,0.4)',
          }}
        />
        <div
          className="h-1 w-1 rounded-full bg-white"
          style={{ boxShadow: '0 0 12px rgba(255,255,255,0.7), 0 0 24px rgba(196,181,253,0.5)' }}
        />
      </div>
    </motion.div>
  );
}

function CornerGalaxy({
  x,
  y,
  size,
  delay = 0,
}: {
  x: string;
  y: string;
  size: number;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y, width: size, height: size, transform: 'translate(-50%, -50%)', opacity: 0.25 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 90, repeat: Infinity, ease: 'linear', delay }}
    >
      <svg viewBox="-50 -50 100 100" className="h-full w-full">
        {/* core */}
        <circle r="3" fill="#FFFFFF" opacity="0.6" />
        {/* spirals */}
        <ellipse rx="42" ry="6" fill="none" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.4" />
        <ellipse
          rx="36"
          ry="4"
          fill="none"
          stroke="#A78BFA"
          strokeWidth="0.5"
          opacity="0.4"
          transform="rotate(30)"
        />
        <ellipse
          rx="28"
          ry="3"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="0.5"
          opacity="0.5"
          transform="rotate(60)"
        />
        {/* outer dots */}
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * 38}
              cy={Math.sin(a) * 5}
              r="0.8"
              fill="#FFFFFF"
              opacity="0.6"
            />
          );
        })}
      </svg>
    </motion.div>
  );
}

function Planet({ planet }: { planet: PlanetData }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${planet.xPct}%`,
        top: `${planet.yPct}%`,
        width: planet.size,
        height: planet.size,
        transform: 'translate(-50%, -50%)',
        opacity: 0.16,
      }}
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 8 + planet.id, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="-2 -2 24 24" className="h-full w-full">
        <circle cx="10" cy="10" r="9" fill="none" stroke={planet.color} strokeWidth="0.6" />
        <circle cx="7" cy="8" r="0.8" fill={planet.color} opacity="0.6" />
        <circle cx="12" cy="11" r="0.5" fill={planet.color} opacity="0.5" />
        <circle cx="10" cy="13" r="0.6" fill={planet.color} opacity="0.5" />
        {planet.ring && (
          <ellipse
            cx="10"
            cy="10"
            rx="12"
            ry="2.5"
            fill="none"
            stroke={planet.color}
            strokeWidth="0.5"
            transform="rotate(-18 10 10)"
            opacity="0.7"
          />
        )}
      </svg>
    </motion.div>
  );
}

function ShootingStar({ delay, top, angle }: { delay: number; top: string; angle: number }) {
  return (
    <motion.div
      className="absolute -left-[20%]"
      style={{ top, transform: `rotate(${angle}deg)`, opacity: 0.5 }}
      animate={{ x: ['0vw', '140vw'] }}
      transition={{ duration: 3.5, delay, repeat: Infinity, repeatDelay: 12, ease: 'easeOut' }}
    >
      <div className="flex items-center">
        <div className="h-px w-[120px] bg-gradient-to-r from-transparent via-white/60 to-white" />
        <div
          className="h-1.5 w-1.5 rounded-full bg-white"
          style={{ boxShadow: '0 0 12px rgba(255,255,255,0.8)' }}
        />
      </div>
    </motion.div>
  );
}

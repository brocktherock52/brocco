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
    // ~140 tiny twinkling stars
    const sList: Dot[] = [];
    for (let i = 0; i < 140; i++) {
      sList.push({
        id: i,
        xPct: Math.random() * 100,
        yPct: Math.random() * 100,
        size: Math.random() * 2 + 1, // 1-3px
        dur: 2 + Math.random() * 4,
        delay: Math.random() * 4,
        color: Math.random() < 0.3 ? PURPLE[Math.floor(Math.random() * PURPLE.length)] : WHITE,
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
        // soft purple wash on top of the existing background
        background:
          'radial-gradient(ellipse at 20% 80%, rgba(167,139,250,0.04) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.03) 0%, transparent 55%)',
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
    </div>
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

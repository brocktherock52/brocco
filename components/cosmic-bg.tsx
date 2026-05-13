'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// CosmicBg — site-wide cartoony space overlay.
//
// Renders fixed-position behind everything (pointer-events-none).
// Stars + shooting stars + planets + galaxies + sparkles in white + soft
// purple tones, all at low opacity so the content stays readable. Cute
// and brocco-flavored, never overpowering.

const PURPLE_TONES = ['#A78BFA', '#C4B5FD', '#DDD6FE'];
const ACCENT = '#FFFFFF';

interface Star {
  id: number;
  x: number;
  y: number;
  r: number;
  dur: number;
  delay: number;
  color: string;
}

interface Planet {
  id: number;
  x: number;
  y: number;
  r: number;
  ring: boolean;
  color: string;
}

export function CosmicBg() {
  const [stars, setStars] = useState<Star[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);

  useEffect(() => {
    // Generate ~120 small twinkling stars sprinkled across the viewport
    const sList: Star[] = [];
    for (let i = 0; i < 120; i++) {
      sList.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 1.3 + 0.4,
        dur: 2.5 + Math.random() * 3,
        delay: Math.random() * 3,
        color: Math.random() < 0.3 ? PURPLE_TONES[Math.floor(Math.random() * PURPLE_TONES.length)] : ACCENT,
      });
    }
    setStars(sList);

    // 6 planets at fixed scattered positions
    const pList: Planet[] = [
      { id: 0, x: 8, y: 18, r: 18, ring: true, color: PURPLE_TONES[0] },
      { id: 1, x: 92, y: 32, r: 12, ring: false, color: ACCENT },
      { id: 2, x: 14, y: 70, r: 9, ring: false, color: PURPLE_TONES[2] },
      { id: 3, x: 88, y: 78, r: 22, ring: true, color: PURPLE_TONES[1] },
      { id: 4, x: 50, y: 8, r: 7, ring: false, color: ACCENT },
      { id: 5, x: 60, y: 92, r: 10, ring: false, color: PURPLE_TONES[0] },
    ];
    setPlanets(pList);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        // soft purple wash on top of the existing bg color
        background:
          'radial-gradient(ellipse at 20% 80%, rgba(167,139,250,0.05) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.04) 0%, transparent 55%)',
      }}
    >
      {/* SVG sky covers everything */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ opacity: 0.55 }}
      >
        {/* twinkling stars */}
        {stars.map((s) => (
          <Star key={s.id} s={s} />
        ))}

        {/* a few small galaxy swirls in the corners */}
        <Galaxy cx={6} cy={6} scale={1} delay={0} />
        <Galaxy cx={94} cy={50} scale={0.7} delay={2} />
        <Galaxy cx={50} cy={95} scale={0.8} delay={4} />
      </svg>

      {/* planets — separate SVG layer with non-stretched aspect */}
      <div className="absolute inset-0">
        {planets.map((p) => (
          <PlanetEl key={p.id} p={p} />
        ))}
      </div>

      {/* shooting stars — render 3 with staggered timing */}
      <ShootingStar delay={0} top="22%" angle={-12} />
      <ShootingStar delay={5} top="55%" angle={-8} />
      <ShootingStar delay={11} top="78%" angle={-15} />
    </div>
  );
}

function Star({ s }: { s: Star }) {
  return (
    <motion.circle
      cx={s.x}
      cy={s.y}
      r={s.r}
      fill={s.color}
      initial={{ opacity: 0.2 }}
      animate={{ opacity: [0.2, 0.9, 0.2] }}
      transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function Galaxy({ cx, cy, scale, delay }: { cx: number; cy: number; scale: number; delay: number }) {
  return (
    <motion.g
      transform={`translate(${cx} ${cy}) scale(${scale * 0.04})`}
      animate={{ rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: 'linear', delay }}
      style={{ originX: '0px', originY: '0px' } as React.CSSProperties}
    >
      <circle r="2" fill="#FFFFFF" opacity="0.5" />
      <ellipse rx="50" ry="6" fill="#FFFFFF" opacity="0.06" />
      <ellipse rx="40" ry="4" fill="#A78BFA" opacity="0.08" transform="rotate(30)" />
      <ellipse rx="30" ry="3" fill="#FFFFFF" opacity="0.1" transform="rotate(60)" />
      {Array.from({ length: 8 }).map((_, i) => (
        <circle
          key={i}
          cx={Math.cos((i / 8) * Math.PI * 2) * 35}
          cy={Math.sin((i / 8) * Math.PI * 2) * 4}
          r="1"
          fill="#FFFFFF"
          opacity="0.4"
        />
      ))}
    </motion.g>
  );
}

function PlanetEl({ p }: { p: Planet }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: p.r * 2,
        height: p.r * 2,
        transform: 'translate(-50%, -50%)',
        opacity: 0.18,
      }}
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 8 + p.id, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="-2 -2 24 24" className="h-full w-full">
        {/* planet body */}
        <circle cx="10" cy="10" r="9" fill="none" stroke={p.color} strokeWidth="0.6" />
        {/* surface pattern dots */}
        <circle cx="7" cy="8" r="0.8" fill={p.color} opacity="0.6" />
        <circle cx="12" cy="11" r="0.5" fill={p.color} opacity="0.5" />
        <circle cx="10" cy="13" r="0.6" fill={p.color} opacity="0.5" />
        {/* ring */}
        {p.ring && (
          <ellipse
            cx="10"
            cy="10"
            rx="12"
            ry="2.5"
            fill="none"
            stroke={p.color}
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
      style={{
        top,
        transform: `rotate(${angle}deg)`,
        opacity: 0.6,
      }}
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

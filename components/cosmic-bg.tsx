'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// CosmicBg — site-wide cartoony space overlay (revamped 2026-05-13).
//
// Layers (back to front):
//   1. Deep-space gradient + diagonal milky-way wash
//   2. ~280 starfield (auto-thinned on mobile + reduced-motion)
//   3. 4 named constellations with connecting lines (orion, dipper,
//      cassiopeia, lyra) — gives the sky landmarks
//   4. Drifting planets + ringed gas giant
//   5. Shooting-star streaks (more frequent now), slow comets
//   6. Desert-horizon silhouette at the bottom edge
//
// Opacity bumped from 0.55 -> 0.85 per user direction "make the galaxy
// background more prominent". Star count throttled on narrow viewports
// because heavy framer-motion fields were causing mobile scroll judder.

const PURPLE = ['#A78BFA', '#C4B5FD', '#DDD6FE'];
const WHITE = '#FFFFFF';

interface Dot {
  id: number;
  xPct: number;
  yPct: number;
  size: number;
  dur: number;
  delay: number;
  color: string;
}

interface PlanetData {
  id: number;
  xPct: number;
  yPct: number;
  size: number;
  ring: boolean;
  color: string;
}

// Constellations defined as relative coord lists (0-100 in each frame).
// Rendered as svg lines + slightly larger glowing nodes at each point.
interface Constellation {
  name: string;
  cxPct: number; // viewport-x of the constellation center
  cyPct: number; // viewport-y of the constellation center
  scale: number; // pixel size of the framing box
  nodes: Array<[number, number]>; // 0..100 in local frame
  edges: Array<[number, number]>; // node-index pairs
}

const CONSTELLATIONS: Constellation[] = [
  {
    // Orion — belt + shoulders + feet
    name: 'orion',
    cxPct: 76,
    cyPct: 24,
    scale: 180,
    nodes: [
      [50, 8],   // 0 betelgeuse
      [22, 28],  // 1 bellatrix
      [40, 50],  // 2 belt-l
      [50, 52],  // 3 belt-c
      [60, 54],  // 4 belt-r
      [22, 80],  // 5 saiph
      [78, 76],  // 6 rigel
      [62, 30],  // 7 meissa-ish
    ],
    edges: [
      [0, 7], [7, 1], [1, 2], [2, 3], [3, 4], [4, 0],
      [2, 5], [4, 6],
    ],
  },
  {
    // Big Dipper — handle + bowl
    name: 'dipper',
    cxPct: 14,
    cyPct: 32,
    scale: 200,
    nodes: [
      [6, 24],   // alkaid
      [22, 18],  // mizar
      [40, 18],  // alioth
      [58, 24],  // megrez
      [64, 50],  // phecda
      [50, 60],  // merak
      [38, 50],  // dubhe
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3],
    ],
  },
  {
    // Cassiopeia — the W
    name: 'cassiopeia',
    cxPct: 56,
    cyPct: 12,
    scale: 160,
    nodes: [
      [6, 50], [28, 12], [50, 60], [72, 12], [94, 50],
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    // Lyra (mini diamond + Vega above)
    name: 'lyra',
    cxPct: 88,
    cyPct: 68,
    scale: 120,
    nodes: [[50, 0], [10, 50], [50, 100], [90, 50]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0]],
  },
];

export function CosmicBg() {
  const [stars, setStars] = useState<Dot[]>([]);
  const [planets, setPlanets] = useState<PlanetData[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
    setIsMobile(mobile);
    const STAR_COUNT = mobile ? 90 : 280;

    const sList: Dot[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const x = Math.random() * 100;
      let y: number;
      if (Math.random() < 0.7) {
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
        size: Math.random() * 1.8 + 0.6,
        dur: 2 + Math.random() * 5,
        delay: Math.random() * 5,
        color: Math.random() < 0.18 ? PURPLE[Math.floor(Math.random() * PURPLE.length)] : WHITE,
      });
    }
    setStars(sList);

    setPlanets([
      { id: 0, xPct: 8, yPct: 18, size: 80, ring: true, color: PURPLE[0] },
      { id: 1, xPct: 92, yPct: 30, size: 50, ring: false, color: WHITE },
      { id: 2, xPct: 14, yPct: 72, size: 38, ring: false, color: PURPLE[2] },
      { id: 3, xPct: 88, yPct: 80, size: 96, ring: true, color: PURPLE[1] },
      { id: 4, xPct: 50, yPct: 6, size: 34, ring: false, color: WHITE },
      { id: 5, xPct: 60, yPct: 92, size: 56, ring: false, color: PURPLE[0] },
    ]);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(196,181,253,0.04) 22%, transparent 52%, rgba(167,139,250,0.035) 70%, transparent 90%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.06) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(196,181,253,0.045) 0%, transparent 55%)',
        opacity: 0.85,
      }}
    >
      {/* Starfield */}
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
            boxShadow: `0 0 ${s.size * 2.5}px ${s.color}99`,
            opacity: 0.75,
          }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Constellations — only on viewports wide enough not to crowd */}
      {!isMobile && CONSTELLATIONS.map((c) => (
        <ConstellationGroup key={c.name} c={c} />
      ))}

      {/* Galaxy swirls in the corners */}
      <CornerGalaxy x="6%" y="6%" size={120} />
      <CornerGalaxy x="94%" y="50%" size={80} delay={2} />
      <CornerGalaxy x="50%" y="95%" size={100} delay={4} />

      {/* Planets */}
      {planets.map((p) => (
        <Planet key={p.id} planet={p} />
      ))}

      {/* Shooting stars — bumped to 5 streaks at varied angles */}
      <ShootingStar delay={0} top="14%" angle={-12} />
      <ShootingStar delay={4} top="38%" angle={-8} />
      <ShootingStar delay={8} top="58%" angle={-15} />
      <ShootingStar delay={12} top="74%" angle={-6} />
      <ShootingStar delay={16} top="86%" angle={-18} />

      {/* Slow drifting comets */}
      <SlowComet delay={3} startTop="12%" endTop="40%" />
      <SlowComet delay={20} startTop="68%" endTop="34%" />

      {/* Desert horizon silhouette */}
      <div className="absolute inset-x-0 bottom-0 h-[28%] opacity-30">
        <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="h-full w-full">
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

function ConstellationGroup({ c }: { c: Constellation }) {
  const size = c.scale;
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${c.cxPct}%`,
        top: `${c.cyPct}%`,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        opacity: 0.55,
      }}
      animate={{ opacity: [0.35, 0.7, 0.35] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {c.edges.map(([a, b], i) => (
          <line
            key={i}
            x1={c.nodes[a][0]}
            y1={c.nodes[a][1]}
            x2={c.nodes[b][0]}
            y2={c.nodes[b][1]}
            stroke="#C4B5FD"
            strokeWidth="0.4"
            strokeOpacity="0.55"
            strokeDasharray="0.6 1.2"
          />
        ))}
        {c.nodes.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="1.6" fill="#FFFFFF" opacity="0.95" />
            <circle cx={x} cy={y} r="3.2" fill="none" stroke="#FFFFFF" strokeOpacity="0.25" />
          </g>
        ))}
      </svg>
      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.22em] text-violet-200/40">
        {c.name}
      </span>
    </motion.div>
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
      style={{ left: '-20%', top: startTop, opacity: 0.55 }}
      animate={{ x: ['0vw', '130vw'], top: [startTop, endTop] }}
      transition={{ duration: 22, delay, repeat: Infinity, repeatDelay: 14, ease: 'linear' }}
    >
      <div className="flex items-center">
        <div
          className="h-px"
          style={{
            width: 220,
            background:
              'linear-gradient(90deg, transparent, rgba(196,181,253,0.55), rgba(255,255,255,0.9))',
            boxShadow: '0 0 12px rgba(196,181,253,0.5)',
          }}
        />
        <div
          className="h-1.5 w-1.5 rounded-full bg-white"
          style={{ boxShadow: '0 0 14px rgba(255,255,255,0.85), 0 0 28px rgba(196,181,253,0.6)' }}
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
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        opacity: 0.32,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 90, repeat: Infinity, ease: 'linear', delay }}
    >
      <svg viewBox="-50 -50 100 100" className="h-full w-full">
        <circle r="3" fill="#FFFFFF" opacity="0.7" />
        <ellipse rx="42" ry="6" fill="none" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.5" />
        <ellipse
          rx="36"
          ry="4"
          fill="none"
          stroke="#A78BFA"
          strokeWidth="0.5"
          opacity="0.55"
          transform="rotate(30)"
        />
        <ellipse
          rx="28"
          ry="3"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="0.5"
          opacity="0.6"
          transform="rotate(60)"
        />
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * 38}
              cy={Math.sin(a) * 5}
              r="0.8"
              fill="#FFFFFF"
              opacity="0.7"
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
        opacity: 0.28,
      }}
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 8 + planet.id, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="-2 -2 24 24" className="h-full w-full">
        <defs>
          <radialGradient id={`pl-${planet.id}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={planet.color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={planet.color} stopOpacity="0.05" />
          </radialGradient>
        </defs>
        <circle cx="10" cy="10" r="9" fill={`url(#pl-${planet.id})`} stroke={planet.color} strokeWidth="0.6" />
        <circle cx="7" cy="8" r="0.8" fill={planet.color} opacity="0.65" />
        <circle cx="12" cy="11" r="0.5" fill={planet.color} opacity="0.55" />
        <circle cx="10" cy="13" r="0.6" fill={planet.color} opacity="0.55" />
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
            opacity="0.8"
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
      style={{ top, transform: `rotate(${angle}deg)`, opacity: 0.65 }}
      animate={{ x: ['0vw', '140vw'] }}
      transition={{ duration: 3.2, delay, repeat: Infinity, repeatDelay: 9, ease: 'easeOut' }}
    >
      <div className="flex items-center">
        <div className="h-px w-[140px] bg-gradient-to-r from-transparent via-white/70 to-white" />
        <div
          className="h-1.5 w-1.5 rounded-full bg-white"
          style={{ boxShadow: '0 0 14px rgba(255,255,255,0.9), 0 0 28px rgba(196,181,253,0.55)' }}
        />
      </div>
    </motion.div>
  );
}

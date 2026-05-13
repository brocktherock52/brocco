'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// ConstructionCrew — animated dashboard overlay shown while runs are
// active. Small construction crocs walk back and forth along the pane
// edges carrying tools (wrenches, hammers, blueprints) — a visible
// ensemble that makes the team feel like it's literally building the
// work. Subtle, ambient, non-blocking.

interface CrewMember {
  id: string;
  slug: string;
  accent: string;
  y: number; // px from top of pane
  direction: 'lr' | 'rl';
  speed: number; // seconds per traversal
  delay: number;
}

const CREW: Array<{ slug: string; accent: string }> = [
  { slug: 'researcher', accent: '#67E8F9' },
  { slug: 'planner', accent: '#FB7185' },
  { slug: 'outreach', accent: '#FBBF24' },
  { slug: 'designer', accent: '#F472B6' },
  { slug: 'coder', accent: '#4ADE80' },
];

const TOOLS = ['🔧', '🔨', '📐', '✏️', '🪛', '📋', '⚙️', '🛠️'];

interface ConstructionCrewProps {
  /** Whether to render — only show while a run is active */
  active: boolean;
}

export function ConstructionCrew({ active }: ConstructionCrewProps) {
  const [members, setMembers] = useState<CrewMember[]>([]);

  useEffect(() => {
    if (!active) {
      setMembers([]);
      return;
    }
    // Spawn 3-4 crew members at random positions along the run pane
    const m: CrewMember[] = [];
    const count = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const c = CREW[Math.floor(Math.random() * CREW.length)];
      m.push({
        id: `crew-${i}-${Date.now()}`,
        slug: c.slug,
        accent: c.accent,
        y: 30 + Math.random() * 60,
        direction: i % 2 === 0 ? 'lr' : 'rl',
        speed: 10 + Math.random() * 4,
        delay: i * 1.2,
      });
    }
    setMembers(m);
  }, [active]);

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-xl"
    >
      <AnimatePresence>
        {members.map((m) => (
          <Crew key={m.id} member={m} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Crew({ member }: { member: CrewMember }) {
  const startX = member.direction === 'lr' ? -60 : 100;
  const endX = member.direction === 'lr' ? 100 : -60;
  const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
  return (
    <motion.div
      className="absolute"
      style={{ top: `${member.y}%` }}
      initial={{ x: `${startX}%`, opacity: 0 }}
      animate={{ x: `${endX}%`, opacity: [0, 0.6, 0.6, 0] }}
      transition={{
        duration: member.speed,
        delay: member.delay,
        repeat: Infinity,
        repeatDelay: 3,
        ease: 'linear',
      }}
    >
      <motion.div
        animate={{ y: [-1, 1, -1], rotate: member.direction === 'lr' ? [-2, 2, -2] : [2, -2, 2] }}
        transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center gap-1"
      >
        <div
          className="relative h-7 w-7 overflow-hidden rounded-md bg-black"
          style={{
            boxShadow: `inset 0 0 0 1px ${member.accent}55, 0 0 10px ${member.accent}22`,
            transform: member.direction === 'rl' ? 'scaleX(-1)' : 'none',
          }}
        >
          <Image
            src={`/assets/cast-v6/${member.slug}.png`}
            alt=""
            fill
            sizes="28px"
            className="object-cover"
          />
        </div>
        {/* the tool the crocodile is carrying */}
        <span
          className="text-[11px]"
          style={{
            transform: member.direction === 'rl' ? 'scaleX(-1)' : 'none',
            filter: `drop-shadow(0 0 4px ${member.accent}66)`,
          }}
        >
          {tool}
        </span>
      </motion.div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { CustomCroc } from '@/components/custom-croc';
import type { AccessoryId } from '@/components/custom-croc';

// MagicalPipe — agent-creation reveal animation. When the wizard saves a
// new agent, full-screen overlay shows a glowing pipe descending from
// the top of the screen and a new croc dropping out with sparkles, then
// settling into place. Used as a celebratory transition before the
// router pushes the user to /app.

interface MagicalPipeProps {
  accent: string;
  accessory: AccessoryId;
  label: string;
}

export function MagicalPipe({ accent, accessory, label }: MagicalPipeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl"
    >
      {/* radial purple glow behind */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(167,139,250,0.25), transparent 65%), radial-gradient(ellipse at 50% 65%, rgba(103,232,249,0.15), transparent 60%)',
        }}
      />

      {/* the pipe descending from the top */}
      <div className="relative flex h-[70vh] w-[280px] flex-col items-center">
        {/* pipe body */}
        <motion.div
          className="relative w-12 origin-top overflow-hidden rounded-b-3xl"
          initial={{ height: 0 }}
          animate={{ height: '38vh' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background:
              'linear-gradient(180deg, #C4B5FD 0%, #A78BFA 50%, #7C3AED 100%)',
            boxShadow: `0 0 32px ${accent}80, 0 0 64px ${accent}55`,
          }}
        >
          {/* inner pipe glow */}
          <div
            className="absolute inset-x-2 bottom-2 top-2 rounded-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent)',
            }}
          />
        </motion.div>

        {/* pipe nozzle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative -mt-1 h-4 w-16 rounded-full"
          style={{
            background: 'linear-gradient(180deg, #7C3AED, #4C1D95)',
            boxShadow: `0 0 24px ${accent}, inset 0 -2px 4px rgba(0,0,0,0.4)`,
          }}
        />

        {/* sparkle burst at nozzle */}
        <motion.div
          className="pointer-events-none absolute"
          style={{ top: '37.5vh' }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 2.5, 3] }}
          transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <span
              key={angle}
              className="absolute h-1.5 w-1.5 rounded-full bg-white"
              style={{
                left: 0,
                top: 0,
                transform: `rotate(${angle}deg) translateY(-50px)`,
                boxShadow: `0 0 10px ${accent}`,
              }}
            />
          ))}
        </motion.div>

        {/* the new croc dropping from the pipe */}
        <motion.div
          className="relative mt-4"
          initial={{ y: -150, opacity: 0, scale: 0.6 }}
          animate={{
            y: [-150, -8, 0, -3, 0],
            opacity: [0, 1, 1, 1, 1],
            scale: [0.6, 1.1, 1, 1.04, 1],
          }}
          transition={{
            delay: 0.9,
            duration: 1.4,
            times: [0, 0.55, 0.8, 0.92, 1],
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div
            className="relative h-44 w-44 overflow-hidden rounded-3xl bg-black"
            style={{
              boxShadow: `0 0 40px ${accent}77, inset 0 0 0 2px ${accent}55`,
            }}
          >
            <CustomCroc
              accent={accent}
              accessory={accessory}
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </motion.div>

        {/* label appears under the croc */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
            new specialist
          </p>
          <p className="mt-1 text-[20px] font-semibold tracking-tight text-white">{label}</p>
          <p className="mt-2 text-[12.5px] text-ink-dim">joined the team</p>
        </motion.div>
      </div>

      {/* falling glitter */}
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{
            background: i % 2 === 0 ? accent : '#FFFFFF',
            left: `${20 + Math.random() * 60}%`,
            top: '36vh',
            boxShadow: `0 0 6px ${accent}`,
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: [0, 200, 280] }}
          transition={{
            delay: 0.9 + Math.random() * 0.6,
            duration: 1.6 + Math.random() * 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </motion.div>
  );
}

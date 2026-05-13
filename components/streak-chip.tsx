'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { getStreak, type StreakState } from '@/lib/streak';

// StreakChip — small "🔥 7 day streak" chip rendered in the nav.
//
// Only renders when count >= 1 so brand-new visitors don't see an empty
// "0 day streak" stub. The chip reads localStorage on mount and re-reads
// when `brocco:streak-changed` fires (dispatched by recordStreakTouch).

export function StreakChip() {
  const [state, setState] = useState<StreakState | null>(null);

  useEffect(() => {
    setState(getStreak());
    const refresh = () => setState(getStreak());
    window.addEventListener('brocco:streak-changed', refresh);
    // Also refresh on visibility change so the chip is fresh after
    // the user comes back from another tab.
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('brocco:streak-changed', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  if (!state || state.count < 1) return null;

  // Color ramps up with longer streaks
  const intensity = Math.min(state.count / 30, 1);
  const tone = state.count >= 30 ? 'gold' : state.count >= 7 ? 'fuchsia' : 'amber';
  const palette =
    tone === 'gold'
      ? { glow: '#FBBF24', text: '#FDE68A', border: '#FBBF2455' }
      : tone === 'fuchsia'
        ? { glow: '#F472B6', text: '#FBCFE8', border: '#F472B655' }
        : { glow: '#F97316', text: '#FED7AA', border: '#F9731655' };

  return (
    <AnimatePresence>
      <motion.div
        key="streak"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        title={state.usedSkipThisWeek ? `${state.count}-day streak (skip used this week)` : `${state.count}-day streak`}
        className="hidden items-center gap-1.5 rounded-full border bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] backdrop-blur-md md:inline-flex"
        style={{ color: palette.text, borderColor: palette.border, boxShadow: `inset 0 0 0 1px ${palette.glow}15` }}
      >
        <motion.span
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${palette.glow}${Math.floor(intensity * 99) + 30})` }}
          className="inline-flex"
        >
          <Flame className="h-3 w-3" style={{ color: palette.glow }} />
        </motion.span>
        <span className="tabular-nums">{state.count}</span>
        <span className="text-ink-faint">day{state.count === 1 ? '' : 's'}</span>
      </motion.div>
    </AnimatePresence>
  );
}

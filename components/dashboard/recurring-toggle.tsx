'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { scheduleRecurring, type Cadence } from '@/lib/recurring';
import type { AgentName } from '@/lib/agents';

// RecurringToggle — appears next to every completed run.
// Promotes a one-shot into a recurring run with one click + a cadence
// selector. Persists via lib/recurring (localStorage today).

interface RecurringToggleProps {
  goal: string;
  agents: AgentName[];
}

const CADENCES: Array<{ id: Cadence; label: string }> = [
  { id: 'daily', label: 'every day' },
  { id: 'weekdays', label: 'weekdays' },
  { id: 'weekly', label: 'every week' },
  { id: 'monthly', label: 'every month' },
];

export function RecurringToggle({ goal, agents }: RecurringToggleProps) {
  const [open, setOpen] = useState(false);
  const [cadence, setCadence] = useState<Cadence>('daily');
  const [saved, setSaved] = useState(false);

  function save() {
    if (!goal.trim()) {
      toast.error('Nothing to schedule — the goal is empty.');
      return;
    }
    scheduleRecurring({ goal, agents, cadence });
    setSaved(true);
    toast.success(`Saved as ${cadence} recurring run`, {
      description: `Next fire: 06:00 your local time. Manage at /app/recurring.`,
    });
    setTimeout(() => setOpen(false), 800);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11.5px] text-ink-dim transition hover:border-white/[0.18] hover:text-white"
      >
        <CalendarClock className="h-3 w-3" />
        {saved ? 'saved' : 'set and forget'}
      </button>

      <AnimatePresence>
        {open && !saved && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-40 mt-1.5 w-[260px] overflow-hidden rounded-xl border border-white/[0.10] bg-bg-1/95 p-2 shadow-glow backdrop-blur-xl"
          >
            <p className="px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              run this on a schedule
            </p>
            <div className="mt-1 space-y-1">
              {CADENCES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCadence(c.id)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12.5px] transition ${
                    cadence === c.id
                      ? 'bg-white/[0.06] text-white'
                      : 'text-ink-dim hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {c.label}
                  {cadence === c.id && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={save}
              className="mt-2 w-full rounded-md bg-gradient-to-r from-brand to-cyan px-2 py-2 text-[12.5px] font-semibold text-white"
            >
              schedule
            </button>
            <p className="mt-1.5 px-2 text-[10.5px] leading-snug text-ink-faint">
              fires at 06:00 your local time. nothing sends overnight without
              your nod.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

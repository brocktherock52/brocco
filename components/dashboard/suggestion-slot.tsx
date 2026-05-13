'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lightbulb, X } from 'lucide-react';
import {
  pickSuggestion,
  snoozeSuggestion,
  dismissSuggestion,
  type Suggestion,
} from '@/lib/suggestions';
import type { AgentName } from '@/lib/agents';

// SuggestionSlot — top-of-dashboard slot that surfaces 0-1 proactive nudge
// at a time. Reads from `pickSuggestion()` which is purely localStorage-
// driven for now. The slot is intentionally calm: one row, two actions
// (accept, snooze/dismiss). It disappears entirely when there's nothing
// to suggest.

interface SuggestionSlotProps {
  onAccept?: (goal: string | undefined, agents: AgentName[] | undefined) => void;
}

export function SuggestionSlot({ onAccept }: SuggestionSlotProps) {
  const [s, setS] = useState<Suggestion | null>(null);

  useEffect(() => {
    setS(pickSuggestion());
    const refresh = () => setS(pickSuggestion());
    window.addEventListener('brocco:suggestions-changed', refresh);
    return () => window.removeEventListener('brocco:suggestions-changed', refresh);
  }, []);

  function accept(sug: Suggestion) {
    onAccept?.(sug.accept.goal, sug.accept.agents);
    // Treat acceptance as a long snooze — we don't want to re-prompt the
    // same pattern for a while
    snoozeSuggestion(sug.id, 14);
    setS(pickSuggestion());
  }

  function snooze(sug: Suggestion) {
    snoozeSuggestion(sug.id, 7);
    setS(pickSuggestion());
  }

  function dismiss(sug: Suggestion) {
    dismissSuggestion(sug.id);
    setS(pickSuggestion());
  }

  return (
    <AnimatePresence>
      {s && (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden px-3 pt-3"
        >
          <div className="relative overflow-hidden rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-400/[0.05] via-amber-400/[0.03] to-transparent p-3">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-amber-400/15 blur-3xl"
            />
            <div className="relative flex items-start gap-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 ring-1 ring-amber-400/40">
                <Lightbulb className="h-4 w-4 text-amber-300" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-amber-300/80">
                  brocco noticed
                </p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink">{s.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => accept(s)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/15 px-2.5 py-1 text-[12px] font-medium text-amber-200 ring-1 ring-amber-400/40 transition hover:bg-amber-400/25"
                  >
                    {s.accept.label}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => snooze(s)}
                    className="text-[11.5px] text-ink-faint transition hover:text-ink-dim"
                  >
                    snooze 7 days
                  </button>
                  <button
                    onClick={() => dismiss(s)}
                    className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-ink-faint transition hover:text-ink-dim"
                    aria-label="dismiss suggestion"
                  >
                    <X className="h-3 w-3" />
                    dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

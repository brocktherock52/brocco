'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CalendarClock, Pause, Play, Trash2 } from 'lucide-react';
import {
  getRecurringRuns,
  toggleRecurring,
  deleteRecurring,
  type RecurringRun,
} from '@/lib/recurring';

// RecurringList — /app/recurring screen. Lists every recurring run, lets
// the user pause/resume or delete. localStorage source; mirrors to
// server once auth + KV ship.

export function RecurringList() {
  const [items, setItems] = useState<RecurringRun[]>([]);

  useEffect(() => {
    setItems(getRecurringRuns());
    const refresh = () => setItems(getRecurringRuns());
    window.addEventListener('brocco:recurring-changed', refresh);
    return () => window.removeEventListener('brocco:recurring-changed', refresh);
  }, []);

  function onToggle(id: string) {
    toggleRecurring(id);
    setItems(getRecurringRuns());
  }
  function onDelete(id: string) {
    if (confirm('Delete this recurring run? This cannot be undone.')) {
      deleteRecurring(id);
      setItems(getRecurringRuns());
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-dim hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          back to dashboard
        </Link>
        <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          <CalendarClock className="mr-1 inline h-3 w-3" />
          recurring runs
        </p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight lowercase">
          <span className="text-grad">set and forget.</span>{' '}
          <span className="font-serif italic font-normal text-grad-brand">your team handles the rest.</span>
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-dim">
          every job runs at 06:00 your local time. nothing sends overnight
          without your nod — drafts queue up for the morning briefing.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.02] p-12 text-center">
          <p className="text-[14px] leading-relaxed text-ink-dim">
            no recurring runs yet. finish a run on{' '}
            <Link className="underline-offset-4 hover:underline" href="/app">/app</Link>{' '}
            and click <em>set and forget</em>.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence>
            {items.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-xl border p-4 transition-colors ${
                  r.enabled
                    ? 'border-white/[0.08] bg-bg-1/60 hover:border-white/[0.14]'
                    : 'border-white/[0.04] bg-bg-1/30 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[14px] leading-relaxed text-ink">
                      {r.goal}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                      <span>{r.cadence}</span>
                      <span>·</span>
                      <span>{r.agents.join(', ')}</span>
                      <span>·</span>
                      <span>next: {formatTs(r.nextRun)}</span>
                      {r.lastRun && (
                        <>
                          <span>·</span>
                          <span>last: {formatTs(r.lastRun)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggle(r.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11.5px] text-ink-dim transition hover:border-white/[0.18] hover:text-white"
                    >
                      {r.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      {r.enabled ? 'pause' : 'resume'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      className="rounded-md p-1.5 text-ink-faint transition hover:text-red-300"
                      aria-label="delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function formatTs(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

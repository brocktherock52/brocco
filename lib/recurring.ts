// Recurring-run schema. Stored in localStorage today; mirror to server
// once we have auth + KV. The dashboard surfaces a "set and forget"
// toggle next to every completed pane that creates a new entry, and
// /app/recurring lists them.

import type { AgentName } from '@/lib/agents';

export type Cadence = 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface RecurringRun {
  id: string;
  goal: string;
  agents: AgentName[];
  cadence: Cadence;
  /** ISO timestamp the next run should fire (server-side cron consumes this) */
  nextRun: number;
  /** ISO timestamp of the last completed run, or null if never */
  lastRun: number | null;
  enabled: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'brocco:recurring-runs';

function readAll(): RecurringRun[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecurringRun[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: RecurringRun[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('brocco:recurring-changed'));
  } catch {}
}

export function getRecurringRuns(): RecurringRun[] {
  return readAll();
}

/** Schedule a new recurring run. Returns the saved entry. */
export function scheduleRecurring(input: {
  goal: string;
  agents: AgentName[];
  cadence: Cadence;
}): RecurringRun {
  const now = Date.now();
  const entry: RecurringRun = {
    id: `rr-${now}-${Math.random().toString(36).slice(2, 8)}`,
    goal: input.goal,
    agents: input.agents,
    cadence: input.cadence,
    nextRun: computeNextRun(input.cadence, now),
    lastRun: null,
    enabled: true,
    createdAt: now,
  };
  writeAll([...readAll(), entry]);
  return entry;
}

export function toggleRecurring(id: string): RecurringRun | null {
  const all = readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], enabled: !all[idx].enabled };
  writeAll(all);
  return all[idx];
}

export function deleteRecurring(id: string): void {
  writeAll(readAll().filter((r) => r.id !== id));
}

/** Compute next-fire timestamp (UTC ms) from a cadence and a base. */
export function computeNextRun(cadence: Cadence, fromMs: number = Date.now()): number {
  const from = new Date(fromMs);
  // Default fire-time: 06:00 local. Adjust the date forward to satisfy
  // the cadence rule.
  const target = new Date(from);
  target.setHours(6, 0, 0, 0);
  if (target.getTime() <= fromMs) {
    target.setDate(target.getDate() + 1);
  }
  if (cadence === 'daily') return target.getTime();
  if (cadence === 'weekdays') {
    while (target.getDay() === 0 || target.getDay() === 6) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }
  if (cadence === 'weekly') {
    target.setDate(target.getDate() + 7);
    return target.getTime();
  }
  if (cadence === 'monthly') {
    target.setMonth(target.getMonth() + 1);
    return target.getTime();
  }
  return target.getTime();
}

/** Mark a recurring run as just-completed and compute its next fire. */
export function markRecurringRan(id: string): void {
  const all = readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const now = Date.now();
  all[idx] = {
    ...all[idx],
    lastRun: now,
    nextRun: computeNextRun(all[idx].cadence, now),
  };
  writeAll(all);
}

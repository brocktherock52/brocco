// Project freshness, the "watching out for you" retention hook Braeden asked
// for on the 2026-05-26 call: "have any of these agents perpetually... check in
// on the existing projects... say 'hey, there's been updates and changes that
// affect your project'... a notification, like in a yellow or red, and they
// clicked on it and it asks you to run again."
//
// We don't actually re-scrape the world here; we model how stale a saved
// project's findings are likely to be from its age, surface that as a
// yellow/red signal, and offer a one-click re-run. The information genuinely
// ages (markets, pricing, competitors move week to week), so age is an honest
// proxy until a server-side watcher lands.

export type Freshness = 'fresh' | 'aging' | 'stale';

// Days after which a project's research is "probably worth refreshing" (yellow)
// and "likely outdated" (red). Tuned to Braeden's "weekly or biweekly" framing.
const AGING_AFTER_DAYS = 5;
const STALE_AFTER_DAYS = 14;

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

// Refresh cadence: how often the watcher checks a project for new information.
// Matches Braeden's "every 72 hours, every five days, every week" framing.
export type Cadence = '72h' | '5d' | 'weekly';

export const DEFAULT_CADENCE_HOURS = 72;

export const CADENCE_OPTIONS: { value: Cadence; hours: number; label: string }[] = [
  { value: '72h', hours: 72, label: 'Every 72 hours' },
  { value: '5d', hours: 120, label: 'Every 5 days' },
  { value: 'weekly', hours: 168, label: 'Weekly' },
];

export function cadenceHoursFor(c: Cadence): number {
  return CADENCE_OPTIONS.find((o) => o.value === c)?.hours ?? DEFAULT_CADENCE_HOURS;
}

export function cadenceFromHours(hours: number): Cadence {
  return CADENCE_OPTIONS.find((o) => o.hours === hours)?.value ?? '72h';
}

export function cadenceLabel(hours: number): string {
  const opt = CADENCE_OPTIONS.find((o) => o.hours === hours);
  if (opt) return opt.label;
  const days = Math.round(hours / 24);
  return `Every ${days} day${days === 1 ? '' : 's'}`;
}

/**
 * True once enough time has elapsed since the last run for the watcher to
 * check the project again. This is the cadence gate the cron uses, distinct
 * from the visual fresh/aging/stale age heuristic.
 */
export function isRefreshDue(
  lastRunMs: number,
  cadenceHours: number = DEFAULT_CADENCE_HOURS,
  now: number = Date.now(),
): boolean {
  return now - lastRunMs >= cadenceHours * HOUR;
}

export function freshnessOf(lastRunMs: number, now: number = Date.now()): Freshness {
  const ageDays = (now - lastRunMs) / DAY;
  if (ageDays >= STALE_AFTER_DAYS) return 'stale';
  if (ageDays >= AGING_AFTER_DAYS) return 'aging';
  return 'fresh';
}

/** True for projects worth nudging the user about (yellow or red). */
export function needsRefresh(lastRunMs: number, now: number = Date.now()): boolean {
  return freshnessOf(lastRunMs, now) !== 'fresh';
}

export interface FreshnessMeta {
  state: Freshness;
  /** Short status label, e.g. "checked 9 days ago". */
  label: string;
  /** One-line nudge shown when aging/stale. */
  nudge: string;
  /** Tailwind text + dot colors for the badge. */
  dotClass: string;
  textClass: string;
}

function ago(ms: number, now: number): string {
  const d = Math.floor((now - ms) / DAY);
  if (d <= 0) return 'checked today';
  if (d === 1) return 'checked yesterday';
  if (d < 30) return `checked ${d} days ago`;
  const months = Math.floor(d / 30);
  return `checked ${months} month${months === 1 ? '' : 's'} ago`;
}

export function freshnessMeta(lastRunMs: number, now: number = Date.now()): FreshnessMeta {
  const state = freshnessOf(lastRunMs, now);
  const label = ago(lastRunMs, now);
  if (state === 'stale') {
    return {
      state,
      label,
      nudge: 'New information likely available. Your data may be outdated.',
      dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.7)]',
      textClass: 'text-rose-300',
    };
  }
  if (state === 'aging') {
    return {
      state,
      label,
      nudge: 'Worth a refresh. The world may have moved since this run.',
      dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]',
      textClass: 'text-amber-300',
    };
  }
  return {
    state,
    label,
    nudge: 'Up to date.',
    dotClass: 'bg-emerald-400',
    textClass: 'text-emerald-300/90',
  };
}

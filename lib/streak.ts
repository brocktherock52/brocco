// Daily-streak logic for the brocco habit loop.
//
// A "streak day" ticks when the user opens /app and the dashboard runs
// `recordStreakTouch()`. The count survives across days if they touch
// every day, or every-other day if they have an unused weekly skip.
//
// Storage is localStorage-only for now (no auth yet). Once auth lands,
// mirror to the server so the streak is portable across devices — but
// keep the local cache as the fast path so the chip renders without a
// network round-trip.

const KEY = 'brocco:streak';

export interface StreakState {
  count: number;
  lastDay: string; // YYYY-MM-DD in user-local time
  weekStart: string; // ISO date of the Monday of the current streak week
  usedSkipThisWeek: boolean;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function mondayOfWeek(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const diff = (day + 6) % 7; // days since last Monday
  d.setDate(d.getDate() - diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export function getStreak(): StreakState {
  if (typeof window === 'undefined') {
    return { count: 0, lastDay: '', weekStart: mondayOfWeek(), usedSkipThisWeek: false };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return { count: 0, lastDay: '', weekStart: mondayOfWeek(), usedSkipThisWeek: false };
    }
    const parsed = JSON.parse(raw) as StreakState;
    // Reset usedSkipThisWeek if we're in a new week
    const thisWeek = mondayOfWeek();
    if (parsed.weekStart !== thisWeek) {
      parsed.weekStart = thisWeek;
      parsed.usedSkipThisWeek = false;
    }
    return parsed;
  } catch {
    return { count: 0, lastDay: '', weekStart: mondayOfWeek(), usedSkipThisWeek: false };
  }
}

export function recordStreakTouch(): StreakState {
  if (typeof window === 'undefined') {
    return { count: 0, lastDay: '', weekStart: mondayOfWeek(), usedSkipThisWeek: false };
  }
  const today = todayStr();
  const state = getStreak();

  if (state.lastDay === today) {
    // Already counted today
    return state;
  }

  if (!state.lastDay) {
    // First-ever touch
    state.count = 1;
    state.lastDay = today;
  } else {
    const gap = daysBetween(state.lastDay, today);
    if (gap === 1) {
      state.count += 1;
      state.lastDay = today;
    } else if (gap === 2 && !state.usedSkipThisWeek) {
      // Use the weekly skip
      state.count += 1;
      state.lastDay = today;
      state.usedSkipThisWeek = true;
    } else {
      // Streak broken
      state.count = 1;
      state.lastDay = today;
    }
  }

  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    // Fire a custom event so any chip listening can re-read state
    window.dispatchEvent(new CustomEvent('brocco:streak-changed'));
  } catch {}
  return state;
}

export function resetStreak(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent('brocco:streak-changed'));
  } catch {}
}

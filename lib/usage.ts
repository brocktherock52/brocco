// Lightweight free-tier rate limiting + usage tracking. localStorage only (private to user).

const KEY = 'brocco:usage';

export interface Usage {
  total_runs: number;
  month_runs: number;
  month_key: string; // YYYY-MM
  tokens_in: number;
  tokens_out: number;
  first_run_at: number | null;
  last_run_at: number | null;
}

const FREE_TIER_MONTHLY = 100;

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getUsage(): Usage {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const u = JSON.parse(raw) as Usage;
    if (u.month_key !== monthKey()) {
      u.month_runs = 0;
      u.month_key = monthKey();
    }
    return u;
  } catch {
    return empty();
  }
}

export function recordRun(tokens: { in: number; out: number } = { in: 0, out: 0 }): Usage {
  const u = getUsage();
  u.total_runs += 1;
  u.month_runs += 1;
  u.tokens_in += tokens.in;
  u.tokens_out += tokens.out;
  u.last_run_at = Date.now();
  if (!u.first_run_at) u.first_run_at = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(u));
  } catch {}
  return u;
}

export function remainingFreeRuns(u: Usage): number {
  return Math.max(0, FREE_TIER_MONTHLY - u.month_runs);
}

export function freeTierExceeded(u: Usage): boolean {
  return u.month_runs >= FREE_TIER_MONTHLY;
}

function empty(): Usage {
  return {
    total_runs: 0,
    month_runs: 0,
    month_key: monthKey(),
    tokens_in: 0,
    tokens_out: 0,
    first_run_at: null,
    last_run_at: null,
  };
}

export const FREE_LIMIT = FREE_TIER_MONTHLY;

// Demo seeding for the auto-refresh / "watching out for you" feature.
//
// Brock needs to demo the full notification -> refresh -> what's-new -> brain
// flow LIVE without logging in and without a paid plan. This seeds one sample
// saved project with an OLD last-run timestamp so it lands in the yellow/red
// "we found updates" state immediately, plus a starter brain (iteration 1) and
// a pending refresh_due alert in the bell. Everything is localStorage-only and
// idempotent, so it is safe to call on every dashboard mount.

import type { AgentName } from '@/lib/agents';
import { addLocalAlert } from '@/lib/threads-client';

const SEED_FLAG = 'brocco:demo-seeded:v1';
const HISTORY_KEY = 'brocco:history';
const BRAIN_PREFIX = 'brocco:brain:';

// stable id so re-seeds don't duplicate and the brain/alert line up
export const DEMO_PROJECT_ID = 'local-demo-watch-1';

const DAY = 24 * 60 * 60 * 1000;

interface HistoryEntry {
  id: string;
  goal: string;
  agents: AgentName[];
  ts: number;
}

export function seedDemoProjectIfNeeded(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(SEED_FLAG)) return false;

    const goal =
      'Track the top 5 AI agent platforms: positioning, pricing, and launches. Brief me weekly.';
    const agents: AgentName[] = ['researcher', 'analyst', 'planner'];
    // 9 days old: past the 5-day aging and well past a 72h cadence, so it shows
    // amber/red and reads as "due for refresh" the moment the call starts.
    const ts = Date.now() - 9 * DAY;

    // 1. saved project in the history drawer
    const rawHist = localStorage.getItem(HISTORY_KEY);
    const hist: HistoryEntry[] = rawHist ? JSON.parse(rawHist) : [];
    if (!hist.some((h) => h.id === DEMO_PROJECT_ID)) {
      hist.unshift({ id: DEMO_PROJECT_ID, goal, agents, ts });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 25)));
    }

    // 2. starter brain (iteration 1) so "what this project has learned" is not
    //    empty and the next refresh visibly builds on it
    const brainKey = BRAIN_PREFIX + DEMO_PROJECT_ID;
    if (!localStorage.getItem(brainKey)) {
      localStorage.setItem(
        brainKey,
        JSON.stringify([
          {
            iteration: 1,
            did: 'First pass: mapped 5 platforms (Brocco, Devin, Cursor, Linear, Lindy) with pricing and positioning.',
            learned:
              'Consensus baseline 9 days ago: usage-based pricing dominant, parallel multi-agent execution the key differentiator.',
            changed: 'Initial baseline. Future refreshes show what changed.',
            createdAt: new Date(ts).toISOString(),
          },
        ]),
      );
    }

    // 3. a pending refresh_due alert so the bell shows a badge on load
    addLocalAlert({
      threadId: DEMO_PROJECT_ID,
      kind: 'refresh_due',
      summary:
        'New information may be available for "Track the top 5 AI agent platforms". Refresh to pull the latest and see what changed.',
      threadTitle: 'Track the top 5 AI agent platforms',
    });

    localStorage.setItem(SEED_FLAG, '1');
    window.dispatchEvent(new CustomEvent('brocco:history-changed'));
    return true;
  } catch {
    return false;
  }
}

/** Reset the demo so Brock can re-run the whole flow on a fresh state. */
export function resetDemoSeed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SEED_FLAG);
    localStorage.removeItem(BRAIN_PREFIX + DEMO_PROJECT_ID);
    // drop the demo project + its alerts
    const rawHist = localStorage.getItem(HISTORY_KEY);
    if (rawHist) {
      const hist: HistoryEntry[] = JSON.parse(rawHist);
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(hist.filter((h) => h.id !== DEMO_PROJECT_ID)),
      );
    }
    const rawAlerts = localStorage.getItem('brocco:alerts:v1');
    if (rawAlerts) {
      const alerts = JSON.parse(rawAlerts) as { threadId: string }[];
      localStorage.setItem(
        'brocco:alerts:v1',
        JSON.stringify(alerts.filter((a) => a.threadId !== DEMO_PROJECT_ID)),
      );
    }
  } catch {
    /* ignore */
  }
}

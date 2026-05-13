// Proactive-suggestion engine.
//
// Looks at the user's localStorage history and emits at most one suggestion
// at a time, with a snooze/dismiss state so the slot stays calm. Detector
// runs synchronously in the browser — it is intentionally cheap so it can
// fire on every dashboard mount.
//
// Pattern catalog (extend over time):
//   1. recurring-candidate: same agent + similar goal run >= 3 times in the
//      last 14 days → suggest converting it to a recurring run
//   2. broadcast-drought: history exists but no run in last 36h → "your team
//      misses you" with a one-click rerun of the most recent goal
//   3. agent-bias: one agent run >7x while another <2x → suggest balancing
//      the team by adding the underused agent
//
// The detector is data-only: no UI, no toast, no event. The component reads
// `pickSuggestion()` and decides what to show.

import type { AgentName } from '@/lib/agents';

export interface Suggestion {
  id: string; // stable key so snooze persists across re-detections
  kind: 'recurring' | 'drought' | 'bias';
  message: string;
  /** Accept action — what the user gets if they click the primary CTA */
  accept: {
    label: string;
    goal?: string;
    agents?: AgentName[];
  };
}

interface RunHistoryEntry {
  id: string;
  goal: string;
  agents: AgentName[];
  ts: number;
}

interface SuggestionState {
  // Map of suggestion id -> snoozed-until timestamp (ms)
  snoozedUntil: Record<string, number>;
  dismissed: string[];
}

const STATE_KEY = 'brocco:suggestion-state';

function getState(): SuggestionState {
  if (typeof window === 'undefined') return { snoozedUntil: {}, dismissed: [] };
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return { snoozedUntil: {}, dismissed: [] };
    return JSON.parse(raw) as SuggestionState;
  } catch {
    return { snoozedUntil: {}, dismissed: [] };
  }
}

function setState(s: SuggestionState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent('brocco:suggestions-changed'));
  } catch {}
}

function isLive(id: string, state: SuggestionState): boolean {
  if (state.dismissed.includes(id)) return false;
  const until = state.snoozedUntil[id];
  if (until && until > Date.now()) return false;
  return true;
}

function readHistory(): RunHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('brocco:history');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as RunHistoryEntry[];
    return [];
  } catch {
    return [];
  }
}

function normalize(goal: string): string {
  // very lightweight goal-similarity bucketing: lowercase, strip punctuation,
  // first 6 significant words. Good enough for "did you run this 3 times".
  return goal
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 6)
    .join(' ');
}

export function pickSuggestion(): Suggestion | null {
  const history = readHistory();
  const state = getState();

  if (history.length === 0) return null;

  // 1. RECURRING CANDIDATE — same normalized goal run 3+ times in 14d
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const buckets = new Map<string, { count: number; latest: RunHistoryEntry }>();
  for (const h of history) {
    if (h.ts < fourteenDaysAgo) continue;
    const key = normalize(h.goal);
    if (!key) continue;
    const b = buckets.get(key);
    if (b) {
      b.count += 1;
      if (h.ts > b.latest.ts) b.latest = h;
    } else {
      buckets.set(key, { count: 1, latest: h });
    }
  }
  for (const [key, b] of buckets) {
    if (b.count >= 3) {
      const id = `recurring:${key}`;
      if (!isLive(id, state)) continue;
      return {
        id,
        kind: 'recurring',
        message: `you've run this ${b.count} times in the last 14 days. want it on autopilot every morning?`,
        accept: {
          label: 'make it recurring',
          goal: b.latest.goal,
          agents: b.latest.agents,
        },
      };
    }
  }

  // 2. BROADCAST DROUGHT — most recent run > 36h ago
  const mostRecent = history.reduce((latest, h) => (h.ts > latest.ts ? h : latest), history[0]);
  const hoursSince = (Date.now() - mostRecent.ts) / (60 * 60 * 1000);
  if (hoursSince >= 36) {
    const id = `drought:${mostRecent.id}`;
    if (isLive(id, state)) {
      return {
        id,
        kind: 'drought',
        message: `your team hasn't worked in ${Math.round(hoursSince)} hours. rerun your last goal?`,
        accept: {
          label: 'rerun last goal',
          goal: mostRecent.goal,
          agents: mostRecent.agents,
        },
      };
    }
  }

  // 3. AGENT BIAS — one agent run >7x, another <2x in last 14d
  const counts = new Map<AgentName, number>();
  for (const h of history) {
    if (h.ts < fourteenDaysAgo) continue;
    for (const a of h.agents) counts.set(a, (counts.get(a) ?? 0) + 1);
  }
  let topAgent: AgentName | null = null;
  let topCount = 0;
  let underused: AgentName | null = null;
  const KNOWN: AgentName[] = ['supervisor', 'researcher', 'analyst', 'outreach', 'coder', 'browser', 'designer', 'planner'];
  for (const [agent, count] of counts) {
    if (count > topCount) {
      topAgent = agent;
      topCount = count;
    }
  }
  for (const agent of KNOWN) {
    if ((counts.get(agent) ?? 0) < 2) {
      underused = agent;
      break;
    }
  }
  if (topAgent && topCount >= 7 && underused) {
    const id = `bias:${topAgent}-vs-${underused}`;
    if (isLive(id, state)) {
      return {
        id,
        kind: 'bias',
        message: `you lean hard on ${topAgent} (${topCount} runs). next broadcast, try adding ${underused} for a different angle.`,
        accept: {
          label: `try ${underused}`,
          agents: [topAgent, underused],
        },
      };
    }
  }

  return null;
}

export function snoozeSuggestion(id: string, days: number = 7): void {
  const state = getState();
  state.snoozedUntil[id] = Date.now() + days * 24 * 60 * 60 * 1000;
  setState(state);
}

export function dismissSuggestion(id: string): void {
  const state = getState();
  if (!state.dismissed.includes(id)) state.dismissed.push(id);
  setState(state);
}

/**
 * Thin client for /api/threads and /api/threads/[id]/messages.
 *
 * Falls back to localStorage if the server returns 401 (anonymous user) so
 * the dashboard still works pre-login. Logged-in users get the server as
 * the source of truth, with localStorage as a write-through cache for
 * offline reads.
 */
'use client';

const LS_KEY = 'brocco:threads:v1';

export interface ClientThread {
  id: string;
  userId?: string;
  title: string;
  agents: string[];
  isPublic?: boolean;
  watchEnabled?: boolean;
  refreshCadenceHours?: number;
  lastCheckedAt?: string | null;
  lastRefreshedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientMessage {
  id: string;
  threadId: string;
  role: 'user' | 'agent' | 'system';
  agent: string | null;
  content: string;
  meta?: Record<string, unknown> | null;
  createdAt: string;
}

function readCache(): ClientThread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ClientThread[]) : [];
  } catch {
    return [];
  }
}

function writeCache(threads: ClientThread[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(threads.slice(0, 50)));
  } catch {
    // quota / private mode, ignore
  }
}

export async function listThreads(): Promise<{ threads: ClientThread[]; offline: boolean }> {
  try {
    const res = await fetch('/api/threads', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    if (res.status === 401) {
      return { threads: readCache(), offline: true };
    }
    if (!res.ok) throw new Error(`threads list failed: ${res.status}`);
    const body = (await res.json()) as { threads: ClientThread[] };
    writeCache(body.threads);
    return { threads: body.threads, offline: false };
  } catch {
    return { threads: readCache(), offline: true };
  }
}

export async function createThread(input: {
  title: string;
  agents: string[];
  isPublic?: boolean;
}): Promise<ClientThread | null> {
  try {
    const res = await fetch('/api/threads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
    if (res.status === 401) {
      // anonymous - stash locally only
      const local: ClientThread = {
        id: 'local-' + Math.random().toString(36).slice(2, 10),
        title: input.title,
        agents: input.agents,
        isPublic: input.isPublic ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      writeCache([local, ...readCache()]);
      return local;
    }
    if (!res.ok) return null;
    const body = (await res.json()) as { thread: ClientThread };
    writeCache([body.thread, ...readCache().filter((t) => t.id !== body.thread.id)]);
    return body.thread;
  } catch {
    return null;
  }
}

export async function listMessages(threadId: string): Promise<ClientMessage[]> {
  try {
    const res = await fetch(`/api/threads/${threadId}/messages`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { messages: ClientMessage[] };
    return body.messages;
  } catch {
    return [];
  }
}

export async function appendMessage(
  threadId: string,
  input: { role: 'user' | 'agent' | 'system'; agent?: string | null; content: string; meta?: Record<string, unknown> },
): Promise<ClientMessage | null> {
  try {
    const res = await fetch(`/api/threads/${threadId}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { message: ClientMessage };
    return body.message;
  } catch {
    return null;
  }
}

// --- watch settings ---------------------------------------------------------

export async function updateThreadWatch(
  threadId: string,
  patch: { watchEnabled?: boolean; refreshCadenceHours?: number },
): Promise<ClientThread | null> {
  try {
    const res = await fetch(`/api/threads/${threadId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(patch),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { thread: ClientThread };
    return body.thread;
  } catch {
    return null;
  }
}

// --- per-project brain ------------------------------------------------------

export interface BrainEntry {
  id?: string;
  iteration: number;
  did: string | null;
  learned: string | null;
  changed: string | null;
  createdAt?: string;
}

const BRAIN_LS_PREFIX = 'brocco:brain:';

function readBrainCache(threadId: string): BrainEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BRAIN_LS_PREFIX + threadId);
    return raw ? (JSON.parse(raw) as BrainEntry[]) : [];
  } catch {
    return [];
  }
}

function writeBrainCache(threadId: string, entries: BrainEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BRAIN_LS_PREFIX + threadId, JSON.stringify(entries.slice(-20)));
  } catch {
    /* quota / private mode */
  }
}

/** Read the accumulated brain for a project. Server first, localStorage fallback. */
export async function getBrain(threadId: string): Promise<BrainEntry[]> {
  try {
    const res = await fetch(`/api/threads/${threadId}/memory`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    if (res.ok) {
      const body = (await res.json()) as { memory: BrainEntry[] };
      writeBrainCache(threadId, body.memory);
      return body.memory;
    }
  } catch {
    /* fall through to cache */
  }
  return readBrainCache(threadId);
}

/** Append one skill entry to the brain. Server first, localStorage fallback. */
export async function appendBrain(
  threadId: string,
  entry: { did?: string | null; learned?: string | null; changed?: string | null },
): Promise<BrainEntry | null> {
  // optimistic local write so demo mode (no auth/server) still accumulates
  const local = readBrainCache(threadId);
  const nextIteration = (local[local.length - 1]?.iteration ?? 0) + 1;
  const localEntry: BrainEntry = {
    iteration: nextIteration,
    did: entry.did ?? null,
    learned: entry.learned ?? null,
    changed: entry.changed ?? null,
    createdAt: new Date().toISOString(),
  };
  try {
    const res = await fetch(`/api/threads/${threadId}/memory`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      const body = (await res.json()) as { memory: BrainEntry };
      writeBrainCache(threadId, [...local, body.memory]);
      return body.memory;
    }
  } catch {
    /* fall through */
  }
  writeBrainCache(threadId, [...local, localEntry]);
  return localEntry;
}

/** Record a completed refresh: resets cadence clock + files a changes_found alert. */
export async function recordRefresh(
  threadId: string,
  input: { summary: string | null; changed: boolean; threadTitle?: string },
): Promise<boolean> {
  try {
    const res = await fetch(`/api/threads/${threadId}/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
    if (res.ok) return true;
  } catch {
    /* fall through to local */
  }
  // Demo / offline: file a local changes_found alert so the bell still lights up
  // without auth or a paid plan. This is what powers the no-login demo.
  if (input.changed && input.summary) {
    addLocalAlert({
      threadId,
      kind: 'changes_found',
      summary: input.summary,
      threadTitle: input.threadTitle ?? null,
    });
  }
  // also clear any local refresh_due alert for this project
  markLocalRefreshDueRead(threadId);
  return false;
}

// --- alerts -----------------------------------------------------------------

export interface ClientAlert {
  id: string;
  threadId: string;
  kind: string;
  summary: string | null;
  status: string;
  createdAt: string;
  threadTitle?: string | null;
}

const ALERTS_LS_KEY = 'brocco:alerts:v1';

function readLocalAlerts(): ClientAlert[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ALERTS_LS_KEY);
    return raw ? (JSON.parse(raw) as ClientAlert[]) : [];
  } catch {
    return [];
  }
}

function writeLocalAlerts(alerts: ClientAlert[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ALERTS_LS_KEY, JSON.stringify(alerts.slice(0, 50)));
    window.dispatchEvent(new CustomEvent('brocco:alerts-changed'));
  } catch {
    /* quota */
  }
}

export function addLocalAlert(input: {
  threadId: string;
  kind: string;
  summary: string | null;
  threadTitle?: string | null;
}) {
  const all = readLocalAlerts();
  // idempotency for refresh_due: skip if an unread one already exists
  if (
    input.kind === 'refresh_due' &&
    all.some((a) => a.threadId === input.threadId && a.kind === 'refresh_due' && a.status === 'unread')
  ) {
    return;
  }
  const entry: ClientAlert = {
    id: `local-alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    threadId: input.threadId,
    kind: input.kind,
    summary: input.summary,
    status: 'unread',
    createdAt: new Date().toISOString(),
    threadTitle: input.threadTitle ?? null,
  };
  writeLocalAlerts([entry, ...all]);
}

function markLocalRefreshDueRead(threadId: string) {
  const all = readLocalAlerts();
  let touched = false;
  const next = all.map((a) => {
    if (a.threadId === threadId && a.kind === 'refresh_due' && a.status === 'unread') {
      touched = true;
      return { ...a, status: 'read' };
    }
    return a;
  });
  if (touched) writeLocalAlerts(next);
}

export async function listAlerts(unreadOnly = false): Promise<{ alerts: ClientAlert[]; unreadCount: number }> {
  let server: ClientAlert[] = [];
  try {
    const res = await fetch(`/api/alerts${unreadOnly ? '?status=unread' : ''}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    if (res.ok) {
      const body = (await res.json()) as { alerts: ClientAlert[] };
      server = body.alerts ?? [];
    }
  } catch {
    /* offline: local only */
  }
  // Merge local (demo) alerts in. De-dupe by id, server wins.
  const local = readLocalAlerts().filter((a) => (unreadOnly ? a.status === 'unread' : true));
  const seen = new Set(server.map((a) => a.id));
  const merged = [...server, ...local.filter((a) => !seen.has(a.id))];
  merged.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'unread' ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const unreadCount = merged.filter((a) => a.status === 'unread').length;
  return { alerts: merged, unreadCount };
}

export async function markAlertRead(id: string): Promise<boolean> {
  if (id.startsWith('local-alert-')) {
    const all = readLocalAlerts();
    writeLocalAlerts(all.map((a) => (a.id === id ? { ...a, status: 'read' } : a)));
    return true;
  }
  try {
    const res = await fetch(`/api/alerts/${id}/read`, { method: 'POST', credentials: 'include' });
    return res.ok;
  } catch {
    return false;
  }
}

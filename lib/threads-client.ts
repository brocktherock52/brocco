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
    // quota / private mode — ignore
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

/**
 * Unit tests for /api/threads.
 *
 * The route reaches into better-auth + Drizzle; we mock both at the
 * module boundary so the test verifies the handler's contract without
 * needing a live database.
 *
 * Covered:
 *   - GET 401 when there is no session
 *   - POST 401 when there is no session
 *   - POST 400 on missing title
 *   - POST 400 on missing agents
 *   - POST 201 happy path (returns inserted row)
 *   - GET 200 returns the user's threads
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getSessionMock = vi.fn();
const dbSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
};
const dbInsertChain = {
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([
    {
      id: '11111111-1111-1111-1111-111111111111',
      userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      title: 'test thread',
      agents: ['researcher'],
      isPublic: false,
      createdAt: new Date('2026-05-13T00:00:00Z'),
      updatedAt: new Date('2026-05-13T00:00:00Z'),
    },
  ]),
};

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: (args: unknown) => getSessionMock(args),
    },
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: () => dbSelectChain,
    insert: () => dbInsertChain,
  },
}));

vi.mock('@/lib/db/schema', () => ({
  threads: { id: 'id', userId: 'userId', updatedAt: 'updatedAt' },
  messages: {},
  users: {},
  sessions: {},
  accounts: {},
  verifications: {},
}));

import { GET, POST } from '@/app/api/threads/route';

function makeReq(body?: unknown): Request {
  return new Request('https://example.com/api/threads', {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(() => {
  getSessionMock.mockReset();
  dbInsertChain.values.mockClear();
  dbSelectChain.limit.mockResolvedValue([]);
});

describe('GET /api/threads', () => {
  it('401 when no session', async () => {
    getSessionMock.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it('200 returns thread list when authed', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } });
    dbSelectChain.limit.mockResolvedValueOnce([
      { id: 't1', userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'one', agents: ['researcher'] },
    ]);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.threads)).toBe(true);
    expect(json.threads[0].title).toBe('one');
  });
});

describe('POST /api/threads', () => {
  it('401 when no session', async () => {
    getSessionMock.mockResolvedValue(null);
    const res = await POST(makeReq({ title: 'x', agents: ['researcher'] }) as never);
    expect(res.status).toBe(401);
  });

  it('400 on missing title', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } });
    const res = await POST(makeReq({ agents: ['researcher'] }) as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('title_required');
  });

  it('400 on empty agents array', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } });
    const res = await POST(makeReq({ title: 'x', agents: [] }) as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('agents_required');
  });

  it('201 inserts and returns the new thread', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } });
    const res = await POST(makeReq({ title: 'test thread', agents: ['researcher'] }) as never);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.thread.title).toBe('test thread');
    expect(body.thread.agents).toEqual(['researcher']);
    expect(dbInsertChain.values).toHaveBeenCalledWith({
      userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      title: 'test thread',
      agents: ['researcher'],
      isPublic: false,
    });
  });
});

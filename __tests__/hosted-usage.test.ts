import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db';
import { reserveHostedRun } from '@/lib/hosted-usage';

vi.mock('@/lib/db', () => ({ db: { execute: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());

describe('durable hosted allowance', () => {
  it('permits a run only after its atomic reservation succeeds', async () => {
    vi.mocked(db.execute).mockResolvedValue({ rows: [{ runs: 1 }], fields: [], command: 'INSERT', rowCount: 1, rowAsArray: false });
    expect(await reserveHostedRun('user-id', 'solo')).toBeNull();
    expect(db.execute).toHaveBeenCalledOnce();
  });
  it('blocks exhausted daily or monthly allowance', async () => {
    vi.mocked(db.execute).mockResolvedValue({ rows: [], fields: [], command: 'INSERT', rowCount: 0, rowAsArray: false });
    const response = await reserveHostedRun('user-id', 'team');
    expect(response?.status).toBe(429);
    expect((await response!.json()).error).toBe('hosted_limit_reached');
  });
  it('fails closed if migration or accounting storage is unavailable', async () => {
    vi.mocked(db.execute).mockRejectedValue(new Error('table missing'));
    expect((await reserveHostedRun('user-id', 'solo'))?.status).toBe(503);
  });
});

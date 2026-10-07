import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { runAgentLive, type RunLiveOpts } from '@/lib/run-live';
import { runClaudeLive } from '@/lib/claude';
import { fetchBillingAccess } from '@/lib/billing-client';
import { emptyBillingAccess } from '@/lib/billing-types';
import { AGENTS } from '@/lib/agents';

vi.mock('@/lib/claude', () => ({ runClaudeLive: vi.fn(async () => {}) }));
vi.mock('@/lib/xai', () => ({ runXaiLive: vi.fn(async () => {}) }));
vi.mock('@/lib/billing-client', () => ({ fetchBillingAccess: vi.fn() }));

const options = (): RunLiveOpts => ({ apiKey: '', modelId: 'claude-sonnet-4-6', agent: AGENTS[1], goal: 'Research the public market', emit: vi.fn(), signal: new AbortController().signal, systemPrompt: 'Research.' });
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchBillingAccess).mockResolvedValue({ ...emptyBillingAccess(true), canUseTools: true, hostedAvailable: true, status: 'active' });
});
afterEach(() => vi.unstubAllGlobals());

describe('paid provider dispatch', () => {
  it('prevents an API key from bypassing the subscription gate', async () => {
    vi.mocked(fetchBillingAccess).mockResolvedValue({ ...emptyBillingAccess(true), status: 'trialing' });
    await expect(runAgentLive({ ...options(), apiKey: 'user-owned-key' })).rejects.toThrow(/paid subscription/);
    expect(runClaudeLive).not.toHaveBeenCalled();
  });
  it('clearly requires a key when hosted execution is not configured', async () => {
    vi.mocked(fetchBillingAccess).mockResolvedValue({ ...emptyBillingAccess(true), canUseTools: true, hostedAvailable: false });
    await expect(runAgentLive(options())).rejects.toThrow(/Connect your own API key/);
  });
  it('streams real hosted output across fragmented SSE frames without duplicate final text', async () => {
    const frames = 'data: {"type":"text_delta","text":"Hello"}\n\ndata: {"type":"assistant_text","text":"Hello"}\n\ndata: {"type":"run_finished","status":"done"}\n\n';
    const body = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(frames.slice(0, 24))); controller.enqueue(new TextEncoder().encode(frames.slice(24))); controller.close(); } });
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => new Response(body));
    vi.stubGlobal('fetch', fetchMock);
    const opts = options();
    await runAgentLive(opts);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/run');
    expect(vi.mocked(opts.emit).mock.calls.filter(([event]) => event.type === 'text')).toEqual([[{ type: 'text', text: 'Hello' }]]);
    expect(opts.emit).toHaveBeenCalledWith({ type: 'done', summary: '' });
  });
  it('never silently ignores attachments in hosted mode', async () => {
    await expect(runAgentLive({ ...options(), attachments: [{ id: 'input-1', name: 'context.txt', mediaType: 'text/plain', size: 14, kind: 'text', text: 'required input' }] })).rejects.toThrow(/attachments/);
  });
  it('surfaces incomplete hosted output as an error instead of pretending success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('data: {"type":"text_delta","text":"Partial"}\n\n')));
    const opts = options();
    await expect(runAgentLive(opts)).rejects.toThrow(/before the run completed/);
    expect(opts.emit).not.toHaveBeenCalledWith({ type: 'done', summary: '' });
  });
});

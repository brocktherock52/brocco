import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '@/lib/auth';
import { getBillingAccess } from '@/lib/billing';
import { emptyBillingAccess } from '@/lib/billing-types';
import { requireToolAccess } from '@/lib/billing-access';

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/lib/billing', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/billing')>();
  return { ...real, getBillingAccess: vi.fn() };
});
const request = new Request('https://brocco.dev/api/v1/run', { method: 'POST' });
beforeEach(() => { vi.clearAllMocks(); });

describe('paid execution guard', () => {
  it('rejects anonymous tool calls without querying Stripe', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    expect((await requireToolAccess(request))?.status).toBe(401);
    expect(getBillingAccess).not.toHaveBeenCalled();
  });
  it('rejects a trial even if the cached auth session claims a paid plan', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user', email: 'user@example.com', plan: 'team' } } as Awaited<ReturnType<typeof auth.api.getSession>>);
    vi.mocked(getBillingAccess).mockResolvedValue({ ...emptyBillingAccess(true), canPreviewDashboard: true, status: 'trialing' });
    expect((await requireToolAccess(request))?.status).toBe(402);
  });
  it('denies tools when billing verification fails', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user', email: 'user@example.com' } } as Awaited<ReturnType<typeof auth.api.getSession>>);
    vi.mocked(getBillingAccess).mockRejectedValue(new Error('network outage'));
    expect((await requireToolAccess(request))?.status).toBe(503);
  });
  it('checks quota only after payment is confirmed and propagates exhaustion', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user', email: 'user@example.com' } } as Awaited<ReturnType<typeof auth.api.getSession>>);
    vi.mocked(getBillingAccess).mockResolvedValue({ ...emptyBillingAccess(true), canUseTools: true, plan: 'solo', status: 'active' });
    const quota = vi.fn(async () => Response.json({ error: 'hosted_limit_reached' }, { status: 429 }));
    expect((await requireToolAccess(request, quota))?.status).toBe(429);
    expect(quota).toHaveBeenCalledOnce();
  });
});

import { ogCard, ogCardSize } from '@/lib/og-card';
import { getAgentProfile } from '@/lib/agent-profiles';

export const runtime = 'edge';
export const alt = 'brocco agent';
export const size = ogCardSize;
export const contentType = 'image/png';

export default async function Og({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getAgentProfile(slug);
  return ogCard({
    eyebrow: 'agent',
    title: a?.name ?? 'brocco agent',
    sub: a?.tagline,
  });
}

import { ogCard, ogCardSize } from '@/lib/og-card';
import { getIntegrationProfile } from '@/lib/integration-profiles';

export const runtime = 'edge';
export const alt = 'brocco integration';
export const size = ogCardSize;
export const contentType = 'image/png';

export default async function Og({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = getIntegrationProfile(slug);
  return ogCard({
    eyebrow: 'integration',
    title: i?.name ?? 'brocco integration',
    sub: i?.tagline,
  });
}

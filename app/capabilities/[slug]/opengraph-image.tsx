import { ogCard, ogCardSize } from '@/lib/og-card';
import { getCapability } from '@/lib/capabilities-data';

export const runtime = 'edge';
export const alt = 'brocco capability';
export const size = ogCardSize;
export const contentType = 'image/png';

export default async function Og({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCapability(slug);
  return ogCard({
    eyebrow: 'capability',
    title: c?.name ?? 'brocco capability',
    sub: c?.tagline,
  });
}

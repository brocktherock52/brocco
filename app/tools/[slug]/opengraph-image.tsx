import { ogCard, ogCardSize } from '@/lib/og-card';
import { getToolProfile } from '@/lib/tool-profiles';

export const runtime = 'edge';
export const alt = 'brocco tool';
export const size = ogCardSize;
export const contentType = 'image/png';

export default async function Og({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getToolProfile(slug);
  return ogCard({
    eyebrow: t?.category ? `tool · ${t.category}` : 'tool',
    title: t?.name ?? 'brocco tool',
    sub: t?.tagline,
  });
}

import { ogCard, ogCardSize } from '@/lib/og-card';
import { getRecipeProfile } from '@/lib/recipe-profiles';

export const runtime = 'edge';
export const alt = 'brocco recipe';
export const size = ogCardSize;
export const contentType = 'image/png';

export default async function Og({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRecipeProfile(slug);
  return ogCard({
    eyebrow: 'recipe',
    title: r?.name ?? 'brocco recipe',
    sub: r?.tagline,
  });
}

import type { MetadataRoute } from 'next';

const SITE = 'https://brocco-site.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/app`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/security`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/docs`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/billing/success`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];
}

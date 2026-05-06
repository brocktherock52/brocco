import type { MetadataRoute } from 'next';
import { POSTS } from '@/lib/posts';
import { AGENT_PROFILES } from '@/lib/agent-profiles';
import { VERTICALS } from '@/lib/verticals';

const SITE = 'https://brocco-site.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const blog = POSTS.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  const agents = AGENT_PROFILES.map((a) => ({
    url: `${SITE}/agents/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));
  const verticals = VERTICALS.map((v) => ({
    url: `${SITE}/for/${v.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/app`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/agents`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/security`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/docs`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/download`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/changelog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE}/vs/cursor`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE}/vs/zapier`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE}/vs/devin`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/vs/n8n`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/vs/crewai`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/billing/success`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    ...agents,
    ...verticals,
    ...blog,
  ];
}

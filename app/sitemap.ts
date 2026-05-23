import type { MetadataRoute } from 'next';
import { POSTS } from '@/lib/posts';
import { AGENT_PROFILES } from '@/lib/agent-profiles';
import { VERTICALS } from '@/lib/verticals';
import { TOOL_PROFILES } from '@/lib/tool-profiles';
import { RECIPE_PROFILES } from '@/lib/recipe-profiles';
import { INTEGRATION_PROFILES } from '@/lib/integration-profiles';

// 2026-05-22: was hardcoded to the Vercel preview domain. Now uses the public
// base URL so Google indexes the real domain and not the staging URL.
const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://brocco.dev';

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
  const tools = TOOL_PROFILES.map((t) => ({
    url: `${SITE}/tools/${t.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));
  const recipes = RECIPE_PROFILES.map((r) => ({
    url: `${SITE}/recipes/${r.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));
  const integrations = INTEGRATION_PROFILES.map((i) => ({
    url: `${SITE}/integrations/${i.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/app`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/agents`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/tools`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE}/recipes`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/integrations`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
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
    ...tools,
    ...recipes,
    ...verticals,
    ...integrations,
    ...blog,
  ];
}

import type { MetadataRoute } from 'next';

// 2026-05-22: was hardcoded to the Vercel preview domain. Now uses the public
// base URL so robots/sitemap point at brocco.dev and not the staging URL.
const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://brocco.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/app', '/billing/'] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

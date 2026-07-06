import type { MetadataRoute } from 'next';

// 2026-05-22: was hardcoded to the Vercel preview domain. Now uses the public
// base URL so robots/sitemap point at brocco.dev and not the staging URL.
const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://brocco.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // /assets/personal/ holds the founder's personal video/photo source files.
      // This disallow used to live in the static public/robots.txt, but the
      // dynamic route wins and shadowed it, so the rule was silently inactive.
      // Ported here so crawlers actually honor it.
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app', '/billing/', '/account', '/api/', '/assets/personal/'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

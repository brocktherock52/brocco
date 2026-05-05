import type { MetadataRoute } from 'next';

const SITE = 'https://brocco-site.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/app', '/billing/'] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

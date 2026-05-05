import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { PwaRegister } from '@/components/pwa-register';
import { BgDecor } from '@/components/bg-decor';
import { MetaPixel } from '@/components/meta-pixel';
import { CookieConsent } from '@/components/cookie-consent';
import { PostHogProvider } from '@/components/posthog-provider';
import './globals.css';

const SITE_URL = 'https://brocco-site.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'brocco.ai - agents that do the work',
    template: '%s - brocco.ai',
  },
  description:
    'The agentic platform for builders. Run multiple Claude or local LLM agents in parallel from one prompt. Bring your own key. JSONL audit trails. Browser-first PWA.',
  applicationName: 'brocco',
  keywords: [
    'AI agents',
    'agentic AI',
    'Claude',
    'multi-agent',
    'AI workflow',
    'broadcast prompt',
    'BYOK',
    'parallel agents',
    'agent orchestration',
  ],
  authors: [{ name: 'BDP Consulting' }],
  creator: 'BDP Consulting',
  publisher: 'BDP Consulting',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'brocco.ai - agents that do the work',
    description:
      'Run multiple Claude or local LLM agents in parallel from one prompt. Browser-first. BYOK. Audit-grade.',
    url: SITE_URL,
    siteName: 'brocco.ai',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'brocco.ai - agents that do the work' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'brocco.ai - agents that do the work',
    description: 'Multi-agent dashboard. BYOK. Browser-first. Built on Claude.',
    images: ['/opengraph-image'],
    creator: '@brockpivec',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  // Note: Next.js auto-serves app/icon.png and app/apple-icon.png as the
  // primary favicon + Apple touch icon. We additionally declare the PWA
  // sizes so install prompts get crisp icons on every platform.
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/assets/brocco-mark-transparent.png', type: 'image/png' },
      { url: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png' }],
    shortcut: ['/assets/brocco-mark-transparent.png'],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

const ldJson = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: 'Brocco',
      url: SITE_URL,
      logo: `${SITE_URL}/assets/logomark.svg`,
      description:
        'Multi-agent AI dashboard. Run multiple Claude or local LLM agents in parallel from one prompt.',
      parentOrganization: { '@type': 'Organization', name: 'BDP Consulting' },
      email: 'hello@brocco.ai',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#app`,
      name: 'Brocco',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web (PWA)',
      url: `${SITE_URL}/app`,
      description:
        'Multi-agent AI dashboard. Bring your own key. Broadcast one prompt to N agents in parallel.',
      offers: [
        { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Solo', price: '49', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Team', price: '199', priceCurrency: 'USD' },
      ],
      publisher: { '@id': `${SITE_URL}/#org` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </head>
      <body>
        <BgDecor />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <Toaster
          theme="dark"
          richColors
          position="bottom-right"
          toastOptions={{
            className: 'border border-white/10 bg-bg-2/90 backdrop-blur-xl',
          }}
        />
        <PwaRegister />
        <MetaPixel />
        <Suspense fallback={null}>
          <PostHogProvider />
        </Suspense>
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

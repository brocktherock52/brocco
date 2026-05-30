import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { PwaRegister } from '@/components/pwa-register';
import { BgDecor } from '@/components/bg-decor';
import { CosmicBg } from '@/components/cosmic-bg';
import { MetaPixel } from '@/components/meta-pixel';
import { CookieConsent } from '@/components/cookie-consent';
import { PostHogProvider } from '@/components/posthog-provider';
import { SupportChat } from '@/components/support-chat';
import { CommandPalette } from '@/components/command-palette';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { LenisProvider } from '@/components/lenis-provider';
// MascotMount intentionally unmounted. Next.js 16 + framer-motion drag is throwing
// "Element type is invalid. Received a promise that resolves to: undefined."
// even via dynamic({ssr:false}) wrapper. Files preserved in components/mascot-*.tsx
// for later iteration once the Next 16 client-import root cause is identified.
import './globals.css';

const SITE_URL = 'https://brocco.dev';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'brocco.dev - agents that do the work',
    template: '%s - brocco.dev',
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
  authors: [{ name: 'BDP Industries' }],
  creator: 'BDP Industries',
  publisher: 'BDP Industries',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'brocco.dev - agents that do the work',
    description:
      'Run multiple Claude or local LLM agents in parallel from one prompt. Browser-first. BYOK. Audit-grade.',
    url: SITE_URL,
    siteName: 'brocco.dev',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'brocco.dev - agents that do the work' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'brocco.dev - agents that do the work',
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
  // iOS standalone-PWA hints: launch fullscreen with a dark translucent status
  // bar and a proper home-screen app title (added 2026-05-30).
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'brocco',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  // viewport-fit=cover lets content extend under the iOS notch / home bar so we
  // can pad with safe-area-inset where it matters (added 2026-05-30).
  viewportFit: 'cover',
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
      parentOrganization: { '@type': 'Organization', name: 'BDP Industries' },
      email: 'help@brocco.dev',
      // sameAs feeds Google's knowledge graph + links the brand's socials.
      // Verified 2026-05-27 against the live Ayrshare /user response so this
      // matches the accounts we actually post to (and the footer).
      sameAs: [
        'https://www.tiktok.com/@brocco.dev',
        'https://www.instagram.com/brocco.dev',
        'https://x.com/broccoai',
        'https://www.youtube.com/@brocco.dev',
        'https://www.linkedin.com/company/brocco.dev',
        'https://www.threads.com/@brocco.dev',
        'https://www.facebook.com/Brocco.dev',
        'https://www.pinterest.com/brocco.dev',
        'https://www.reddit.com/user/broccoai',
        'https://www.snapchat.com/add/brocco.dev',
        'https://discord.gg/v5j37wwkjn',
        'https://github.com/brocktherock52/brocco',
      ],
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
        <ScrollProgress />
        {/* Background stack: the cosmic galaxy (starfield, constellations,
            planets, comets) sits furthest back for the signature space feel
            the founder wanted restored; BgDecor's grid + gradient layers on
            top of it. CosmicBg self-throttles its starfield on mobile and
            respects reduced-motion via framer-motion. */}
        <CosmicBg />
        <BgDecor />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <LenisProvider>{children}</LenisProvider>
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
        <SupportChat />
        <CommandPalette />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

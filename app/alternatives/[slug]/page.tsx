import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, X } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { ALTERNATIVES, getAlternative } from '@/lib/alternatives';

// /alternatives/[slug]: bottom-of-funnel comparison pages (traffic research
// 2026-06-02, channel #1). Honest side-by-side table at the top, a "when they
// are better" section, FAQ + comparison schema for AI-Overview citation, and a
// red pricing CTA. Static for speed + indexability.

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://brocco.dev';

export function generateStaticParams() {
  return ALTERNATIVES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const a = getAlternative(slug);
  if (!a) return { title: 'Not found' };
  return {
    title: a.metaTitle,
    description: a.metaDescription,
    alternates: { canonical: `/alternatives/${a.slug}` },
    keywords: a.keywords,
    openGraph: { title: a.metaTitle, description: a.metaDescription, url: `${SITE}/alternatives/${a.slug}`, type: 'website' },
  };
}

export const dynamic = 'force-static';

export default async function AlternativePage({ params }: PageProps) {
  const { slug } = await params;
  const a = getAlternative(slug);
  if (!a) notFound();

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: a.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-10 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] bg-radial-glow" />
          <div className="container-x max-w-3xl">
            <p className="pill">brocco vs {a.competitor}</p>
            <h1 className="mt-5 text-display-xl lowercase">
              <span className="text-grad">{a.h1Lead}</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">{a.h1Rest}</span>
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-dim">{a.sub}</p>
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-faint">{a.competitorBlurb}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {/* Red pricing-directed CTA (consultant heatmap note). */}
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_0_22px_-2px_rgba(244,63,94,0.6)] transition-all hover:shadow-[0_0_32px_0_rgba(244,63,94,0.8)]"
              >
                see pricing <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/signup" className="btn-ghost text-[15px]">
                start free · 100 runs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="pb-12">
          <div className="container-x max-w-3xl">
            <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 border-b border-white/[0.08] pb-3 md:gap-4">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint">feature</div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-brand-glow">brocco</div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint">{a.competitor}</div>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {a.rows.map((r) => (
                <div key={r.feature} className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 py-4 md:gap-4">
                  <div className="text-[13.5px] font-semibold text-white">{r.feature}</div>
                  <div className="flex items-start gap-1.5 text-[13.5px] text-ink/95">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span>{r.brocco}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[13.5px] text-ink-faint">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-rose/70" />
                    <span>{r.them}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* When the competitor is the better choice (honest = ranks + converts). */}
        <section className="pb-12">
          <div className="container-x max-w-3xl">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
              <h2 className="text-[20px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">When {a.competitor} is the better choice</span>
              </h2>
              <p className="mt-2 text-[13.5px] text-ink-faint">We would rather you pick the right tool than churn. Honestly:</p>
              <ul className="mt-4 space-y-2.5">
                {a.whenThemBetter.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-[14.5px] leading-relaxed text-ink-dim">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-glow" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-20">
          <div className="container-x max-w-3xl">
            <h2 className="text-[24px] font-semibold tracking-tight">
              <span className="text-grad">questions</span>
            </h2>
            <dl className="mt-6 space-y-6">
              {a.faqs.map((f) => (
                <div key={f.q}>
                  <dt className="text-[15.5px] font-semibold text-white">{f.q}</dt>
                  <dd className="mt-1.5 text-[14.5px] leading-relaxed text-ink-dim">{f.a}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_0_22px_-2px_rgba(244,63,94,0.6)] transition-all hover:shadow-[0_0_32px_0_rgba(244,63,94,0.8)]"
              >
                see pricing <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/real-estate" className="btn-ghost text-[15px]">
                see the real-estate workflow <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X, Minus } from 'lucide-react';
import { Nav } from './nav';
import { Footer } from './footer';
import { FinalCta } from './final-cta';

export type Cell = boolean | string;

export interface ComparePageProps {
  competitor: string;
  competitorTagline: string;
  hero: {
    eyebrow: string;
    titleA: string; // sans clause
    titleB: string; // serif italic clause
    subtitle: string;
  };
  oneLine: { brocco: string; competitor: string };
  /** Rows: "Feature" | brocco value | competitor value (boolean or string) */
  matrix: { label: string; brocco: Cell; competitor: Cell }[];
  /** Three-card "where each wins" block. */
  wins: {
    brocco: string[];
    competitor: string[];
  };
  /** FAQ entries shown at bottom. */
  faq: { q: string; a: string }[];
}

export function ComparePage(props: ComparePageProps) {
  const { competitor, hero, oneLine, matrix, wins, faq, competitorTagline } = props;

  // FAQPage schema lets Google render the FAQ as rich snippets directly
  // in search results.
  const ldFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  // Article schema gives the page a clean editorial signal on top of
  // the FAQPage. We treat each /vs/* as an editorial comparison piece.
  const ldArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${hero.titleA} ${hero.titleB}`,
    description: props.hero.subtitle,
    author: { '@type': 'Organization', name: 'brocco.dev' },
    publisher: {
      '@type': 'Organization',
      name: 'brocco.dev',
      logo: { '@type': 'ImageObject', url: 'https://brocco-site.vercel.app/icon.png' },
    },
    about: [
      { '@type': 'SoftwareApplication', name: 'brocco.dev' },
      { '@type': 'SoftwareApplication', name: competitor },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldArticle) }}
      />
      <Nav />
      <main>
        {/* HERO */}
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">{hero.eyebrow}</p>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-5 max-w-[20ch] text-display-xl"
            >
              <span className="text-grad">{hero.titleA}</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">{hero.titleB}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mx-auto mt-6 max-w-2xl text-[16.5px] leading-relaxed text-ink-dim"
            >
              {hero.subtitle}
            </motion.p>
          </div>
        </section>

        {/* ONE-LINER ROWS */}
        <section className="py-10">
          <div className="container-x">
            <div className="mx-auto grid max-w-4xl gap-3 md:grid-cols-2">
              <Card label="brocco.dev" body={oneLine.brocco} accent="from-brand/30 to-cyan/20" />
              <Card label={competitor} body={oneLine.competitor} accent="from-white/[0.04] to-white/[0.02]" muted />
            </div>
            <p className="mx-auto mt-4 max-w-3xl text-center text-[12.5px] italic text-ink-faint">
              We tried to write {competitor}&apos;s description the way they would. {competitorTagline}
            </p>
          </div>
        </section>

        {/* COMPARISON MATRIX */}
        <section className="py-16 md:py-20">
          <div className="container-x">
            <div className="mx-auto max-w-3xl text-center">
              <p className="pill mx-auto">Side by side</p>
              <h2 className="mt-5 text-display-lg">
                <span className="text-grad">Feature for feature.</span>{' '}
                <span className="font-serif italic font-normal text-grad-brand">No spin.</span>
              </h2>
            </div>

            <div className="mx-auto mt-10 max-w-3xl overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <table className="w-full text-left text-[13.5px]">
                <thead className="border-b border-white/[0.06] bg-white/[0.02]">
                  <tr>
                    <th className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                      Feature
                    </th>
                    <th className="px-4 py-3.5 font-semibold text-brand-glow">brocco.dev</th>
                    <th className="px-4 py-3.5 font-semibold text-ink">{competitor}</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => (
                    <tr key={row.label} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-4 py-3 text-ink-dim">{row.label}</td>
                      <CellTd v={row.brocco} brand />
                      <CellTd v={row.competitor} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* WHERE EACH WINS */}
        <section className="py-16 border-y border-white/[0.05] bg-bg-1/40">
          <div className="container-x">
            <div className="mx-auto max-w-3xl text-center">
              <p className="pill mx-auto">Honest take</p>
              <h2 className="mt-5 text-display-lg">
                <span className="text-grad">Where each one</span>{' '}
                <span className="font-serif italic font-normal text-grad-brand">actually wins.</span>
              </h2>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
              <WinsCard title="Pick brocco when" items={wins.brocco} accent />
              <WinsCard title={`Pick ${competitor} when`} items={wins.competitor} />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container-x max-w-3xl">
            <div className="text-center">
              <p className="pill mx-auto">FAQ</p>
              <h2 className="mt-5 text-display-lg">
                <span className="text-grad">Common</span>{' '}
                <span className="font-serif italic font-normal text-grad-brand">questions.</span>
              </h2>
            </div>
            <div className="mt-10 space-y-2.5">
              {faq.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.02] open:bg-white/[0.04]"
                >
                  <summary className="cursor-pointer list-none px-5 py-4 text-[15px] font-medium text-ink hover:text-white">
                    {f.q}
                  </summary>
                  <div className="px-5 pb-5 text-[14.5px] leading-relaxed text-ink-dim">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <FinalCta />

        {/* internal links to other comparisons */}
        <section className="border-t border-white/[0.05] py-10">
          <div className="container-x text-center">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
              More comparisons
            </p>
            <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 text-[13px]">
              <ComparePill href="/vs/cursor" current={competitor === 'Cursor'} label="brocco vs Cursor" />
              <ComparePill href="/vs/zapier" current={competitor === 'Zapier'} label="brocco vs Zapier" />
              <ComparePill href="/vs/devin" current={competitor === 'Devin'} label="brocco vs Devin" />
              <ComparePill href="/vs/n8n" current={competitor === 'n8n'} label="brocco vs n8n" />
              <ComparePill href="/vs/crewai" current={competitor === 'CrewAI'} label="brocco vs CrewAI" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Card({
  label,
  body,
  accent,
  muted,
}: {
  label: string;
  body: string;
  accent: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`card relative overflow-hidden p-6 ${muted ? 'opacity-90' : ''}`}
    >
      <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${accent} blur-3xl opacity-50`} />
      <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">{label}</div>
      <p className="mt-3 text-[14.5px] leading-relaxed text-ink/95">{body}</p>
    </div>
  );
}

function CellTd({ v, brand = false }: { v: Cell; brand?: boolean }) {
  if (v === true) {
    return (
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 ${brand ? 'text-emerald-400' : 'text-emerald-300'}`}>
          <Check className="h-3.5 w-3.5" />
          Yes
        </span>
      </td>
    );
  }
  if (v === false) {
    return (
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-ink-faint">
          <X className="h-3.5 w-3.5" />
          No
        </span>
      </td>
    );
  }
  if (v.toLowerCase() === 'partial') {
    return (
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-amber-300">
          <Minus className="h-3.5 w-3.5" />
          Partial
        </span>
      </td>
    );
  }
  return <td className={`px-4 py-3 ${brand ? 'text-brand-glow' : 'text-ink'}`}>{v}</td>;
}

function WinsCard({ title, items, accent = false }: { title: string; items: string[]; accent?: boolean }) {
  return (
    <div className={`card relative overflow-hidden p-6 ${accent ? 'border-brand/30 ring-1 ring-brand/30' : ''}`}>
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${accent ? 'bg-brand/15' : 'bg-white/[0.02]'} blur-3xl`} />
      <h3 className="text-[16.5px] font-semibold tracking-tight">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink-dim">
            <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${accent ? 'text-emerald-400' : 'text-emerald-300'}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComparePill({ href, current, label }: { href: string; current?: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 transition-colors ${
        current
          ? 'border-brand/40 bg-brand/10 text-brand-glow'
          : 'border-white/[0.10] bg-white/[0.04] text-ink-dim hover:bg-white/[0.07] hover:text-white'
      }`}
    >
      {label} {!current && <ArrowRight className="h-3 w-3" />}
    </Link>
  );
}

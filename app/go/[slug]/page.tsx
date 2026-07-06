import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Wordmark } from '@/components/logo';
import { LANDERS, getLander } from '@/lib/landers';

/**
 * /go/[slug] : ad warm-landers (consultant note 2026-06-02).
 *
 * Deliberately NO <Nav /> and NO <Footer /> with site links. The only
 * navigable action on the page is the CTA to /pricing. Paid traffic from
 * Meta / TikTok / Snap ads lands here, gets its specific pain hit, and has
 * exactly one place to go: the offer. The top navigation was leaking that
 * intent on the main pages.
 *
 * These are noindex'd: they are ad destinations, not SEO pages, and they
 * intentionally overlap the canonical /for/[slug] and /real-estate content.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return LANDERS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const l = getLander(slug);
  if (!l) return { title: 'Not found' };
  return {
    title: `${l.headline.split('.')[0]} | brocco`,
    description: l.sub.slice(0, 160),
    // Ad landers must not compete with the canonical pages in search.
    robots: { index: false, follow: false },
  };
}

// CTA target: the offer. The ?from tag lets pricing + analytics attribute which
// lander (and therefore which ad) drove the click.
function pricingHref(slug: string) {
  return `/pricing?from=go-${slug}`;
}

export default async function LanderPage({ params }: PageProps) {
  const { slug } = await params;
  const l = getLander(slug);
  if (!l) notFound();

  const headParts = l.headline.split('.');
  const headLead = `${headParts[0]}.`;
  const headRest = headParts.slice(1).join('.').trim();

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient glow, matches the rest of the brand. */}
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-30 opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[600px] bg-radial-glow"
      />

      {/* Bare header: brand mark only, intentionally NOT a link. No nav. */}
      <header className="container-x flex items-center justify-between pt-8">
        <Wordmark className="text-[15px]" />
        <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint sm:inline">
          100 free runs · no card
        </span>
      </header>

      {/* Hero: benefit-first headline + the single CTA. */}
      <section className="container-x grid items-center gap-10 pt-12 pb-12 md:pt-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="pill">{l.eyebrow}</p>
          <h1 className="mt-5 text-display-xl lowercase">
            <span className="text-grad">{headLead}</span>{' '}
            {headRest && (
              <span className="font-serif italic font-normal text-grad-brand">{headRest}</span>
            )}
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-dim">{l.sub}</p>

          <div className="mt-8">
            <Link href={pricingHref(l.slug)} className="btn-primary text-[16px]">
              <Sparkles className="h-4 w-4" />
              <span>{l.ctaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              start free · 100 runs / mo · no card
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-bg-1/40 shadow-glow2">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), rgba(224,69,123,0.4), transparent)',
            }}
          />
          <Image
            src={l.image}
            alt="Your brocco AI team, doing the real estate work for you"
            width={1200}
            height={896}
            priority
            sizes="(max-width: 1024px) 100vw, 520px"
            className="h-auto w-full"
          />
        </div>
      </section>

      {/* Agitate the pain, this buyer's specific Tuesday. */}
      <section className="container-x pb-14">
        <h2 className="text-[22px] font-semibold tracking-tight">
          <span className="font-serif italic font-normal text-grad-brand">Sound familiar?</span>
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {l.pains.map((p) => (
            <li
              key={p}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-[15px] leading-relaxed text-ink-dim"
            >
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Objection handling: ok, how does it actually work? */}
      <section className="container-x pb-14">
        <h2 className="text-[22px] font-semibold tracking-tight">
          <span className="text-grad">Here is how it works.</span>
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {l.how.map((s, i) => (
            <div key={s.title} className="card p-5">
              <p className="font-mono text-[12px] text-cyan-glow">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-2 text-[15px] font-semibold text-white">{s.title}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proof / risk reversal + the closing CTA. */}
      <section className="container-x pb-20">
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-brand/10 via-bg-1/40 to-cyan/[0.06] p-8 text-center md:p-12">
          <h2 className="mx-auto max-w-2xl text-display-lg lowercase">
            <span className="text-grad">stop doing the grind.</span>{' '}
            <span className="font-serif italic font-normal text-grad-brand">start tonight.</span>
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-ink-faint">
            {l.proof.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                {p}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <Link href={pricingHref(l.slug)} className="btn-primary text-[16px]">
              <Sparkles className="h-4 w-4" />
              <span>{l.ctaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {/* Minimal legal footer, no navigation links by design. */}
        <p className="mt-8 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
          brocco.dev · your AI team in a tab
        </p>
      </section>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { VERTICALS, getVertical } from '@/lib/verticals';
import { getAgentProfile } from '@/lib/agent-profiles';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return VERTICALS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const v = getVertical(slug);
  if (!v) return { title: 'Not found' };
  return {
    title: `brocco for ${v.audience} — multi-agent AI`,
    description: v.lead.slice(0, 160),
    alternates: { canonical: `/for/${v.slug}` },
    keywords: v.keywords,
    openGraph: {
      title: `brocco for ${v.audience}`,
      description: v.lead.slice(0, 160),
      type: 'website',
    },
  };
}

export default async function VerticalPage({ params }: PageProps) {
  const { slug } = await params;
  const v = getVertical(slug);
  if (!v) notFound();

  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x">
            <p className="eyebrow">Built for {v.audience}</p>
            <h1 className="mt-3 text-display-xl">
              <span className="text-grad">{v.hero.split('.')[0]}.</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">{v.hero.split('.').slice(1).join('.').trim()}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-dim">{v.lead}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/app" className="btn-primary">
                Open the app <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/pricing" className="btn-ghost">
                See pricing
              </Link>
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="container-x max-w-4xl">
            <h2 className="text-[24px] font-semibold tracking-tight">
              <span className="font-serif italic font-normal text-grad-brand">What you spend Tuesday on</span>
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {v.pains.map((p) => (
                <li
                  key={p}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-[15px] leading-relaxed text-ink-dim"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="pb-16">
          <div className="container-x max-w-3xl">
            <h2 className="text-[24px] font-semibold tracking-tight">
              <span className="font-serif italic font-normal text-grad-brand">Your day with brocco</span>
            </h2>
            <ol className="mt-6 space-y-4">
              {v.dayWith.map((step, i) => (
                <li key={`${step.time}-${i}`} className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="rounded-full border border-cyan-400/35 bg-cyan-400/[0.05] px-3 py-1 font-mono text-[12px] text-cyan-glow">
                      {step.time}
                    </div>
                  </div>
                  <p className="pt-1 text-[15px] leading-relaxed text-ink-dim">{step.action}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="pb-16">
          <div className="container-x">
            <h2 className="text-[24px] font-semibold tracking-tight">
              <span className="font-serif italic font-normal text-grad-brand">Agents that do the work</span>
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {v.agents.map((slug) => {
                const agent = getAgentProfile(slug);
                if (!agent) return null;
                return (
                  <Link
                    key={slug}
                    href={`/agents/${slug}`}
                    className="card card-hover group block p-4"
                  >
                    <p className="font-mono text-[13px] font-bold text-cyan-glow">{agent.name}</p>
                    <p className="mt-1 text-[13px] leading-snug text-ink-dim line-clamp-2">{agent.tagline}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x">
            <h2 className="text-[24px] font-semibold tracking-tight">
              <span className="font-serif italic font-normal text-grad-brand">Recipes that ship</span>
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {v.recipes.map((r) => (
                <Link
                  key={r}
                  href={`/recipes/${r}`}
                  className="card card-hover group flex items-center justify-between p-4"
                >
                  <span className="text-[14.5px] font-semibold capitalize">{r.replace(/-/g, ' ')}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-cyan-glow transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

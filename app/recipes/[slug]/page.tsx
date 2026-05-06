import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { RECIPE_PROFILES, getRecipeProfile } from '@/lib/recipe-profiles';
import { getAgentProfile } from '@/lib/agent-profiles';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return RECIPE_PROFILES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const r = getRecipeProfile(slug);
  if (!r) return { title: 'Not found' };
  return {
    title: `${r.name} recipe — brocco.ai`,
    description: r.tagline.slice(0, 160),
    alternates: { canonical: `/recipes/${r.slug}` },
    keywords: r.keywords,
  };
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const r = getRecipeProfile(slug);
  if (!r) notFound();

  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-10 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x">
            <Link href="/recipes" className="inline-flex items-center gap-1 text-[12.5px] text-ink-faint hover:text-white">
              <ArrowLeft className="h-3 w-3" />
              All recipes
            </Link>
            <p className="eyebrow mt-6">Recipe · broadcast pattern</p>
            <h1 className="mt-3 text-display-xl">
              <span className="text-grad">{r.name.split(' ')[0]}</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">{r.name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-dim">{r.tagline}</p>
            <p className="mt-3 text-[14px] text-ink-faint">For: {r.audience}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/app" className="btn-primary">
                Run this recipe <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/recipes" className="btn-ghost">All recipes</Link>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x max-w-3xl space-y-12">
            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">What you get</span>
              </h2>
              <ul className="mt-4 space-y-2 pl-5 list-disc text-[15px] leading-relaxed text-ink-dim">
                {r.whatYouGet.map((w) => <li key={w}>{w}</li>)}
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">Agents that broadcast</span>
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {r.agents.map((slug) => {
                  const a = getAgentProfile(slug);
                  if (!a) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/agents/${slug}`}
                      className="card card-hover group block p-4"
                    >
                      <p className="font-mono text-[13px] font-bold text-cyan-glow">{a.name}</p>
                      <p className="mt-1 text-[13px] leading-snug text-ink-dim line-clamp-2">{a.tagline}</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">The prompt</span>
              </h2>
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.06] bg-bg-1 p-5 font-mono text-[13px] leading-relaxed text-ink whitespace-pre-wrap">
                {r.prompt}
              </pre>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">Expected output</span>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-dim">{r.expectedOutput}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">Run time</p>
                <p className="mt-2 font-mono text-[24px] font-semibold text-cyan-glow">{r.cost.time}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">Cost (BYOK)</p>
                <p className="mt-2 font-mono text-[24px] font-semibold text-cyan-glow">{r.cost.price}</p>
              </div>
            </div>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

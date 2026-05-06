import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { RECIPE_PROFILES } from '@/lib/recipe-profiles';
import { AnimatedGrid, AnimatedGridItem } from '@/components/animated-grid';

export const metadata: Metadata = {
  title: 'Recipes — brocco.ai',
  description:
    'Pre-built broadcast patterns for the work you keep redoing. Market research, content sprints, customer deep dives, launch kits, and 7 more.',
  alternates: { canonical: '/recipes' },
  keywords: ['ai recipes', 'agent broadcast patterns', 'multi-agent workflows'],
};

export default function RecipesIndex() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">The patterns</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl">
              <span className="text-grad">Recipes that</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">ship.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim">
              Pre-built broadcast patterns. Each one runs in 5 to 25 minutes and ends with files you can drop in Notion or send to a customer.
            </p>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x">
            <AnimatedGrid className="grid grid-cols-1 gap-3 md:grid-cols-2" staggerMs={50}>
              {RECIPE_PROFILES.map((r) => (
                <AnimatedGridItem key={r.slug}>
                  <Link
                    href={`/recipes/${r.slug}`}
                    className="card card-hover group block h-full p-6 hover:shadow-glow"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-cyan-glow">
                        {r.cost.time} · {r.cost.price}
                      </p>
                    </div>
                    <h2 className="mt-3 text-[20px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-white">
                      {r.name}
                    </h2>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-ink-dim line-clamp-3">
                      {r.tagline}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {r.agents.map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] text-ink-dim"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-[13px] text-cyan-glow">
                      Open recipe <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </AnimatedGridItem>
              ))}
            </AnimatedGrid>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

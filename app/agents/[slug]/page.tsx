import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Hash } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { AGENT_PROFILES, getAgentProfile } from '@/lib/agent-profiles';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return AGENT_PROFILES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const a = getAgentProfile(slug);
  if (!a) return { title: 'Not found' };
  return {
    title: `${a.name} agent — brocco.ai`,
    description: a.lead.slice(0, 160),
    alternates: { canonical: `/agents/${a.slug}` },
    keywords: a.keywords,
    openGraph: {
      title: `${a.name} agent — brocco.ai`,
      description: a.lead.slice(0, 160),
      type: 'website',
    },
  };
}

export default async function AgentProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const a = getAgentProfile(slug);
  if (!a) notFound();

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `brocco ${a.name} agent`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: a.lead,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: a.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Nav />
      <main>
        <section className="relative pt-32 pb-10 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x">
            <Link
              href="/agents"
              className="inline-flex items-center gap-1 text-[12.5px] text-ink-faint hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              All agents
            </Link>
            <p className="eyebrow mt-6">Agent profile</p>
            <h1 className="mt-3 text-display-xl">
              <span className="font-mono font-bold text-cyan-glow">{a.name}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-dim">{a.lead}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/app#agent=${a.slug}`} className="btn-primary">
                Open in dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="#recipes" className="btn-ghost">
                See related recipes
              </Link>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x max-w-3xl space-y-16">
            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">Capabilities</span>
              </h2>
              <ul className="mt-4 space-y-2 pl-5 list-disc text-[15px] leading-relaxed text-ink-dim">
                {a.capabilities.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">Tools used</span>
              </h2>
              <p className="mt-3 text-[14.5px] text-ink-dim">
                Primary tools shaped this agent. Read the full registry on the{' '}
                <Link href="/tools" className="text-cyan-glow underline-offset-4 hover:underline">tools page</Link>.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {a.primaryTools.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full border border-cyan-400/35 bg-cyan-400/[0.05] px-3 py-1 font-mono text-[12.5px] text-cyan-glow"
                  >
                    {t}
                  </span>
                ))}
                {a.secondaryTools.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 font-mono text-[12.5px] text-ink-dim"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">Example tasks</span>
              </h2>
              <div className="mt-4 grid gap-3">
                {a.examples.map((ex) => (
                  <div
                    key={ex.prompt}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 border-l-2 border-l-cyan"
                  >
                    <p className="text-[14.5px] font-semibold text-white">{ex.prompt}</p>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">{ex.output}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">How to use</span>
              </h2>
              <p className="mt-3 text-[14.5px] text-ink-dim">
                Drop this prompt into the dashboard with the {a.name} selected. Edit the bracketed slots before broadcasting.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.06] bg-bg-1 p-5 font-mono text-[13px] leading-relaxed text-ink whitespace-pre-wrap">
                {a.promptTemplate}
              </pre>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">Run cost and time</span>
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {a.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">{m.label}</p>
                    <p className="mt-2 font-mono text-[26px] font-semibold text-cyan-glow">{m.value}</p>
                    <p className="mt-1 text-[12.5px] text-ink-dim">{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {a.relatedRecipes.length > 0 && (
              <div id="recipes">
                <h2 className="text-[24px] font-semibold tracking-tight">
                  <span className="font-serif italic font-normal text-grad-brand">Related recipes</span>
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {a.relatedRecipes.map((r) => (
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
            )}

            {a.compareWith.length > 0 && (
              <div>
                <h2 className="text-[24px] font-semibold tracking-tight">
                  <span className="font-serif italic font-normal text-grad-brand">Compare with</span>
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {a.compareWith.map((c) => (
                    <Link
                      key={c}
                      href={`/agents/${c}`}
                      className="card card-hover group flex items-center justify-between p-4"
                    >
                      <span className="font-mono text-[14.5px] font-semibold text-cyan-glow">{c}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-ink-dim transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">
                <span className="font-serif italic font-normal text-grad-brand">FAQ</span>
              </h2>
              <div className="mt-4 space-y-3">
                {a.faq.map((f) => (
                  <details
                    key={f.q}
                    className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <summary className="cursor-pointer list-none text-[15px] font-semibold marker:hidden">
                      {f.q}
                    </summary>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                <Hash className="-mt-0.5 mr-1 inline h-3 w-3" />
                Keywords
              </p>
              <p className="mt-2 text-[13.5px] text-ink-dim">{a.keywords.join(' · ')}</p>
            </div>
          </div>
        </section>
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';
import { TOOL_PROFILES } from '@/lib/tool-profiles';

export const metadata: Metadata = {
  title: 'Tools — brocco.ai',
  description:
    'The 13 built-in tools brocco agents call: search_web, http_get, http_post, file_read, file_write, memory_get, memory_put, shell_exec, image_gen, voice_tts, postgres, stripe, delegate.',
  alternates: { canonical: '/tools' },
  keywords: ['ai agent tools', 'tool registry', 'mcp tools', 'agent capabilities'],
};

const CATEGORIES = ['fetch', 'storage', 'compute', 'creative', 'data', 'flow'] as const;

export default function ToolsIndex() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">The registry</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl">
              <span className="text-grad">Thirteen tools.</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">Real interfaces.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim">
              Every brocco agent calls a focused list of tools with typed inputs, audit logs, and a sandbox. No "smart tool routing" — just functions agents invoke.
            </p>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x">
            {CATEGORIES.map((cat) => {
              const tools = TOOL_PROFILES.filter((t) => t.category === cat);
              if (tools.length === 0) return null;
              return (
                <div key={cat} className="mt-12 first:mt-0">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                    {cat}
                  </p>
                  <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {tools.map((t) => (
                      <li key={t.slug}>
                        <Link
                          href={`/tools/${t.slug}`}
                          className="card card-hover group block h-full p-5"
                        >
                          <p className="font-mono text-[14px] font-bold text-cyan-glow">{t.name}</p>
                          <p className="mt-2 text-[14px] leading-relaxed text-ink-dim line-clamp-3">{t.tagline}</p>
                          <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-cyan-glow">
                            Spec <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

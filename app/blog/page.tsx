import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { POSTS } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'brocco blog',
  description:
    'Field notes on agentic AI, multi-agent dashboards, MCP, BYOK, and how to actually ship reliable agents in production.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndex() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">Field notes</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl">
              <span className="text-grad">Notes from shipping</span>{' '}
              <span className="font-serif italic font-normal text-grad-brand">real agents.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim">
              Honest write-ups on multi-agent dashboards, MCP, BYOK, broadcast patterns, and audit logs.
            </p>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x max-w-3xl">
            <ul className="space-y-3">
              {POSTS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="card card-hover group block p-6"
                  >
                    <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                      <span>{p.date}</span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {p.readingMinutes} min
                      </span>
                    </div>
                    <h2 className="mt-3 text-[20px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-white">
                      {p.title}
                    </h2>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-ink-dim">{p.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-[13px] text-cyan-glow">
                      Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Book, Code, Zap, Webhook, Shield } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Docs',
  description: 'Brocco documentation: quickstart, agents, tools, recipes, REST API, MCP, self-hosting.',
  alternates: { canonical: '/docs' },
};

const SECTIONS = [
  {
    icon: Zap,
    title: 'Quickstart',
    body: 'Open /app, paste a goal, hit run. Bring your own key on free tier (Anthropic or any OpenAI-compatible).',
    href: '/app',
    cta: 'Open the app',
  },
  {
    icon: Book,
    title: 'Agents',
    body: '9 built-in specialists: supervisor, researcher, analyst, outreach, coder, browser, designer, planner, app_builder. Markdown-defined, easy to clone.',
    href: '/#features',
    cta: 'See features',
  },
  {
    icon: Code,
    title: 'Tools',
    body: '13 tools in the registry: search_web, http_get/post, file_read/save, memory_*, shell_exec, delegate, image_gen, voice_tts. Drop a Python factory to add yours.',
    href: '/#wedge',
    cta: 'The wedge',
  },
  {
    icon: Webhook,
    title: 'REST API',
    body: 'POST /api/v1/run with { agent, goal }. Returns SSE stream of tool calls and tokens. List agents at /api/v1/agents.',
    href: '/api/v1/agents',
    cta: 'GET /api/v1/agents',
  },
  {
    icon: Shield,
    title: 'Security and self-hosting',
    body: 'SOC 2 in progress. GDPR compliant. Self-host on Hetzner / Vercel / your laptop. Helm chart for enterprise.',
    href: '/security',
    cta: 'Security overview',
  },
];

export default function DocsPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">Documentation</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl text-grad">
              Ship your first agent in 11 minutes.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim">
              The full handbook: quickstart, recipes, REST API, MCP, and self-hosting.
            </p>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-x">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="card card-hover group flex flex-col p-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.08]">
                      <Icon className="h-4 w-4 text-brand-glow" />
                    </div>
                    <h3 className="mt-4 text-[16.5px] font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink-dim">{s.body}</p>
                    <Link
                      href={s.href}
                      className="mt-5 inline-flex items-center gap-1.5 self-start text-[13px] font-medium text-cyan-glow"
                    >
                      {s.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h2 className="text-[18px] font-semibold tracking-tight">A minimal agent (markdown)</h2>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-bg-2 p-4 font-mono text-[12.5px] leading-relaxed text-ink">
{`---
name: researcher
description: web research + sourced briefs
tools: [search_web, http_get, file_save, done]
---

You are a research agent. Given a topic, produce a tight markdown brief
with sources. Decompose into 2-4 sub-questions, search efficiently,
synthesize a 5-7 bullet TL;DR, save to brief.md, then call done().
`}
              </pre>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import { ShieldCheck, Lock, FileWarning, Eye, KeyRound, Server, Globe2, CheckCircle2 } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { FinalCta } from '@/components/final-cta';

export const metadata: Metadata = {
  title: 'Security - SOC 2, GDPR, encryption, zero data retention',
  description:
    'Brocco security overview: SOC 2 Type II in progress, GDPR compliant since launch, AES-256 at rest, TLS 1.3 in transit, zero data retention by default.',
  alternates: { canonical: '/security' },
};

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'SOC 2 Type II',
    body: 'Audit in progress. Full controls implemented across access, change-management, monitoring, and incident response. Final report on request.',
  },
  {
    icon: Globe2,
    title: 'GDPR + CCPA',
    body: 'Compliant since launch. DPA available. EU data hosted on Vercel and Hetzner Frankfurt (DE) regions. Data subject rights honored within 30 days.',
  },
  {
    icon: Lock,
    title: 'Encryption everywhere',
    body: 'AES-256 at rest, TLS 1.3 in transit. Secrets managed by Vercel + 1Password. No customer data ever leaves the encrypted tier.',
  },
  {
    icon: Eye,
    title: 'Zero data retention',
    body: 'On paid plans, brocco calls Anthropic with ZDR enabled by default. We never store prompts after a run completes. Audit logs are JSONL, owned by you.',
  },
  {
    icon: KeyRound,
    title: 'BYOK on every plan',
    body: 'Bring your own Anthropic / OpenAI / Ollama key. On free tier, prompts go directly from your browser to your provider. We never see them.',
  },
  {
    icon: Server,
    title: 'Self-host or hosted',
    body: 'Run brocco on Hetzner, Vercel, or your own laptop. Enterprise gets a Helm chart, air-gap-compatible Docker image, and SSO/SCIM out of the box.',
  },
  {
    icon: FileWarning,
    title: 'Vulnerability disclosure',
    body: 'Found something? Email security@brocco.dev. We respond within 1 business day and have a bounty program for verified critical issues.',
  },
];

const FACTS = [
  ['Encryption at rest', 'AES-256-GCM (Vercel managed)'],
  ['Encryption in transit', 'TLS 1.3, HSTS, no TLS 1.0/1.1'],
  ['Data residency', 'US (default), EU (on request)'],
  ['Backups', 'Hourly snapshots, 30-day retention'],
  ['Access control', 'SSO + SCIM (Team / Enterprise)'],
  ['Audit logs', 'JSONL, exportable, immutable'],
  ['Vendor SOC 2', 'Vercel, Anthropic, Stripe'],
  ['Incident response', '4-hour SLA, public status page'],
];

export default function SecurityPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">Security and trust</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl">
              <span className="text-grad">Built for teams that get audited.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16.5px] text-ink-dim">
              Brocco is the runtime your security team can sign off on. Encryption, access control, and audit trails wired in by default. BYOK keeps your data in your hands.
            </p>
          </div>
        </section>

        <section className="pb-16">
          <div className="container-x">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="card card-hover p-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.08]">
                      <Icon className="h-4 w-4 text-brand-glow" />
                    </div>
                    <h3 className="mt-4 text-[16.5px] font-semibold tracking-tight">{p.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">{p.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container-x">
            <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="border-b border-white/[0.06] px-6 py-4">
                <h2 className="text-[16px] font-semibold tracking-tight">Trust facts at a glance</h2>
              </div>
              <ul>
                {FACTS.map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-6 border-b border-white/[0.04] px-6 py-3 text-[13.5px] last:border-0">
                    <span className="text-ink-dim">{k}</span>
                    <span className="font-mono text-ink">{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-[14px] text-ink">
              <div className="inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-wider text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Status
              </div>
              <p className="mt-1.5">All systems operational. We post incidents to the changelog and email paid customers within the hour.</p>
            </div>

            <div className="mx-auto mt-10 max-w-3xl text-center text-[13.5px] text-ink-dim">
              Need a copy of our SOC 2 report or a signed DPA? Email{' '}
              <a href="mailto:security@brocco.dev" className="text-cyan-glow underline-offset-4 hover:underline">
                security@brocco.dev
              </a>
              .
            </div>
          </div>
        </section>

        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

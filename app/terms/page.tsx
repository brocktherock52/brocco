import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'Terms of service for brocco.ai. Plain-language summary up top.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-24">
        <div className="container-x max-w-3xl">
          <p className="pill">Terms of service</p>
          <h1 className="mt-5 text-display-lg text-grad">Use brocco fairly. We will too.</h1>
          <p className="mt-4 text-[15px] text-ink-dim">Last updated: 2026-05-05.</p>

          <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Plain-language summary</h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] text-ink-dim">
              <li>You own your prompts and outputs.</li>
              <li>You agree not to use brocco for illegal, abusive, or anti-competitive automation.</li>
              <li>We can suspend accounts that violate Anthropic's or our usage policies.</li>
              <li>Cancel anytime. Pro-rated refund on the unused portion.</li>
              <li>The service is provided as-is. We will fix bugs but cannot guarantee zero downtime.</li>
            </ul>
          </div>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink-dim">
            <Section title="1. Account">
              <p>You must be 18+ to use brocco. You are responsible for keeping your account credentials and BYOK secret. We are not liable for losses from a compromised key on your end.</p>
            </Section>
            <Section title="2. Acceptable use">
              <p>No spam, harassment, malware, scraping behind authentication, generating illegal content, or violating third-party rights. We follow <a href="https://www.anthropic.com/legal/aup" className="text-cyan-glow underline-offset-4 hover:underline">Anthropic's AUP</a>.</p>
            </Section>
            <Section title="3. Billing">
              <p>Paid plans bill in advance via Stripe. Annual plans are paid upfront. Overages on Solo/Team are billed at $0.05 / $0.03 per run respectively unless you set a hard cap. You can cancel from the customer portal at any time.</p>
            </Section>
            <Section title="4. Service availability">
              <p>We target 99.9% uptime on paid tiers. Live status at the security page. Free tier is best-effort.</p>
            </Section>
            <Section title="5. IP and data">
              <p>You retain all rights to inputs and outputs. We grant you a non-exclusive license to use the brocco software for the duration of your subscription. Your data never trains a model.</p>
            </Section>
            <Section title="6. Termination">
              <p>Either party may terminate at any time. We will refund the unused pro-rated portion of paid plans on cancellation in good standing.</p>
            </Section>
            <Section title="7. Liability">
              <p>To the fullest extent permitted by law, our total liability is capped at the amount you paid in the prior 12 months. We are not liable for indirect or consequential damages.</p>
            </Section>
            <Section title="8. Governing law">
              <p>Delaware, USA. Disputes resolved in the state and federal courts of New Castle County, DE.</p>
            </Section>
            <Section title="9. Contact">
              <p><a className="text-cyan-glow underline-offset-4 hover:underline" href="mailto:legal@brocco.ai">legal@brocco.ai</a></p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[18px] font-semibold tracking-tight text-white">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

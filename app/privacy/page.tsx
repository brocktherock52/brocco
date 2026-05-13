import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy policy for brocco.ai — what we collect, what we do not, and how we keep your data yours.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-24">
        <div className="container-x max-w-3xl">
          <p className="pill">Privacy</p>
          <h1 className="mt-5 text-display-lg text-grad">Your data is yours.</h1>
          <p className="mt-4 text-[15px] text-ink-dim">Last updated: 2026-05-05.</p>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink-dim">
            <Section title="What we collect">
              <p>The minimum to run the product. Anonymous analytics (page views, web vitals via Vercel) and, if you create an account, the email tied to your Stripe customer.</p>
            </Section>
            <Section title="What we never collect">
              <p>Your prompts. On the free tier, prompts go from your browser directly to your model provider. On paid tiers, our hosted runtime calls Anthropic with zero-data-retention enabled. We never log prompt content after a run completes.</p>
            </Section>
            <Section title="Bring your own key (BYOK)">
              <p>Keys you paste into the dashboard are stored in your browser's localStorage only. They never reach our servers. Clear them anytime from the BYOK panel.</p>
            </Section>
            <Section title="Cookies">
              <p>One first-party cookie tracks free demo runs to enforce the daily limit. No third-party tracking cookies, ever.</p>
            </Section>
            <Section title="Subprocessors">
              <p>Vercel (hosting), Anthropic (LLM), Stripe (billing), Tavily (search-tool only when enabled). All SOC 2 certified.</p>
            </Section>
            <Section title="Your rights (GDPR / CCPA)">
              <p>Email <a className="text-cyan-glow underline-offset-4 hover:underline" href="mailto:privacy@brocco.dev">privacy@brocco.dev</a> to access, correct, export, or delete your data. We respond within 30 days.</p>
            </Section>
            <Section title="Children">
              <p>Brocco is not intended for users under 16. We do not knowingly collect data from children.</p>
            </Section>
            <Section title="Changes">
              <p>We will post material changes here and (for paid customers) email you 30 days before they take effect.</p>
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

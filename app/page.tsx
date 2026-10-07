// ISR: re-generate the home page HTML at most every 5 minutes. The page is
// marketing content that doesn't change per-request, so ISR + edge cache keeps
// TTFB low under a viral spike instead of running React server rendering on
// every visitor.
export const revalidate = 300;

import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { HeroBento } from '@/components/hero-bento';
import { BroadcastConsole } from '@/components/hero-demo';
import { ScrollAgents } from '@/components/scroll-agents';
// Removed 2026-05-22: MorningRoutine + AgentsBento + AgentCast + BroccoFactory
// are now folded into <TheTeam /> and <FactoryWalkthrough />. HowItWorks
// dropped (contradicted the nine-specialists promise with a "three agents"
// headline). Source files remain in components/ for reference.
import { TheTeam } from '@/components/the-team';
import { FactoryWalkthrough } from '@/components/factory-walkthrough';
import { Features } from '@/components/features';
import { Capabilities } from '@/components/capabilities';
import { SocialProof } from '@/components/social-proof';
import { Pricing } from '@/components/pricing';
import { Faq } from '@/components/faq';
import { FinalCta } from '@/components/final-cta';
import { Footer } from '@/components/footer';
import { SectionReveal } from '@/components/section-reveal';

// Homepage conversion actions all lead to account creation and the dashboard preview.

// The title + description are inherited from the root layout default (the
// layout title template appends "- brocco.dev", so setting a string title here
// would double-brand). We only add the self-canonical the home page was
// missing, which the audit flagged as the one real SEO gap.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <Nav />
      <ScrollAgents />
      <main>
        <HeroBento />
        <BroadcastConsole />
        <SectionReveal>
          <TheTeam />
        </SectionReveal>
        {/* Pricing moved up: the goal is to convert visitors to paid, so the offer
            is shown right after the demo + team value, not buried near the footer. */}
        <SectionReveal>
          <Pricing hostedAvailable={Boolean(process.env.ANTHROPIC_API_KEY)} />
        </SectionReveal>
        <SectionReveal>
          <Capabilities />
        </SectionReveal>
        <SectionReveal>
          <Features />
        </SectionReveal>
        <FactoryWalkthrough />
        <SectionReveal>
          <SocialProof />
        </SectionReveal>
        <SectionReveal>
          <Faq />
        </SectionReveal>
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

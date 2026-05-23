// ISR: re-generate the home page HTML at most every 5 minutes. The page is
// marketing content that doesn't change per-request, so ISR + edge cache keeps
// TTFB low under a viral spike instead of running React server rendering on
// every visitor.
export const revalidate = 300;

import { Nav } from '@/components/nav';
import { HeroBento } from '@/components/hero-bento';
import { ScrollAgents } from '@/components/scroll-agents';
// Removed 2026-05-22: MorningRoutine + AgentsBento + AgentCast + BroccoFactory
// are now folded into <TheTeam /> and <FactoryWalkthrough />. HowItWorks
// dropped (contradicted the nine-specialists promise with a "three agents"
// headline). Source files remain in components/ for reference.
import { TheTeam } from '@/components/the-team';
import { FactoryWalkthrough } from '@/components/factory-walkthrough';
import { Features } from '@/components/features';
import { SocialProof } from '@/components/social-proof';
import { Pricing } from '@/components/pricing';
import { Faq } from '@/components/faq';
import { FinalCta } from '@/components/final-cta';
import { Footer } from '@/components/footer';
import { SectionReveal } from '@/components/section-reveal';

// Site map after 26 rounds of polish:
// 1. Hero (bento)        2. The Team        3. Factory walkthrough
// 4. Features (the moat) 5. Pricing         6. Social proof
// 7. FAQ                 8. Final CTA

export default function HomePage() {
  return (
    <>
      <Nav />
      <ScrollAgents />
      <main>
        <HeroBento />
        <SectionReveal>
          <TheTeam />
        </SectionReveal>
        <FactoryWalkthrough />
        <SectionReveal>
          <Features />
        </SectionReveal>
        <SectionReveal>
          <Pricing />
        </SectionReveal>
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

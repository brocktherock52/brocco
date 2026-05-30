// ISR: re-generate the home page HTML at most every 5 minutes. The page is
// marketing content that doesn't change per-request, so ISR + edge cache keeps
// TTFB low under a viral spike instead of running React server rendering on
// every visitor.
export const revalidate = 300;

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
import { MissionControlCta } from '@/components/mission-control-cta';
import { SocialProof } from '@/components/social-proof';
import { Pricing } from '@/components/pricing';
import { Faq } from '@/components/faq';
import { FinalCta } from '@/components/final-cta';
import { Footer } from '@/components/footer';
import { SectionReveal } from '@/components/section-reveal';

// Homepage order, re-sequenced for conversion (2026-05-30). Research basis:
// (1) lead with the product experience (hero + live demo) because the interactive
// BroadcastConsole is the strongest "aha" asset (CRO audit finding); (2) show the
// team / value once; (3) surface PRICING early (moved up from #7 to #4) so
// high-intent buyers see the offer without digging, which is the standard
// high-converting SaaS pattern (Linear/Vercel-style: demo -> value -> price);
// (4) then the broad capabilities ("one team does everything" = the powerhouse
// pitch) and a slot for Mission Control; (5) deeper moat + objection handling
// last. Heavy autoplay media (factory) is deferred down the page so it does not
// compete with first paint. Validated by build + visual QA (live A/B pending the
// PostHog wiring flagged in the audit).
//   1. Hero        2. Live demo     3. The team
//   4. Pricing     5. Capabilities  6. (Mission Control)
//   7. Features    8. Factory       9. Social proof   10. FAQ   11. Final CTA

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
          <Pricing />
        </SectionReveal>
        <SectionReveal>
          <Capabilities />
        </SectionReveal>
        <SectionReveal>
          <MissionControlCta />
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

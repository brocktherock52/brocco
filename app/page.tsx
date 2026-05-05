import { Nav } from '@/components/nav';
import { Hero } from '@/components/hero';
import { AgentsGrid } from '@/components/agents-grid';
import { HowItWorks } from '@/components/how-it-works';
import { Integrations } from '@/components/integrations';
import { SocialProof } from '@/components/social-proof';
import { Pricing } from '@/components/pricing';
import { Faq } from '@/components/faq';
import { FinalCta } from '@/components/final-cta';
import { Footer } from '@/components/footer';

/**
 * Claude-design homepage. 7 sections, not 13. Editorial pacing > feature
 * dump. The cut sections (Wedge, ProductCards, WhyWeBuilt, Features,
 * Personas) live on /about for visitors who want the depth, surfaced via
 * the nav. The home page now reads:
 *   1. Hero          — one promise, one CTA, one terminal proof
 *   2. AgentsGrid    — the product itself, not a marketing card
 *   3. HowItWorks    — three steps, dashboard mock
 *   4. Integrations  — works with what you already use
 *   5. SocialProof   — trust + testimonials
 *   6. Pricing       — the buy decision
 *   7. Faq + FinalCta — close
 */
export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <AgentsGrid />
        <HowItWorks />
        <Integrations />
        <SocialProof />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

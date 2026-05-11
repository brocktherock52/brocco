import { Nav } from '@/components/nav';
import { HeroBento } from '@/components/hero-bento';
import { AgentsBento } from '@/components/agents-bento';
import { AgentCast } from '@/components/agent-cast';
import { SurfacesFilmstrip } from '@/components/surfaces-filmstrip';
import { HowItWorks } from '@/components/how-it-works';
import { Wedge } from '@/components/wedge';
import { Integrations } from '@/components/integrations';
import { WhyWeBuilt } from '@/components/why-we-built';
import { Features } from '@/components/features';
import { SocialProof } from '@/components/social-proof';
import { Personas } from '@/components/personas';
import { Pricing } from '@/components/pricing';
import { Faq } from '@/components/faq';
import { FinalCta } from '@/components/final-cta';
import { Footer } from '@/components/footer';
import { SectionReveal } from '@/components/section-reveal';
import { ScrollMarquee } from '@/components/scroll-marquee';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        {/* 1. Bento hero — instantly different at first glance */}
        <HeroBento />

        {/* 2. Editorial type moment: pulls eye, sets cadence */}
        <ScrollMarquee phrase="broadcast one prompt." accent="run nine specialists." />

        {/* 3. Asymmetric bento of 9 specialists */}
        <SectionReveal>
          <AgentsBento />
        </SectionReveal>

        {/* 4. Character vignettes for each agent (kept as-is, strong) */}
        <SectionReveal>
          <AgentCast />
        </SectionReveal>

        {/* 5. Horizontal scroll-tied filmstrip of the 6 surfaces */}
        <SurfacesFilmstrip />

        {/* 6. How it works (mock dashboard + 3 steps) */}
        <SectionReveal>
          <HowItWorks />
        </SectionReveal>

        {/* 7. Editorial type moment #2 */}
        <ScrollMarquee phrase="audit · stream · cache · byok" accent="ship in 11 minutes." />

        {/* 8. The wedge / moat */}
        <SectionReveal>
          <Wedge />
        </SectionReveal>

        {/* 9. Integrations (spotlight cards) */}
        <SectionReveal>
          <Integrations />
        </SectionReveal>

        {/* 10. Why we built this */}
        <SectionReveal>
          <WhyWeBuilt />
        </SectionReveal>

        {/* 11. Features grid (spotlight cards) */}
        <SectionReveal>
          <Features />
        </SectionReveal>

        {/* 12. Testimonials + logos */}
        <SectionReveal>
          <SocialProof />
        </SectionReveal>

        {/* 13. Personas */}
        <SectionReveal>
          <Personas />
        </SectionReveal>

        {/* 14. Pricing — animated number + sliding pill */}
        <SectionReveal>
          <Pricing />
        </SectionReveal>

        {/* 15. FAQ */}
        <SectionReveal>
          <Faq />
        </SectionReveal>

        {/* 16. Final CTA — magnetic + breathing orbs */}
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

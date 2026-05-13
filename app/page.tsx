import { Nav } from '@/components/nav';
import { HeroBento } from '@/components/hero-bento';
import { ScrollAgents } from '@/components/scroll-agents';
import { MorningRoutine } from '@/components/morning-routine';
import { AgentsBento } from '@/components/agents-bento';
import { AgentCast } from '@/components/agent-cast';
import { BroccoFactory } from '@/components/brocco-factory';
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

export default function HomePage() {
  return (
    <>
      <Nav />
      {/* SIGNATURE FEATURE — the agents follow the visitor down the page
          and visibly build each section as it scrolls into view. Every
          visitor becomes a live witness to the agents working. */}
      <ScrollAgents />
      <main>
        {/* 1. Bento hero — instantly different at first glance */}
        <HeroBento />

        {/* 2. Daily-essential pitch — "open the app, your team already worked" */}
        <SectionReveal>
          <MorningRoutine />
        </SectionReveal>

        {/* 4. Asymmetric bento of 9 specialists */}
        <SectionReveal>
          <AgentsBento />
        </SectionReveal>

        {/* 4. Character vignettes for each agent (kept as-is, strong) */}
        <SectionReveal>
          <AgentCast />
        </SectionReveal>

        {/* 5. The brocco factory — endless conveyor belt of specialists */}
        <SectionReveal>
          <BroccoFactory />
        </SectionReveal>

        {/* 6. How it works (mock dashboard + 3 steps) */}
        <SectionReveal>
          <HowItWorks />
        </SectionReveal>

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

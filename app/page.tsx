import { Nav } from '@/components/nav';
import { ScrollHero } from '@/components/scroll-hero';
import { AgentsGrid } from '@/components/agents-grid';
import { ProductCards } from '@/components/product-cards';
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
      <main>
        <ScrollHero />
        <SectionReveal>
          <AgentsGrid />
        </SectionReveal>
        <SectionReveal>
          <ProductCards />
        </SectionReveal>
        <SectionReveal>
          <HowItWorks />
        </SectionReveal>
        <SectionReveal>
          <Wedge />
        </SectionReveal>
        <SectionReveal>
          <Integrations />
        </SectionReveal>
        <SectionReveal>
          <WhyWeBuilt />
        </SectionReveal>
        <SectionReveal>
          <Features />
        </SectionReveal>
        <SectionReveal>
          <SocialProof />
        </SectionReveal>
        <SectionReveal>
          <Personas />
        </SectionReveal>
        <SectionReveal>
          <Pricing />
        </SectionReveal>
        <SectionReveal>
          <Faq />
        </SectionReveal>
        <SectionReveal>
          <FinalCta />
        </SectionReveal>
      </main>
      <Footer />
    </>
  );
}

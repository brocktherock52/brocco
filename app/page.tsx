import { Nav } from '@/components/nav';
import { Hero } from '@/components/hero';
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

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <AgentsGrid />
        <ProductCards />
        <HowItWorks />
        <Wedge />
        <Integrations />
        <WhyWeBuilt />
        <Features />
        <SocialProof />
        <Personas />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

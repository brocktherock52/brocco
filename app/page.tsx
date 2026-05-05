import { Nav } from '@/components/nav';
import { Hero } from '@/components/hero';
import { HowItWorks } from '@/components/how-it-works';
import { Wedge } from '@/components/wedge';
import { Integrations } from '@/components/integrations';
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
        <HowItWorks />
        <Wedge />
        <Integrations />
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

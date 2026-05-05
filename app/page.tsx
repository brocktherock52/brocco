import { Nav } from '@/components/nav';
import { Hero } from '@/components/hero';
import { SocialProof } from '@/components/social-proof';
import { Pricing } from '@/components/pricing';
import { FinalCta } from '@/components/final-cta';
import { Footer } from '@/components/footer';

/**
 * v3.0 acquisition-shape homepage. 4 sections, obsessive focus on the
 * one decision: open the app or buy. Everything else (agents catalog,
 * integrations grid, FAQ, how-it-works, why-we-built, personas) lives
 * on /about, /pricing, /docs and is footer-linked.
 *
 * The hero IS the product proof — live brand-icon trust strip, real
 * curl block, dual CTAs. We sell by SHOWING, not telling.
 */
export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SocialProof />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

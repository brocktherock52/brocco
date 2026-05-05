import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Wedge } from '@/components/wedge';
import { ProductCards } from '@/components/product-cards';
import { WhyWeBuilt } from '@/components/why-we-built';
import { Features } from '@/components/features';
import { Personas } from '@/components/personas';
import { FinalCta } from '@/components/final-cta';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'about',
  description:
    'why brocco exists, the wedge, six things every agent runtime should ship, and the three people we built it for.',
  alternates: { canonical: '/about' },
};

/**
 * Long-form depth page for visitors who want the full editorial story
 * cut from the home page in v2.12. Renders the components removed from
 * /, in editorial order: wedge → why we built → product surfaces →
 * features → personas → cta.
 */
export default function AboutPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative pt-32 pb-12 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-radial-glow" />
          <div className="container-x text-center">
            <p className="pill mx-auto">about</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-display-xl lowercase">
              <span className="text-grad">the agentic dashboard</span>{' '}
              <span className="text-grad-brand">we wanted to use.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[16px] text-ink-dim">
              brocco is the runtime + dashboard for everyone who already lives in claude, chatgpt, and cursor and wants to stop tab-switching. here is the wedge, the surfaces, and the people we built it for.
            </p>
          </div>
        </section>

        <Wedge />
        <ProductCards />
        <WhyWeBuilt />
        <Features />
        <Personas />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

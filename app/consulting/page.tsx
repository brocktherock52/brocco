import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { ConsultingHero } from '@/components/consulting/consulting-hero';
import { Methodology } from '@/components/consulting/methodology';
import { CaseStudies } from '@/components/consulting/case-studies';
import { RoiCalculator } from '@/components/consulting/roi-calculator';
import { EngagementTiers } from '@/components/consulting/engagement-tiers';
import { IntakeForm } from '@/components/consulting/intake-form';

const TITLE = 'Brocco Studio - custom AI automation for your business';
const DESCRIPTION =
  'A high-touch AI consulting arm: we map the manual work draining your team, then build and run a coordinated team of nine specialist agents to do it. Discover, Build, Deploy, Govern. Book an AI audit.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/consulting' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://brocco.dev/consulting',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ConsultingPage() {
  return (
    <>
      <Nav />
      <main>
        <ConsultingHero />
        <Methodology />
        <CaseStudies />
        <RoiCalculator />
        <EngagementTiers />
        <IntakeForm />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Pricing } from '@/components/pricing';
import { Faq } from '@/components/faq';
import { Integrations } from '@/components/integrations';
import { FinalCta } from '@/components/final-cta';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Pricing - Solo and Team with a 7-day dashboard preview',
  description:
    'Preview the dashboard for seven days with a card on file. Solo $49/month or $490/year; Team $199/month or $1,990/year. Live tools require a paid subscription.',
  alternates: { canonical: '/pricing' },
};

// Note: the root layout (app/layout.tsx) already emits a site-wide
// SoftwareApplication + Offer graph (Solo/Team), so we do NOT repeat it
// here. This page only adds the FAQPage schema via <Faq />.
export default function PricingPage() {
  const hostedAvailable = Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <>
      <Nav />
      <main>
        <Pricing standalone hostedAvailable={hostedAvailable} />
        <ComparisonTable hostedAvailable={hostedAvailable} />
        <Integrations />
        <Faq hostedAvailable={hostedAvailable} />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

function ComparisonTable({ hostedAvailable }: { hostedAvailable: boolean }) {
  const rows: { label: string; values: (string | boolean)[] }[] = [
    { label: 'Dashboard preview', values: ['7 days', '7 days'] },
    { label: 'Card required for trial', values: [true, true] },
    { label: 'Live tools during preview', values: [false, false] },
    ...(hostedAvailable ? [
      { label: 'Monthly hosted agent runs on paid plan', values: ['2,000', '10,000'] },
      { label: 'Daily hosted fair-use limit (per agent)', values: ['100 runs / day', '500 runs / day'] },
    ] : [
      { label: 'Live model access', values: ['Your API key required', 'Your API key required'] },
      { label: 'Provider usage', values: ['Billed separately by your provider', 'Billed separately by your provider'] },
    ]),
    { label: 'Seats', values: ['1', '5'] },
    { label: 'Monthly billing after preview', values: ['$49 / month', '$199 / month'] },
    { label: 'Annual billing after preview', values: ['$490 / year', '$1,990 / year'] },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <h2 className="text-center text-display-lg text-grad">Compare the plans</h2>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <table className="w-full text-left text-[13.5px]">
            <thead className="border-b border-white/[0.06] bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-wider text-ink-faint">Feature</th>
                <th className="px-4 py-3.5 font-semibold">Solo</th>
                <th className="px-4 py-3.5 font-semibold text-brand-glow">Team</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-4 py-3 text-ink-dim">{r.label}</td>
                  {r.values.map((v, i) => (
                    <td key={i} className="px-4 py-3 text-ink">
                      {v === true ? (
                        <span className="text-emerald-400">✓</span>
                      ) : v === false ? (
                        <span className="text-ink-faint">-</span>
                      ) : (
                        <span>{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Pricing } from '@/components/pricing';
import { Faq } from '@/components/faq';
import { FinalCta } from '@/components/final-cta';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Pricing - simple, transparent, free to start',
  description:
    'Free tier with BYOK forever. Solo $49/mo, Team $199/mo. Annual save 17%. Enterprise custom. Cancel anytime.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main>
        <Pricing standalone />
        <ComparisonTable />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

function ComparisonTable() {
  const rows: { label: string; values: (string | boolean)[] }[] = [
    { label: 'Monthly runs', values: ['100 (BYOK)', '2,000', '10,000', 'Unlimited'] },
    { label: 'Agents in parallel', values: ['1', '5', 'Unlimited', 'Unlimited'] },
    { label: 'BYOK', values: [true, true, true, true] },
    { label: 'JSONL audit trail', values: [true, true, true, true] },
    { label: 'Recipes gallery', values: [true, true, true, true] },
    { label: 'Tokens covered', values: [false, true, true, true] },
    { label: 'Custom Python tools', values: [false, true, true, true] },
    { label: 'Seats', values: ['1', '1', '5', 'Unlimited'] },
    { label: 'SSO + audit logs', values: [false, false, true, true] },
    { label: 'SOC 2 Type II report', values: [false, false, false, true] },
    { label: 'On-prem / air-gap', values: [false, false, false, true] },
    { label: 'SLA', values: ['Community', 'Email', '1-hour', 'Custom'] },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <h2 className="text-center text-display-lg text-grad">Compare every tier</h2>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <table className="w-full text-left text-[13.5px]">
            <thead className="border-b border-white/[0.06] bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3.5 font-mono text-[11px] uppercase tracking-wider text-ink-faint">Feature</th>
                <th className="px-4 py-3.5 font-semibold">Free</th>
                <th className="px-4 py-3.5 font-semibold">Solo</th>
                <th className="px-4 py-3.5 font-semibold text-brand-glow">Team</th>
                <th className="px-4 py-3.5 font-semibold">Enterprise</th>
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
                        <span className="text-ink-faint">—</span>
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

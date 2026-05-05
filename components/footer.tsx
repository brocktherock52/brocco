import Link from 'next/link';
import { Logomark } from './logo';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-bg-1/40 py-14">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logomark className="h-6 w-12 text-brand-glow" />
              <span className="text-[15px] font-semibold tracking-tight">
                brocco<span className="text-ink-faint">.ai</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-[13.5px] text-ink-dim">
              The agentic OS for businesses that ship. Built on Claude. Wired into your stack.
            </p>
          </div>

          <FooterCol title="Product" links={[
            { href: '/#how', label: 'How it works' },
            { href: '/#features', label: 'Features' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/app', label: 'Open the app' },
            { href: '/download', label: 'Download' },
            { href: '/changelog', label: 'Changelog' },
          ]} />
          <FooterCol title="Developers" links={[
            { href: '/docs', label: 'Docs' },
            { href: '/security', label: 'Security' },
            { href: '/api/v1/agents', label: 'API reference' },
            { href: 'https://github.com/brocktherock52/bdp-consulting', label: 'GitHub' },
          ]} />
          <FooterCol title="Company" links={[
            { href: 'mailto:hello@brocco.ai', label: 'hello@brocco.ai' },
            { href: 'mailto:hello@brocco.ai?subject=Brocco%20demo%20request', label: 'Book a demo' },
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
          ]} />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 text-[12.5px] text-ink-faint md:flex-row md:items-center">
          <span>© 2026 brocco.ai - a BDP Consulting product</span>
          <span className="font-mono text-[11px]">made with Claude</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-faint">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[13.5px] text-ink-dim transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from 'next/link';
import { Logomark } from './logo';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-bg-1/40 py-14">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logomark className="h-7 w-7" />
              <span className="text-[15px] font-semibold tracking-tight">
                brocco<span className="text-ink-faint">.ai</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-[13.5px] text-ink-dim">
              the agentic os for businesses that ship. built on claude. wired into your stack.
            </p>
          </div>

          <FooterCol title="product" links={[
            { href: '/#how', label: 'how it works' },
            { href: '/#features', label: 'features' },
            { href: '/pricing', label: 'pricing' },
            { href: '/app', label: 'open the app' },
            { href: '/download', label: 'download' },
            { href: '/blog', label: 'blog' },
            { href: '/changelog', label: 'changelog' },
          ]} />
          <FooterCol title="developers" links={[
            { href: '/docs', label: 'docs' },
            { href: '/security', label: 'security' },
            { href: '/api/v1/agents', label: 'api reference' },
            { href: 'https://github.com/brocktherock52/brocco', label: 'github' },
          ]} />
          <FooterCol title="company" links={[
            { href: '/about', label: 'about' },
            { href: '/threads', label: 'threads' },
            { href: 'mailto:help@brocco.dev', label: 'help@brocco.dev' },
            { href: 'https://calendly.com/brockpivec/', label: 'book a demo' },
            { href: '/privacy', label: 'privacy' },
            { href: '/terms', label: 'terms' },
          ]} />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 text-[12.5px] text-ink-faint md:flex-row md:items-center">
          <span>© 2026 brocco.ai · a bdp consulting product</span>
          <span className="font-mono text-[11px]">made with claude</span>
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

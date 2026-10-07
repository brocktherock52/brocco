import Link from 'next/link';
import { Logomark } from './logo';
import {
  TikTokIcon,
  InstagramIcon,
  XIcon,
  LinkedInIcon,
  ThreadsIcon,
  YouTubeIcon,
  FacebookIcon,
  PinterestIcon,
  RedditIcon,
  SnapchatIcon,
  DiscordIcon,
} from './brand-icons';

// Social handles. Verified 2026-05-27 against the live Ayrshare /user response
// (so these are the accounts we actually post to). brocco.dev is the brand
// handle on every video/social-feed platform; X + Reddit use @broccoai
// (handle was taken on those). YouTube channel handle still TBD, flagged in
// the URL below; update once the founder confirms the @-handle.
const SOCIALS = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@brocco.dev', Icon: TikTokIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/brocco.dev', Icon: InstagramIcon },
  { label: 'X', href: 'https://x.com/broccoai', Icon: XIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/@brocco.dev', Icon: YouTubeIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/brocco.dev', Icon: LinkedInIcon },
  { label: 'Threads', href: 'https://www.threads.com/@brocco.dev', Icon: ThreadsIcon },
  { label: 'Facebook', href: 'https://www.facebook.com/brocco.dev', Icon: FacebookIcon },
  { label: 'Pinterest', href: 'https://www.pinterest.com/brocco.dev', Icon: PinterestIcon },
  { label: 'Reddit', href: 'https://www.reddit.com/user/broccoai', Icon: RedditIcon },
  { label: 'Snapchat', href: 'https://www.snapchat.com/add/brocco.dev', Icon: SnapchatIcon },
  { label: 'Discord', href: 'https://discord.gg/v5j37wwkjn', Icon: DiscordIcon },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-bg-1/40 py-14">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            {/* Bigger logomark + wordmark so the brand reads from across the
                page. Brand identity pass 2026-05-27. */}
            <Link href="/" className="inline-flex items-center gap-3" aria-label="brocco home">
              <Logomark className="h-12 w-12" />
              <span className="text-[24px] font-semibold tracking-tight leading-none">
                brocco<span className="text-ink-faint">.dev</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[13.5px] text-ink-dim">
              your AI workspace. research, plans, and drafts with Anthropic Claude or xAI Grok.
            </p>
            <p className="mt-3 max-w-xs font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              a BDP Industries product
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

        {/* Social row */}
        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-white/[0.06] pt-6">
          <span className="mr-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            follow
          </span>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-ink-dim transition-all hover:border-white/[0.2] hover:bg-white/[0.07] hover:text-white"
            >
              <s.Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-[12.5px] text-ink-faint md:flex-row md:items-center">
          <span>© 2026 brocco.dev · a BDP Industries product</span>
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

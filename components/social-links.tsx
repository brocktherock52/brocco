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
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

/**
 * Shared social presence (consultant + founder note 2026-06-02: make social
 * prominent, not hidden in the footer). One source of truth for handles, used
 * in the nav (top of every page) + the mobile menu + anywhere a follow row
 * belongs. Handles verified against the live Ayrshare accounts.
 */
export interface Social {
  label: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
}

export const SOCIALS: Social[] = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@brocco.dev', Icon: TikTokIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/brocco.dev', Icon: InstagramIcon },
  { label: 'X', href: 'https://x.com/broccoai', Icon: XIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/@brocco.dev', Icon: YouTubeIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/brocco.dev', Icon: LinkedInIcon },
  { label: 'Threads', href: 'https://www.threads.com/@brocco.dev', Icon: ThreadsIcon },
  { label: 'Discord', href: 'https://discord.gg/v5j37wwkjn', Icon: DiscordIcon },
  { label: 'Facebook', href: 'https://www.facebook.com/brocco.dev', Icon: FacebookIcon },
  { label: 'Pinterest', href: 'https://www.pinterest.com/brocco.dev', Icon: PinterestIcon },
  { label: 'Reddit', href: 'https://www.reddit.com/user/broccoai', Icon: RedditIcon },
  { label: 'Snapchat', href: 'https://www.snapchat.com/add/brocco.dev', Icon: SnapchatIcon },
];

/** The handful we lead with where space is tight (nav). */
export const TOP_SOCIALS = SOCIALS.slice(0, 5);

/**
 * Fixed vertical social rail pinned to the right edge, desktop only. Gives the
 * social presence a persistent, prominent home on every marketing page WITHOUT
 * crowding the nav (founder note 2026-06-02). Mounted inside <Nav/> so it never
 * appears on the no-nav ad landers. A subtle glass pill; labels reveal on hover.
 */
export function SocialRail() {
  return (
    <div className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-full border border-white/[0.08] bg-bg-1/70 px-1.5 py-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <span className="mb-0.5 font-mono text-[8.5px] uppercase tracking-[0.2em] text-ink-faint [writing-mode:vertical-rl]">
          follow
        </span>
        {TOP_SOCIALS.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`brocco on ${label}`}
            title={label}
            className="group inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <Icon className="h-[15px] w-[15px]" />
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * A compact row of social icon links. `items` defaults to the lead set; pass
 * SOCIALS for the full list. Each link opens in a new tab.
 */
export function SocialLinks({
  items = TOP_SOCIALS,
  className,
  iconClassName,
  size = 'sm',
}: {
  items?: Social[];
  className?: string;
  iconClassName?: string;
  size?: 'sm' | 'md';
}) {
  const box = size === 'md' ? 'h-9 w-9' : 'h-8 w-8';
  const icon = size === 'md' ? 'h-4 w-4' : 'h-[15px] w-[15px]';
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {items.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`brocco on ${label}`}
          title={label}
          className={cn(
            'inline-flex items-center justify-center rounded-full text-ink-dim outline-none transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan/50',
            box,
          )}
        >
          <Icon className={cn(icon, iconClassName)} />
        </a>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Boxes,
  Briefcase,
  ChevronDown,
  Compass,
  Cpu,
  Download,
  GitBranch,
  Hammer,
  Layers,
  Menu,
  Plug,
  ScrollText,
  Search,
  Sparkles,
  Swords,
  TerminalSquare,
  Users,
  Workflow,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { Logomark } from './logo';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/auth-client';
import { SocialLinks, SocialRail, SOCIALS } from './social-links';

interface MegaItem {
  href: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

const PRODUCT: MegaItem[] = [
  { href: '/mission-control', label: 'mission control', desc: 'the operator add-on, run every venture', Icon: Workflow },
  { href: '/app', label: 'dashboard', desc: 'multi-agent panes, broadcast mode', Icon: Boxes },
  { href: '/agents', label: 'the cast', desc: 'your AI team, one prompt', Icon: Cpu },
  { href: '/capabilities', label: 'capabilities', desc: 'sites, content, outreach, intel, ops', Icon: Sparkles },
  { href: '/tools', label: 'tools', desc: '13 typed interfaces, audit-logged', Icon: Wrench },
  { href: '/recipes', label: 'recipes', desc: '11 broadcast patterns', Icon: Sparkles },
  { href: '/integrations', label: 'integrations', desc: 'anthropic, openai, ollama, slack, more', Icon: Plug },
  { href: '/download#mcp-setup', label: 'mcp server', desc: 'inside claude desktop + cursor', Icon: TerminalSquare },
];

const SOLUTIONS: MegaItem[] = [
  { href: '/real-estate', label: 'real estate', desc: 'wholesalers, investors, agents', Icon: Boxes },
  { href: '/for/founders', label: 'founders', desc: 'ship more without hiring', Icon: Compass },
  { href: '/for/agencies', label: 'agencies', desc: 'bill more, work less', Icon: Layers },
  { href: '/for/ops-leads', label: 'ops leads', desc: 'silent ops on autopilot', Icon: Workflow },
  { href: '/for/sales-ops', label: 'sales ops', desc: 'pipeline + reply triage', Icon: Briefcase },
  { href: '/for/recruiters', label: 'recruiters', desc: 'sourcing + screening + outreach', Icon: Users },
  { href: '/for/marketers', label: 'marketers', desc: 'content cadence at scale', Icon: Zap },
  { href: '/for/wholesalers', label: 'wholesalers', desc: 'find. pitch. close.', Icon: Hammer },
  { href: '/for/land-investors', label: 'land investors', desc: 'pull parcels, price, offer', Icon: Compass },
  { href: '/for/creative-finance-investors', label: 'creative finance', desc: 'subto, seller-finance, wraps', Icon: Briefcase },
  { href: '/for/real-estate-agents', label: 'real estate agents', desc: 'CMAs, listings, follow-up', Icon: Users },
];

const DEVELOPERS: MegaItem[] = [
  { href: '/docs', label: 'docs', desc: 'agents, tools, recipes, mcp, rest', Icon: Boxes },
  { href: '/api/v1/agents', label: 'api reference', desc: 'live /api/v1 endpoint', Icon: TerminalSquare, external: true },
  { href: '/download', label: 'install / pwa', desc: 'mac, windows, mobile', Icon: Download },
  { href: 'https://github.com/brocktherock52/brocco', label: 'github (public)', desc: 'open-source mirror', Icon: GitBranch, external: true },
  { href: '/blog', label: 'blog', desc: 'field notes from production agents', Icon: ScrollText },
  { href: '/changelog', label: 'changelog', desc: 'every version, dated, no spin', Icon: ScrollText },
];

const COMPARE: MegaItem[] = [
  { href: '/vs/cursor', label: 'vs cursor', desc: 'agentic dashboard vs ide', Icon: Swords },
  { href: '/vs/zapier', label: 'vs zapier', desc: 'reasoning vs deterministic', Icon: Swords },
  { href: '/vs/devin', label: 'vs devin', desc: 'parallel panes vs autonomous swe', Icon: Swords },
  { href: '/vs/n8n', label: 'vs n8n', desc: 'agents vs node graphs', Icon: Swords },
  { href: '/vs/crewai', label: 'vs crewai', desc: 'hosted dashboard vs python framework', Icon: Swords },
];

interface MegaSpec {
  label: string;
  items: MegaItem[];
  width: string;
}

const MEGAS: MegaSpec[] = [
  { label: 'product', items: PRODUCT, width: 'w-[480px]' },
  { label: 'solutions', items: SOLUTIONS, width: 'w-[480px]' },
  { label: 'developers', items: DEVELOPERS, width: 'w-[460px]' },
  { label: 'compare', items: COMPARE, width: 'w-[420px]' },
];

// Only the destinations that live nowhere else in the bar. `capabilities`
// already sits in the product mega and `blog` in the developers mega, so
// surfacing them here too just bloated the center cluster until it overflowed
// its track and overlapped the brand + actions. Keep the two unique pages.
const SIMPLE = [
  { href: '/consulting', label: 'consulting' },
  { href: '/pricing', label: 'pricing' },
];

function openPalette() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }),
    );
  }
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  // Reflect the session everywhere the marketing nav appears, so a signed-in
  // user landing back on the home page sees "account / open app" instead of
  // "sign in / start trial". The cookie keeps the session across pages;
  // this just renders it.
  const { data: session } = useSession();
  const signedIn = !!session?.user;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setOpenMega(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function enter(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMega(label);
  }
  function leave() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMega(null), 120);
  }

  const lifted = scrolled || openMega;

  return (
    <>
    <SocialRail />
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        // Mobile keeps a near-opaque solid bar (cheap to paint). backdrop-blur is
        // only enabled at lg+ (desktop) because re-rasterizing a blurred bar over
        // the animated cosmic background every scroll frame is what made phones
        // stutter as you scroll.
        lifted
          ? 'bg-bg-0/90 lg:bg-bg-0/70 lg:backdrop-blur-xl lg:backdrop-saturate-150'
          : 'bg-transparent',
      )}
      onMouseLeave={leave}
    >
      {/* Hairline neon underglow, fades in on scroll. Teal to magenta, the
          Bebop/cyberpunk accent. Sits flush to the bottom edge of the bar. */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-300',
          lifted ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.45) 22%, rgba(167,139,250,0.40) 50%, rgba(224,69,123,0.40) 78%, transparent 100%)',
        }}
      />

      {/* Three-zone grid: brand | center nav | actions. The center column is the
          only flexible track, so the brand and the action cluster never collide
          regardless of viewport width. Full nav + actions only mount at lg+; the
          md..lg range uses the hamburger, which is what fixed the search-over-blog
          overlap (both clusters used to appear at md and ran into each other). */}
      <div className="container-x grid h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* Brand. Standalone logomark, no box. A soft radial aura sits behind the
            croc so it pops on the dark bar and reads as the lead element. */}
        <Link
          href="/"
          className="group relative flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
          aria-label="brocco.dev home"
        >
          <span className="relative inline-flex shrink-0 items-center justify-center">
            {/* Aura: brand glow that intensifies on hover. Pure decoration. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-2 rounded-full opacity-70 blur-xl transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(34,211,238,0.45), rgba(167,139,250,0.25) 45%, transparent 70%)',
              }}
            />
            <Logomark
              className="relative h-11 w-11 drop-shadow-[0_2px_10px_rgba(34,211,238,0.35)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 md:h-12 md:w-12"
            />
          </span>
          <span className="text-[19px] font-semibold leading-none tracking-tight">
            brocco<span className="text-ink-faint">.dev</span>
          </span>
        </Link>

        {/* Center nav, lg+ only. Justified center within the flexible track. */}
        <div className="hidden min-w-0 items-center justify-center gap-0.5 lg:flex">
          {MEGAS.map((m, idx) => {
            // Anchor each dropdown to its own trigger so it sits "in line with
            // the button," not centered on the whole nav. The two right-most
            // menus open right-aligned so a wide panel never clips off-screen.
            const alignRight = idx >= MEGAS.length - 2;
            return (
              <div
                key={m.label}
                className="relative"
                onMouseEnter={() => enter(m.label)}
                onMouseLeave={leave}
                onFocus={() => enter(m.label)}
              >
                <button
                  aria-haspopup="menu"
                  aria-expanded={openMega === m.label}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan/50',
                    openMega === m.label
                      ? 'bg-white/[0.06] text-white'
                      : 'text-ink-dim hover:bg-white/[0.04] hover:text-white',
                  )}
                >
                  {m.label}
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 transition-transform duration-200',
                      openMega === m.label && 'rotate-180',
                    )}
                  />
                </button>

                <AnimatePresence>
                  {openMega === m.label && (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className={cn(
                        'absolute top-full z-50 pt-2',
                        alignRight ? 'right-0' : 'left-0',
                      )}
                      role="menu"
                    >
                      <div
                        className={cn(
                          'relative overflow-hidden rounded-2xl border border-white/[0.10] bg-bg-1/95 p-2 shadow-glow backdrop-blur-2xl backdrop-saturate-150',
                          m.width,
                        )}
                      >
                        {/* Neon hairline along the top edge of the panel. */}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 top-0 h-px"
                          style={{
                            background:
                              'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), rgba(224,69,123,0.4), transparent)',
                          }}
                        />
                        <p className="px-3 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                          {m.label}
                        </p>
                        <div className="grid grid-cols-1 gap-0.5">
                          {m.items.map((it) => (
                            <Link
                              key={`${m.label}:${it.href}:${it.label}`}
                              href={it.href}
                              target={it.external ? '_blank' : undefined}
                              rel={it.external ? 'noopener' : undefined}
                              onClick={() => setOpenMega(null)}
                              className="group/item flex items-start gap-3 rounded-lg px-3 py-2.5 outline-none transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.06] focus-visible:ring-1 focus-visible:ring-cyan/40"
                            >
                              <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] ring-1 ring-white/[0.08] transition-all group-hover/item:bg-cyan/10 group-hover/item:ring-cyan/30">
                                <it.Icon className="h-3.5 w-3.5 text-brand-glow transition-colors group-hover/item:text-cyan-glow" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[13.5px] font-semibold tracking-tight text-white">
                                  {it.label}
                                </span>
                                <span className="mt-0.5 block text-[12px] leading-snug text-ink-dim">
                                  {it.desc}
                                </span>
                              </span>
                              <ArrowRight className="mt-1 h-3 w-3 text-ink-faint opacity-0 transition-all group-hover/item:translate-x-0.5 group-hover/item:opacity-100" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {/* The two unique pages join the bar at xl. At lg only the 4 mega
              triggers show, so the center cluster can never outgrow its track
              and spill over the brand or the action buttons. */}
          {SIMPLE.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="hidden rounded-full px-3 py-1.5 text-[13.5px] text-ink-dim outline-none transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan/50 xl:inline-flex"
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Actions, lg+ only. */}
        <div className="hidden shrink-0 flex-nowrap items-center gap-2 lg:flex">
          {/* Search: icon-only button through 2xl, expands to the labelled ⌘K
              pill at 2xl. Icon form guarantees it can never widen into a
              neighbouring link. */}
          <button
            type="button"
            onClick={openPalette}
            aria-label="open command palette (search)"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04] text-ink-dim outline-none transition-colors hover:border-cyan/30 hover:bg-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan/50 2xl:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={openPalette}
            className="hidden items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-[12.5px] text-ink-dim outline-none transition-colors hover:border-cyan/30 hover:bg-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan/50 2xl:inline-flex"
            aria-label="open command palette"
          >
            <Search className="h-3.5 w-3.5" />
            <span>search</span>
            <span className="inline-flex items-center gap-0.5">
              <kbd className="kbd">⌘</kbd>
              <kbd className="kbd">K</kbd>
            </span>
          </button>
          {/* hairline divider between utility + auth clusters */}
          <span aria-hidden className="h-5 w-px bg-white/[0.10]" />
          {signedIn ? (
            <>
              <Link
                href="/account"
                className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium text-ink-dim outline-none transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan/50"
              >
                account
              </Link>
              <Link
                href="/app"
                className="group relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-gradient-to-r from-brand to-cyan px-4 py-2 text-[13px] font-semibold text-white shadow-glow2 outline-none transition-all hover:shadow-glow focus-visible:ring-2 focus-visible:ring-cyan/60"
              >
                <span className="relative">open app</span>
                <ArrowRight className="relative h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium text-ink-dim outline-none transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan/50"
              >
                sign in
              </Link>
              <Link
                href="/signup"
                className="group relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_22px_-2px_rgba(244,63,94,0.65)] outline-none transition-all hover:shadow-[0_0_32px_0_rgba(244,63,94,0.8)] focus-visible:ring-2 focus-visible:ring-rose-400/70"
              >
                {/* sheen sweep on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-full"
                />
                <span className="relative">Start 7-day trial</span>
                <ArrowRight className="relative h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile + tablet cluster (below lg): quick search + hamburger. Lives in
            the actions grid column so it stays right-aligned. */}
        <div className="flex items-center gap-2 justify-self-end lg:hidden">
          <button
            type="button"
            onClick={openPalette}
            aria-label="search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04] text-ink outline-none transition-colors hover:border-cyan/30 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan/50"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            aria-label={open ? 'close menu' : 'open menu'}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04] text-ink outline-none transition-colors hover:border-cyan/30 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan/50"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-h-[calc(100vh-72px)] overflow-y-auto border-t border-white/[0.06] bg-bg-0/95 backdrop-blur-xl lg:hidden"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(34,211,238,0.45), rgba(224,69,123,0.4), transparent)',
            }}
          />
          <div className="container-x flex flex-col gap-1 py-4">
            {MEGAS.map((m) => (
              <details key={m.label} className="group rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm text-ink hover:text-white">
                  {m.label}
                  <ChevronDown className="h-4 w-4 text-ink-faint transition-transform group-open:rotate-180" />
                </summary>
                <ul className="border-t border-white/[0.06] p-1">
                  {m.items.map((it) => (
                    <li key={`${m.label}:m:${it.href}:${it.label}`}>
                      <Link
                        href={it.href}
                        target={it.external ? '_blank' : undefined}
                        rel={it.external ? 'noopener' : undefined}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-ink-dim hover:bg-white/[0.04] hover:text-white"
                      >
                        <it.Icon className="h-3.5 w-3.5 text-ink-faint" />
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            {SIMPLE.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-ink-dim hover:bg-white/[0.04] hover:text-white"
              >
                {s.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href={signedIn ? '/account' : '/login'}
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-ink-dim hover:bg-white/[0.07] hover:text-white"
              >
                {signedIn ? 'account' : 'sign in'}
              </Link>
              <Link
                href={signedIn ? '/app' : '/signup'}
                onClick={() => setOpen(false)}
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white',
                  signedIn
                    ? 'bg-gradient-to-r from-brand to-cyan shadow-glow2'
                    : 'bg-gradient-to-r from-rose-500 to-orange-500 shadow-[0_0_22px_-2px_rgba(244,63,94,0.65)]',
                )}
              >
                {signedIn ? 'open app' : 'Start 7-day trial'} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {/* Follow row, so social is visible in the mobile menu too. */}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.06] pt-3">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                follow brocco
              </span>
              <SocialLinks items={SOCIALS} className="flex-wrap" />
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
    </>
  );
}

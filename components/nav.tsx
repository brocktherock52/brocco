'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Boxes,
  ChevronDown,
  Code2,
  Download,
  Menu,
  Plug,
  ScrollText,
  Sparkles,
  Swords,
  TerminalSquare,
  Wrench,
  X,
} from 'lucide-react';
import { Logomark } from './logo';
import { cn } from '@/lib/utils';

/* -------- mega-dropdown content (inference.sh-style) -------- */

interface MegaItem {
  href: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

const PRODUCT: MegaItem[] = [
  { href: '/app', label: 'dashboard', desc: 'multi-agent panes, broadcast mode', Icon: Boxes },
  { href: '/api/v1/agents', label: 'api', desc: 'rest + sse stream', Icon: TerminalSquare, external: true },
  { href: '/download#mcp-setup', label: 'mcp server', desc: 'inside claude desktop + cursor', Icon: Plug },
  { href: '/docs', label: 'tool factory', desc: 'wire your stack in 30 lines', Icon: Wrench },
  { href: '/app', label: 'recipes', desc: 'one-click workflows', Icon: Sparkles },
  { href: '/security', label: 'audit log', desc: 'jsonl, exportable, siem-ready', Icon: ScrollText },
];

const DEVELOPERS: MegaItem[] = [
  { href: '/docs', label: 'docs', desc: 'agents, tools, recipes, mcp, rest', Icon: Boxes },
  { href: '/api/v1/agents', label: 'api reference', desc: 'live /api/v1/agents endpoint', Icon: TerminalSquare, external: true },
  { href: '/download', label: 'install / pwa', desc: 'mac, windows, mobile', Icon: Download },
  { href: 'https://github.com/brocktherock52/bdp-consulting', label: 'github', desc: 'source + releases', Icon: Code2, external: true },
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
  width: string; // tailwind width
}

const MEGAS: MegaSpec[] = [
  { label: 'product', items: PRODUCT, width: 'w-[460px]' },
  { label: 'developers', items: DEVELOPERS, width: 'w-[460px]' },
  { label: 'compare', items: COMPARE, width: 'w-[420px]' },
];

const SIMPLE = [
  { href: '/pricing', label: 'pricing' },
  { href: '/blog', label: 'blog' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile drawer
  const [openMega, setOpenMega] = useState<string | null>(null);
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

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || openMega
          ? 'border-b border-white/[0.06] bg-bg-0/75 backdrop-blur-xl'
          : 'bg-transparent',
      )}
      onMouseLeave={leave}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-[68px]">
        <Link href="/" className="group flex items-center gap-2.5">
          <Logomark className="h-7 w-7 transition-transform group-hover:scale-105" />
          <span className="text-[15px] font-semibold tracking-tight">
            brocco<span className="text-ink-faint">.ai</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {MEGAS.map((m) => (
            <div
              key={m.label}
              className="relative"
              onMouseEnter={() => enter(m.label)}
              onFocus={() => enter(m.label)}
            >
              <button
                aria-haspopup="menu"
                aria-expanded={openMega === m.label}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13.5px] transition-colors',
                  openMega === m.label ? 'text-white' : 'text-ink-dim hover:text-white',
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
            </div>
          ))}
          {SIMPLE.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-full px-3 py-1.5 text-[13.5px] text-ink-dim transition-colors hover:text-white"
            >
              {s.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/download"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 text-[13px] font-medium text-ink-dim transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            install app
          </Link>
          <Link
            href="/app"
            className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-cyan px-4 py-2 text-[13px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow"
          >
            open app
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          aria-label="open menu"
          className="rounded-full border border-white/[0.10] bg-white/[0.04] p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mega-dropdown panel */}
      <AnimatePresence>
        {openMega && (
          <motion.div
            key={openMega}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="hidden md:block absolute left-1/2 top-full z-50 -translate-x-1/2"
            onMouseEnter={() => enter(openMega)}
            onMouseLeave={leave}
          >
            {MEGAS.filter((m) => m.label === openMega).map((m) => (
              <div
                key={m.label}
                className={cn(
                  'mt-2 overflow-hidden rounded-2xl border border-white/[0.10] bg-bg-1/95 p-2 shadow-glow backdrop-blur-2xl',
                  m.width,
                )}
                role="menu"
              >
                <div className="grid grid-cols-1 gap-1">
                  {m.items.map((it) => (
                    <Link
                      key={`${m.label}:${it.href}:${it.label}`}
                      href={it.href}
                      target={it.external ? '_blank' : undefined}
                      rel={it.external ? 'noopener' : undefined}
                      onClick={() => setOpenMega(null)}
                      className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] ring-1 ring-white/[0.08]">
                        <it.Icon className="h-3.5 w-3.5 text-brand-glow" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-semibold tracking-tight text-white">
                          {it.label}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-ink-dim">
                          {it.desc}
                        </span>
                      </span>
                      <ArrowRight className="mt-1 h-3 w-3 text-ink-faint opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/[0.06] bg-bg-0/95 backdrop-blur-xl md:hidden"
        >
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
                href="/download"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-ink-dim hover:bg-white/[0.07] hover:text-white"
              >
                <Download className="h-3.5 w-3.5" /> install
              </Link>
              <Link
                href="/app"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-cyan px-4 py-2.5 text-sm font-semibold text-white"
              >
                open app <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logomark } from './logo';
import { InstallButton } from './install-button';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/#how', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/download', label: 'Download' },
  { href: '/docs', label: 'Docs' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-white/[0.06] bg-bg-0/70 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-[68px]">
        <Link href="/" className="group flex items-center gap-2.5">
          <Logomark className="h-7 w-7 transition-transform group-hover:scale-105" />
          <span className="text-[15px] font-semibold tracking-tight">
            brocco<span className="text-ink-faint">.ai</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-[13.5px] text-ink-dim transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <InstallButton />
          <Link
            href="/app"
            className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-cyan px-4 py-2 text-[13px] font-semibold text-white shadow-glow2 transition-all hover:shadow-glow"
          >
            Open app
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          aria-label="Open menu"
          className="rounded-full border border-white/[0.10] bg-white/[0.04] p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/[0.06] bg-bg-0/95 backdrop-blur-xl md:hidden"
        >
          <div className="container-x flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-ink-dim hover:bg-white/[0.04] hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-cyan px-4 py-2.5 text-sm font-semibold text-white"
            >
              Open app <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

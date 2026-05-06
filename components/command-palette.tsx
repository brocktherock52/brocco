'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Briefcase,
  Code2,
  Compass,
  Cpu,
  Hammer,
  Layers,
  Plug,
  ScrollText,
  Sparkles,
  TerminalSquare,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { AGENT_PROFILES } from '@/lib/agent-profiles';
import { TOOL_PROFILES } from '@/lib/tool-profiles';
import { RECIPE_PROFILES } from '@/lib/recipe-profiles';
import { VERTICALS } from '@/lib/verticals';
import { INTEGRATION_PROFILES } from '@/lib/integration-profiles';

/**
 * CommandPalette — Linear/Raycast-style cmd+k overlay.
 * Searchable across agents (9), tools (13), recipes (11), verticals (9),
 * integrations (8), and primary nav routes. Keyboard-first: cmd+k or
 * ctrl+k anywhere opens it; arrow keys + enter navigate.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(href);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmdk-overlay"
          className="fixed inset-0 z-[60] flex items-start justify-center bg-bg-0/70 backdrop-blur-md pt-[14vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-white/[0.08] bg-bg-1/95 shadow-glow backdrop-blur-2xl"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="cmdk-root" label="brocco command palette">
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4">
                <Sparkles className="h-4 w-4 text-cyan-glow" />
                <Command.Input
                  autoFocus
                  placeholder="search agents, tools, recipes, verticals..."
                  className="flex-1 bg-transparent py-4 text-[14.5px] text-white placeholder:text-ink-faint outline-none"
                />
                <kbd className="kbd hidden md:inline-flex">esc</kbd>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                <Command.Empty className="px-3 py-6 text-center text-[13.5px] text-ink-dim">
                  no matches.
                </Command.Empty>

                <Command.Group heading="navigate" className="cmdk-group">
                  <Item
                    Icon={Boxes}
                    label="open dashboard"
                    hint="/app"
                    onSelect={() => go('/app')}
                    accent="#67E8F9"
                  />
                  <Item
                    Icon={Cpu}
                    label="agents"
                    hint="/agents"
                    onSelect={() => go('/agents')}
                  />
                  <Item
                    Icon={Wrench}
                    label="tools"
                    hint="/tools"
                    onSelect={() => go('/tools')}
                  />
                  <Item
                    Icon={Sparkles}
                    label="recipes"
                    hint="/recipes"
                    onSelect={() => go('/recipes')}
                  />
                  <Item
                    Icon={Plug}
                    label="integrations"
                    hint="/integrations"
                    onSelect={() => go('/integrations')}
                  />
                  <Item
                    Icon={ScrollText}
                    label="pricing"
                    hint="/pricing"
                    onSelect={() => go('/pricing')}
                  />
                  <Item
                    Icon={BookOpen}
                    label="blog"
                    hint="/blog"
                    onSelect={() => go('/blog')}
                  />
                  <Item
                    Icon={ScrollText}
                    label="docs"
                    hint="/docs"
                    onSelect={() => go('/docs')}
                  />
                </Command.Group>

                <Command.Group heading="agents" className="cmdk-group">
                  {AGENT_PROFILES.map((a) => (
                    <Item
                      key={`a-${a.slug}`}
                      Icon={Cpu}
                      label={a.name}
                      hint={a.tagline}
                      onSelect={() => go(`/agents/${a.slug}`)}
                      accent="#67E8F9"
                    />
                  ))}
                </Command.Group>

                <Command.Group heading="tools" className="cmdk-group">
                  {TOOL_PROFILES.map((t) => (
                    <Item
                      key={`t-${t.slug}`}
                      Icon={TerminalSquare}
                      label={t.name}
                      hint={t.tagline}
                      onSelect={() => go(`/tools/${t.slug}`)}
                    />
                  ))}
                </Command.Group>

                <Command.Group heading="recipes" className="cmdk-group">
                  {RECIPE_PROFILES.map((r) => (
                    <Item
                      key={`r-${r.slug}`}
                      Icon={Sparkles}
                      label={r.name.toLowerCase()}
                      hint={r.tagline}
                      onSelect={() => go(`/recipes/${r.slug}`)}
                    />
                  ))}
                </Command.Group>

                <Command.Group heading="for" className="cmdk-group">
                  {VERTICALS.map((v) => {
                    const Icon =
                      v.slug === 'founders'
                        ? Compass
                        : v.slug === 'agencies'
                        ? Layers
                        : v.slug === 'wholesalers'
                        ? Hammer
                        : v.slug === 'sales-ops'
                        ? Briefcase
                        : v.slug === 'recruiters'
                        ? Users
                        : v.slug === 'marketers'
                        ? Zap
                        : Compass;
                    return (
                      <Item
                        key={`v-${v.slug}`}
                        Icon={Icon}
                        label={`for ${v.audience}`}
                        hint={v.hero.split('.')[0]}
                        onSelect={() => go(`/for/${v.slug}`)}
                      />
                    );
                  })}
                </Command.Group>

                <Command.Group heading="integrations" className="cmdk-group">
                  {INTEGRATION_PROFILES.map((i) => (
                    <Item
                      key={`i-${i.slug}`}
                      Icon={Plug}
                      label={i.name.toLowerCase()}
                      hint={i.tagline}
                      onSelect={() => go(`/integrations/${i.slug}`)}
                    />
                  ))}
                </Command.Group>

                <Command.Group heading="external" className="cmdk-group">
                  <Item
                    Icon={Code2}
                    label="github (public)"
                    hint="github.com/brocktherock52/brocco"
                    onSelect={() => go('https://github.com/brocktherock52/brocco')}
                  />
                  <Item
                    Icon={Sparkles}
                    label="book a 15-min demo"
                    hint="calendly.com/brockpivec"
                    onSelect={() => go('https://calendly.com/brockpivec/')}
                  />
                </Command.Group>
              </Command.List>

              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-[11px] text-ink-faint">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <kbd className="kbd">↑</kbd>
                    <kbd className="kbd">↓</kbd>
                    navigate
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="kbd">↵</kbd>
                    open
                  </span>
                </div>
                <span className="font-mono uppercase tracking-[0.18em]">brocco · cmd+k</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Item({
  Icon,
  label,
  hint,
  onSelect,
  accent,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  onSelect: () => void;
  accent?: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] text-ink-dim aria-selected:bg-white/[0.06] aria-selected:text-white"
    >
      <span
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-white/[0.04] ring-1 ring-white/[0.08]"
        style={accent ? { color: accent } : undefined}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold tracking-tight">{label}</span>
        <span className="block truncate text-[12px] text-ink-faint group-aria-selected:text-ink-dim">{hint}</span>
      </span>
      <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-ink-faint opacity-0 transition group-aria-selected:opacity-100" />
    </Command.Item>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ImagePlus, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  getProfile,
  saveProfile,
  markProfileComplete,
  fileToLogoDataUrl,
  DEFAULT_BRAND_COLOR,
  type BroccoProfile,
} from '@/lib/profile';
import { trackEvent } from '@/components/posthog-provider';

// GuidedOnboarding, first-run flow. Two info slides bookend a personalization
// step added per Braeden's 2026-05-26 note: capturing the user's name, business
// name, logo and brand color makes the workspace "theirs" the second they're
// in, which is the retention lever ("do I keep that thing I just logged into,
// or the one that knows my business and is branded for me?"). Everything here
// is skippable and persists to lib/profile (localStorage today).

const TOGGLE_KEY = 'brocco:onboarding-enabled';
const STORAGE_KEY = 'brocco:onboarding-seen';

// Curated swatches + a free picker. First is brocco's signature violet.
const SWATCHES = ['#7C3AED', '#22D3EE', '#22C55E', '#FB7185', '#FBBF24', '#F472B6', '#3B82F6'];

export function GuidedOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<BroccoProfile>(() => getProfile());
  const fileRef = useRef<HTMLInputElement>(null);

  // Total steps: welcome → personalize → tips.
  const STEP_COUNT = 3;

  useEffect(() => {
    try {
      const enabled = localStorage.getItem(TOGGLE_KEY);
      const seen = localStorage.getItem(STORAGE_KEY);
      if (enabled !== 'off' && !seen) {
        const t = window.setTimeout(() => setOpen(true), 700);
        return () => window.clearTimeout(t);
      }
    } catch {}
  }, []);

  function persist(patch: Partial<BroccoProfile>) {
    setProfile((p) => {
      const next = { ...p, ...patch };
      saveProfile(patch);
      return next;
    });
  }

  function close(complete = true) {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
    if (complete) markProfileComplete();
    const p = getProfile();
    trackEvent('onboarding_completed', {
      completed: complete,
      personalized: !!(p.businessName || p.name || p.logoDataUrl),
      has_logo: !!p.logoDataUrl,
      last_step: step,
    });
    setOpen(false);
  }

  function next() {
    if (step < STEP_COUNT - 1) setStep((s) => s + 1);
    else close(true);
  }

  async function onPickLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToLogoDataUrl(file);
      persist({ logoDataUrl: dataUrl });
    } catch (err) {
      toast.error('Could not use that image', {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-6 backdrop-blur-xl"
          onClick={() => close(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.12] bg-bg-1/95 p-6 shadow-glow backdrop-blur-2xl"
          >
            <button
              onClick={() => close(false)}
              className="absolute right-3 top-3 rounded-md p-1 text-ink-faint hover:text-white"
              aria-label="close onboarding"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              first-time setup · step {step + 1} of {STEP_COUNT}
            </p>

            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: STEP_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= step ? 'bg-gradient-to-r from-brand to-cyan' : 'bg-white/[0.08]'
                  }`}
                />
              ))}
            </div>

            {/* STEP 0: welcome */}
            {step === 0 && (
              <div className="mt-6">
                <h2 className="text-[22px] font-semibold leading-tight tracking-tight">
                  <span className="text-grad">welcome to your AI team</span>
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-dim">
                  Nine specialists run in parallel on every prompt, research, plans, outreach,
                  code, design, and hand you back a finished deliverable. Let&apos;s make this
                  workspace yours.
                </p>
              </div>
            )}

            {/* STEP 1: personalize */}
            {step === 1 && (
              <div className="mt-6">
                <h2 className="text-[20px] font-semibold leading-tight tracking-tight">
                  <span className="text-grad">make it yours</span>
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">
                  Your name, brand, and color show up across the app and on every PDF report your
                  team builds. Skip anything. You can set it later.
                </p>

                <div className="mt-5 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                        your name
                      </span>
                      <input
                        value={profile.name}
                        onChange={(e) => persist({ name: e.target.value })}
                        placeholder="Alex"
                        className="mt-1.5 w-full rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-[13.5px] text-ink outline-none placeholder:text-ink-faint focus:border-brand/50"
                      />
                    </label>
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                        business
                      </span>
                      <input
                        value={profile.businessName}
                        onChange={(e) => persist({ businessName: e.target.value })}
                        placeholder="Acme Labs"
                        className="mt-1.5 w-full rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-[13.5px] text-ink outline-none placeholder:text-ink-faint focus:border-brand/50"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                      what will you use brocco for?
                    </span>
                    <input
                      value={profile.useCase}
                      onChange={(e) => persist({ useCase: e.target.value })}
                      placeholder="marketing ops for my SaaS"
                      className="mt-1.5 w-full rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-[13.5px] text-ink outline-none placeholder:text-ink-faint focus:border-brand/50"
                    />
                  </label>

                  <div className="flex items-center gap-3">
                    {/* logo upload */}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/[0.16] bg-white/[0.03] hover:border-brand/50"
                      title="upload a logo"
                    >
                      {profile.logoDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.logoDataUrl}
                          alt="your logo"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ImagePlus className="h-5 w-5 text-ink-faint group-hover:text-brand-glow" />
                      )}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={onPickLogo}
                      className="hidden"
                    />
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                        brand color
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {SWATCHES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => persist({ brandColor: c })}
                            className={`h-5 w-5 rounded-full transition ${
                              profile.brandColor.toLowerCase() === c.toLowerCase()
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-1'
                                : 'hover:scale-110'
                            }`}
                            style={{ background: c }}
                            aria-label={`use ${c}`}
                          />
                        ))}
                        <label
                          className="relative h-5 w-5 cursor-pointer overflow-hidden rounded-full border border-white/[0.2]"
                          title="custom color"
                        >
                          <span
                            className="absolute inset-0"
                            style={{
                              background:
                                'conic-gradient(red, orange, yellow, lime, cyan, blue, magenta, red)',
                            }}
                          />
                          <input
                            type="color"
                            value={profile.brandColor || DEFAULT_BRAND_COLOR}
                            onChange={(e) => persist({ brandColor: e.target.value })}
                            className="absolute inset-0 cursor-pointer opacity-0"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: tips */}
            {step === 2 && (
              <div className="mt-6">
                <h2 className="text-[22px] font-semibold leading-tight tracking-tight">
                  <span className="text-grad">three moves to know</span>
                </h2>
                <ul className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-ink-dim">
                  <li className="flex gap-2.5">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow" />
                    <span>
                      <span className="text-white">Type one goal.</span> It fans out to every
                      selected specialist in parallel, each in its own streaming pane.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-glow" />
                    <span>
                      <span className="text-white">Download a PDF.</span> Every finished run exports
                      as one branded, designed report, not a wall of markdown.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>
                      <span className="text-white">Set and forget.</span> Save a run as a project and
                      brocco watches it, re-running and flagging when the data goes stale.
                    </span>
                  </li>
                </ul>
              </div>
            )}

            <div className="mt-7 flex items-center justify-between">
              <button
                onClick={() => {
                  try {
                    localStorage.setItem(TOGGLE_KEY, 'off');
                  } catch {}
                  close(true);
                }}
                className="text-[12px] text-ink-faint hover:text-ink-dim"
              >
                {step === 1 ? 'skip for now' : "skip, I'm a power user"}
              </button>
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-cyan px-5 py-2 text-[13px] font-semibold text-white shadow-glow2"
              >
                {step === STEP_COUNT - 1 ? 'start using brocco' : 'next'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

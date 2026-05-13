'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  TEMPLATES,
  TOOL_CATALOG,
  ACCENT_OPTIONS,
  CROC_BASE_OPTIONS,
  buildAgent,
  saveCustomAgent,
  type AgentTemplate,
  type CustomCrocBase,
} from '@/lib/custom-agents';
import { CAST_CROCS } from '@/components/cast-croc-characters';
import { CustomCroc, ACCESSORIES, type AccessoryId } from '@/components/custom-croc';

// AgentWizard — 4 step flow for forking an agent template into a custom
// agent saved to the user's team.
//
// Steps:
//   1. pick a template (researcher, closer, reviewer, ...)
//   2. name + topic
//   3. icon + accent
//   4. tools + preview + save
//
// Persists to localStorage via saveCustomAgent. After save, redirect to
// /app with a toast pointing the user to their new specialist.

const STEPS = ['template', 'name & topic', 'icon & color', 'tools & save'] as const;

export function AgentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [tpl, setTpl] = useState<AgentTemplate | null>(null);
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [topic, setTopic] = useState('');
  const [accent, setAccent] = useState<string>(ACCENT_OPTIONS[0]);
  const [crocBase, setCrocBase] = useState<CustomCrocBase>('researcher');
  const [accessory, setAccessory] = useState<AccessoryId>('none');
  const [tools, setTools] = useState<string[]>([]);

  // when template changes, seed defaults
  function pickTemplate(t: AgentTemplate) {
    setTpl(t);
    setAccent(t.defaultAccent);
    setCrocBase(t.defaultCrocBase);
    setTools(t.defaultTools);
    if (!topic) setTopic(t.examples[0]);
    setStep(1);
  }

  const canAdvance = useMemo(() => {
    if (step === 0) return !!tpl;
    if (step === 1) return name.trim().length > 0 && topic.trim().length > 0;
    if (step === 2) return !!accent && !!crocBase;
    if (step === 3) return tools.length > 0;
    return false;
  }, [step, tpl, name, topic, accent, crocBase, tools]);

  function next() {
    if (!canAdvance) return;
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else save();
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function save() {
    if (!tpl) return;
    const agent = buildAgent(tpl, { name, label: label || name, topic, accent, crocBase, accessory, tools });
    saveCustomAgent(agent);
    toast.success(`saved ${agent.label}`, {
      description: 'your custom agent is on your team. broadcast a goal and they\'ll show up.',
    });
    router.push('/app');
  }

  const Croc = CAST_CROCS[crocBase] ?? CAST_CROCS.researcher;

  return (
    <div className="min-h-screen bg-bg-0 text-ink">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-bg-0/80 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/app" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-dim hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            back to dashboard
          </Link>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
            step {step + 1} of {STEPS.length}  ·  {STEPS[step]}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mx-auto mt-3 flex max-w-3xl gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]"
            >
              <motion.div
                className="h-full"
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: `linear-gradient(90deg, ${accent} 0%, ${accent}AA 100%)` }}
              />
            </div>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-4 py-12">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepBlock key="0">
              <Headline kicker="step 1" title="pick a starting template" sub="every custom agent forks one of these and gets a sharper system prompt." />
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => pickTemplate(t)}
                    className={`group relative overflow-hidden rounded-xl border bg-bg-1/60 p-4 text-left transition-all hover:-translate-y-1 ${
                      tpl?.id === t.id ? 'border-white/40 ring-1 ring-white/20' : 'border-white/[0.08] hover:border-white/[0.16]'
                    }`}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-2 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
                      style={{ background: `radial-gradient(circle at 30% 20%, ${t.defaultAccent}33 0%, transparent 60%)` }}
                    />
                    <div className="flex items-start gap-3">
                      <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1"
                        style={{ background: `${t.defaultAccent}15`, color: t.defaultAccent, boxShadow: `inset 0 0 0 1px ${t.defaultAccent}40` }}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold tracking-tight">{t.label}</p>
                        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-dim">{t.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </StepBlock>
          )}

          {step === 1 && tpl && (
            <StepBlock key="1">
              <Headline
                kicker={`step 2  ·  forking ${tpl.label}`}
                title="give your agent a name and a topic"
                sub="the name is for you. the topic feeds into the system prompt."
              />
              <div className="mt-8 space-y-5">
                <Field label="agent name">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!label) setLabel(e.target.value);
                    }}
                    placeholder={`${tpl.label}-bot`}
                    className="block w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-white/[0.2] focus:bg-white/[0.04]"
                  />
                </Field>
                <Field label="display label (optional)">
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={name || tpl.label}
                    className="block w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-white/[0.2] focus:bg-white/[0.04]"
                  />
                </Field>
                <Field label="topic / focus area" hint="injected into the system prompt — be specific.">
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={tpl.examples[0]}
                    className="block w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-white/[0.2] focus:bg-white/[0.04]"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tpl.examples.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setTopic(ex)}
                        className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 font-mono text-[11px] text-ink-dim hover:border-white/[0.16] hover:text-white"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </StepBlock>
          )}

          {step === 2 && tpl && (
            <StepBlock key="2">
              <Headline kicker="step 3" title="pick a costume and color" sub="every custom croc remixes one of the nine cast crocs. pick the base they'll look like." />
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div>
                  <Field label="croc base">
                    <div className="grid grid-cols-3 gap-2">
                      {CROC_BASE_OPTIONS.map((b) => {
                        const C = CAST_CROCS[b];
                        const active = crocBase === b;
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setCrocBase(b)}
                            className={`group relative aspect-square overflow-hidden rounded-lg border transition-all ${
                              active ? 'border-white/40 ring-1 ring-white/20' : 'border-white/[0.08] hover:border-white/[0.16]'
                            }`}
                            style={{ background: `linear-gradient(180deg, #0a1014 0%, #050708 100%)` }}
                          >
                            <C accent={accent} className="absolute inset-0 h-full w-full" />
                            <span className="absolute inset-x-1 bottom-1 rounded-sm bg-bg-0/60 px-1 text-center font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-dim backdrop-blur-md">
                              {b}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <div className="mt-6">
                    <Field label="accent color">
                      <div className="flex flex-wrap gap-2">
                        {ACCENT_OPTIONS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setAccent(c)}
                            className={`relative h-9 w-9 rounded-full ring-2 transition-all ${
                              accent === c ? 'scale-110 ring-white/70' : 'ring-white/0 hover:ring-white/20'
                            }`}
                            style={{ background: c, boxShadow: `0 0 12px ${c}66` }}
                            aria-label={c}
                          >
                            {accent === c && <Check className="absolute inset-0 m-auto h-4 w-4 text-bg-0" />}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>

                  <div className="mt-6">
                    <Field label="accessory" hint="layered on the croc — drives the icon composer.">
                      <div className="flex flex-wrap gap-2">
                        {ACCESSORIES.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setAccessory(a.id)}
                            className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                              accessory === a.id
                                ? 'border-white/40 bg-white/[0.08] text-white'
                                : 'border-white/[0.08] bg-white/[0.02] text-ink-dim hover:border-white/[0.16] hover:text-white'
                            }`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-2xl border border-white/[0.08] bg-bg-1/60 p-4">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">live preview</p>
                  <div
                    className="relative mt-3 aspect-[4/5] overflow-hidden rounded-xl bg-black"
                  >
                    {/* Render the composer so the accessory shows live */}
                    <CustomCroc
                      accent={accent}
                      accessory={accessory}
                      className="absolute inset-0 h-full w-full"
                    />
                    <div
                      className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border bg-bg-1/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur-md"
                      style={{ borderColor: `${accent}55`, color: accent }}
                    >
                      <span className="h-1 w-1 rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
                      {name || tpl.label}
                    </div>
                  </div>
                </div>
              </div>
            </StepBlock>
          )}

          {step === 3 && tpl && (
            <StepBlock key="3">
              <Headline kicker="step 4" title="pick the tools and save" sub="check what this agent can call. you can change tools later from the agent profile." />

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {TOOL_CATALOG.map((t) => {
                  const active = tools.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setTools((curr) => (curr.includes(t.id) ? curr.filter((x) => x !== t.id) : [...curr, t.id]))
                      }
                      className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-colors ${
                        active ? 'border-white/40 bg-white/[0.04]' : 'border-white/[0.08] bg-bg-1/60 hover:border-white/[0.16]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-4 w-4 items-center justify-center rounded ${
                            active ? 'bg-white text-bg-0' : 'border border-white/20'
                          }`}
                        >
                          {active && <Check className="h-3 w-3" />}
                        </span>
                        <p className="text-[13.5px] font-medium">{t.label}</p>
                      </div>
                      <p className="mt-1 pl-6 text-[12px] leading-snug text-ink-dim">{t.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* System prompt preview */}
              <div className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">generated system prompt</p>
                <p className="mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-dim">
                  {tpl.systemPromptTemplate.replace(/{{topic}}/g, topic || tpl.examples[0])}
                </p>
              </div>
            </StepBlock>
          )}
        </AnimatePresence>

        {/* Footer nav */}
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-[13px] text-ink-dim transition hover:border-white/[0.16] hover:text-white disabled:opacity-40 disabled:hover:border-white/[0.08] disabled:hover:text-ink-dim"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            back
          </button>
          <button
            onClick={next}
            disabled={!canAdvance}
            className="group inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-semibold text-bg-0 transition-all disabled:opacity-40"
            style={{
              background: `linear-gradient(90deg, ${accent} 0%, ${accent}DD 100%)`,
              boxShadow: `0 0 24px ${accent}44`,
            }}
          >
            {step === STEPS.length - 1 ? (
              <>
                <Wand2 className="h-3.5 w-3.5" />
                save agent
              </>
            ) : (
              <>
                next
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepBlock({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Headline({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">{kicker}</p>
      <h1 className="mt-2 text-[28px] font-semibold tracking-tight lowercase">
        <span className="text-grad">{title}</span>
      </h1>
      {sub && <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">{sub}</p>}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">{label}</label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-[11.5px] text-ink-faint">{hint}</p>}
    </div>
  );
}

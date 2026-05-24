'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Budget-qualified discovery intake. Signals a serious price point (role +
 * company size + budget band) rather than a consumer signup, and POSTs to
 * /api/consulting-intake. Shows an inline success state on completion.
 */

const ROLES = ['CEO / Founder', 'COO', 'CFO', 'CIO / CTO', 'VP / Director', 'Other'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const BUDGETS = ['< $15k', '$15k - $50k', '$50k - $150k', '$150k+', 'Not sure'];

type FormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  companySize: string;
  budget: string;
  automate: string;
};

const EMPTY: FormState = {
  name: '',
  email: '',
  company: '',
  role: '',
  companySize: '',
  budget: '',
  automate: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function IntakeForm() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): string | null {
    if (form.name.trim().length < 2) return 'Please enter your name.';
    if (!EMAIL_RE.test(form.email.trim())) return 'Please enter a valid work email.';
    if (form.company.trim().length < 2) return 'Please enter your company.';
    if (!form.role) return 'Please select your role.';
    if (!form.companySize) return 'Please select your company size.';
    if (!form.budget) return 'Please select a budget band.';
    if (form.automate.trim().length < 10) return 'Tell us a little about what to automate.';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/consulting-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          role: form.role,
          companySize: form.companySize,
          budget: form.budget,
          automate: form.automate.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; detail?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.detail || 'Something went wrong. Please try again.');
      }
      setDone(true);
      toast.success('Request received. We will be in touch within one business day.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="intake" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto">book an audit</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">tell us what is</span>{' '}
            <span className="text-grad-brand">eating your team&rsquo;s time.</span>
          </h2>
          <p className="mt-4 text-[16px] text-ink-dim">
            A few questions so we arrive prepared. We reply within one business
            day to schedule your audit.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          {done ? (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="card flex flex-col items-center gap-4 p-10 text-center"
            >
              <CheckCircle2 className="h-12 w-12 text-accent-green" strokeWidth={1.5} />
              <h3 className="text-[22px] font-semibold tracking-tight">Request received.</h3>
              <p className="max-w-md text-[14.5px] leading-relaxed text-ink-dim">
                Thanks, {form.name.split(' ')[0] || 'there'}. We will review what
                you sent and reply to{' '}
                <span className="text-ink">{form.email}</span> within one business
                day to book your AI audit.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="card flex flex-col gap-5 p-6 md:p-8"
              noValidate
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" htmlFor="ci-name">
                  <input
                    id="ci-name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className={inputCls}
                    placeholder="Jane Rivera"
                  />
                </Field>
                <Field label="Work email" htmlFor="ci-email">
                  <input
                    id="ci-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className={inputCls}
                    placeholder="jane@company.com"
                  />
                </Field>
              </div>

              <Field label="Company" htmlFor="ci-company">
                <input
                  id="ci-company"
                  type="text"
                  autoComplete="organization"
                  value={form.company}
                  onChange={(e) => set('company', e.target.value)}
                  className={inputCls}
                  placeholder="Acme Co."
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Role" htmlFor="ci-role">
                  <select
                    id="ci-role"
                    value={form.role}
                    onChange={(e) => set('role', e.target.value)}
                    className={cn(inputCls, !form.role && 'text-ink-faint')}
                  >
                    <option value="">Select a role</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="text-ink">
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Company size" htmlFor="ci-size">
                  <select
                    id="ci-size"
                    value={form.companySize}
                    onChange={(e) => set('companySize', e.target.value)}
                    className={cn(inputCls, !form.companySize && 'text-ink-faint')}
                  >
                    <option value="">Select size</option>
                    {SIZES.map((s) => (
                      <option key={s} value={s} className="text-ink">
                        {s} people
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Budget band" htmlFor="ci-budget">
                <select
                  id="ci-budget"
                  value={form.budget}
                  onChange={(e) => set('budget', e.target.value)}
                  className={cn(inputCls, !form.budget && 'text-ink-faint')}
                >
                  <option value="">Select a budget band</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b} className="text-ink">
                      {b}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="What would you automate first?" htmlFor="ci-automate">
                <textarea
                  id="ci-automate"
                  value={form.automate}
                  onChange={(e) => set('automate', e.target.value)}
                  rows={4}
                  maxLength={2000}
                  className={cn(inputCls, 'resize-y')}
                  placeholder="The repetitive work draining the most hours right now..."
                />
              </Field>

              <button type="submit" disabled={submitting} className="btn-primary mt-1 w-full">
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </span>
                ) : (
                  <>
                    <span>Request my AI audit</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[12px] text-ink-faint">
                No spam. We use this only to prepare and schedule your audit.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

const inputCls =
  'w-full rounded-xl border border-white/[0.10] bg-white/[0.03] px-3.5 py-2.5 text-[14.5px] text-ink ' +
  'placeholder:text-ink-faint outline-none transition-colors ' +
  'focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/40';

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-dim">
        {label}
      </label>
      {children}
    </div>
  );
}

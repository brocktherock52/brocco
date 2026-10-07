'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

const QA = [
  {
    q: 'What does brocco actually do for me?',
    a: 'Brocco runs multiple AI agents in parallel from a single prompt. Pick agents on the left, type a goal, hit Run, and watch each agent work in its own pane with live tool calls and streaming output. The recipes gallery has 11 ready-to-run workflows: market research, launch day, customer deep dive, content sprint, and more.',
  },
  {
    q: 'Why not just use my Claude subscription?',
    a: 'You can, for one task, in one thread, that you babysit prompt by prompt. Brocco is what you reach for when that gets old. One prompt fans out to a whole team running in parallel, so research, a plan, and outreach drafts land at once instead of one after another. Every run exports as a polished, branded PDF, a deliverable you can hand a client, not a wall of chat. And the projects you save keep watching themselves: brocco flags when a project\'s findings have gone stale and re-runs them, so you are not re-asking the same questions every week. Same models you already trust (bring your own key), minus the copy-paste and the babysitting.',
  },
  {
    q: 'What is included in the 7-day trial?',
    a: 'The trial is a seven-day dashboard preview. Create your account, choose Solo or Team, and add a payment card at checkout. Explore the workspace and sample workflows; live tool calls and agent runs require an active paid subscription. You can confirm early activation to end the preview and start your paid plan sooner.',
  },
  {
    q: 'When will I be charged?',
    a: 'Your selected plan starts automatically when the seven-day trial ends: Solo is $49 monthly or $490 annually; Team is $199 monthly or $1,990 annually. It renews each billing period until you cancel. Cancel in the billing portal before the trial ends to avoid the first charge. If you confirm early activation, your paid subscription begins then.',
  },
  {
    q: 'Do I need an API key to preview the dashboard?',
    a: 'No API key is needed for the dashboard preview. Live tool usage requires a paid plan. Model and integration credentials may also be needed for the workflow you choose; adding a key does not unlock live tools during the preview.',
  },
  {
    q: 'Which models are supported?',
    a: 'Anthropic: Claude Opus 4.7 (1M context), Sonnet 4.6, Haiku 4.5. OpenAI-compatible (any endpoint): GPT-4o and successors, plus local models via Ollama, vLLM, llama.cpp, OpenRouter, Groq, Together. Switch in the BYOK panel any time.',
  },
  {
    q: 'What if I exceed my monthly run limit?',
    a: 'Runs over the included quota are billed at $0.05 each on Solo and $0.03 each on Team. No surprise overages. Hard-cap usage in dashboard settings. Trial accounts cannot run live tools or incur usage overages.',
  },
  {
    q: 'Do you train models on my data?',
    a: 'See our privacy and security pages for details about how prompts, model providers, and integrations handle your data. The dashboard preview uses examples; live workflows send the data needed to the model and tools you choose.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. One-click cancel from the Stripe billing portal. We prorate the unused portion of your current period back to your card. No exit interviews.',
  },
  {
    q: 'How is this different from Zapier or n8n?',
    a: 'Zapier and n8n run pre-defined steps. Brocco agents reason: they decide which tool to call, read the result, and adapt. Use Zapier when steps are deterministic. Use Brocco when the workflow needs judgement.',
  },
  {
    q: 'Can I self-host?',
    a: 'Yes. Enterprise customers get a Helm chart and an air-gap-compatible Docker image. The runtime is Python; you can run it on a $5 VPS if you want.',
  },
  {
    q: 'How long until I have my first agent running?',
    a: 'After creating an account and adding your card, you can preview the dashboard. Live runs unlock when your paid subscription starts after seven days, or sooner if you confirm early activation. Then choose a workflow, connect any required credentials, and submit your task.',
  },
  {
    q: 'SOC 2 / GDPR / security details?',
    a: 'SOC 2 Type II audit in progress. GDPR compliant since launch. AES-256 at rest, TLS 1.3 in transit. Detailed security overview at /security.',
  },
];

// FAQPage structured data, built from the same QA source so it can never drift
// from the visible copy. Eligible for the FAQ rich result in Google search.
const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: QA.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export function Faq() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto">faq</p>
          <h2 className="mt-5 text-display-lg lowercase">
            <span className="text-grad">common</span>{' '}
            <span className="text-grad-brand">questions.</span>
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion.Root type="single" collapsible className="space-y-2.5">
            {QA.map((item, i) => (
              <Accordion.Item
                key={i}
                value={`item-${i}`}
                className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors data-[state=open]:bg-white/[0.04]"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium text-ink transition-colors hover:text-white">
                    <span>{item.q}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden text-[14.5px] leading-relaxed text-ink-dim data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="px-5 pb-5">{item.a}</div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </section>
  );
}

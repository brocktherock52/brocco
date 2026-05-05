'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

const QA = [
  {
    q: 'What does brocco actually do for me?',
    a: 'Brocco runs multiple AI agents in parallel from a single prompt. Pick agents on the left, type a goal, hit Run, and watch each agent work in its own pane with live tool calls and streaming output. The recipes gallery has 11 ready-to-run workflows: market research, launch day, customer deep dive, content sprint, and more.',
  },
  {
    q: 'Do I need an API key to start?',
    a: 'Free tier: yes, you bring your own key (Anthropic, OpenAI, or any OpenAI-compatible endpoint like Ollama running locally). It is stored in your browser only, never on our servers. Paid tiers: we cover the tokens; you just pay per run.',
  },
  {
    q: 'Which models are supported?',
    a: 'Anthropic: Claude Opus 4.7 (1M context), Sonnet 4.6, Haiku 4.5. OpenAI-compatible (any endpoint): GPT-4o and successors, plus local models via Ollama, vLLM, llama.cpp, OpenRouter, Groq, Together. Switch in the BYOK panel any time.',
  },
  {
    q: 'What if I exceed my monthly run limit?',
    a: 'Runs over the included quota are billed at $0.05 each on Solo and $0.03 each on Team. No surprise overages. Hard-cap usage in dashboard settings. Free tier never overcharges since you are using your own key.',
  },
  {
    q: 'Do you train models on my data?',
    a: 'No. Ever. On the free tier, your prompts go directly from your browser to your model provider; brocco never sees them. On paid tiers, our hosted runtime calls Anthropic with zero-data-retention enabled by default.',
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
    a: 'Median time from signup to first successful run is 11 minutes. The starter pack includes 4 ready agents (researcher, coder, outreach, supervisor) and 11 tools. Drop a markdown file, hit run.',
  },
  {
    q: 'SOC 2 / GDPR / security details?',
    a: 'SOC 2 Type II audit in progress. GDPR compliant since launch. AES-256 at rest, TLS 1.3 in transit. Detailed security overview at /security.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pill mx-auto">FAQ</p>
          <h2 className="mt-5 text-display-lg text-grad">Common questions.</h2>
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

'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

const buildQuestions = (hostedAvailable: boolean) => [
  {
    q: 'What does brocco actually do for me?',
    a: 'Brocco lets you select multiple AI agents, send them one goal, and review their responses and tool activity in separate panes. Recipes provide starting prompts for tasks such as research, planning, and drafting. Live runs require a paid subscription and configured model access.',
  },
  {
    q: 'Why not just use my Claude subscription?',
    a: 'Brocco organizes multiple agent responses in one workspace, with shared goals, saved projects, and export options. A Claude chat subscription is separate from Anthropic API access. If you use your own key in Brocco, your model provider bills that usage separately from your Brocco subscription.',
  },
  {
    q: 'What is included in the 7-day trial?',
    a: 'The trial is a seven-day dashboard preview. Choose Solo or Team, add a payment card at secure checkout, then create your account to claim the workspace. Explore the workspace and sample workflows; live tool calls and agent runs require an active paid subscription. You can confirm early activation to end the preview and start your paid plan sooner.',
  },
  {
    q: 'When will I be charged?',
    a: 'Your selected plan starts automatically when the seven-day trial ends: Solo is $49 monthly or $490 annually; Team is $199 monthly or $1,990 annually. It renews each billing period until you cancel. Cancel in the billing portal before the trial ends to avoid the first charge. If you confirm early activation, your paid subscription begins then.',
  },
  {
    q: 'Do I need an API key to preview the dashboard?',
    a: hostedAvailable
      ? 'No API key is needed for the dashboard preview. Live tools require a paid plan. Hosted AI is available within your plan limits; attachments and some integrations need your own credentials. Adding a key does not unlock tools during the preview.'
      : 'No API key is needed for the dashboard preview. Live tools require both a paid plan and your own Anthropic or xAI API key. Your provider bills usage separately from your Brocco subscription. Adding a key does not unlock tools during the preview.',
  },
  {
    q: 'Which models are supported?',
    a: 'The dashboard supports Anthropic Claude and xAI Grok. Connect the API key for your chosen provider and select an available model in the dashboard. Provider usage is billed separately when you use your own key.',
  },
  {
    q: 'What if I exceed my monthly run limit?',
    a: hostedAvailable
      ? 'Hosted runs stop at your monthly or daily plan limit; Brocco does not automatically bill per-run overages. Wait for the limit to reset or connect your own supported API key, with usage billed by your provider. Each agent counts separately. Trial accounts cannot run live tools.'
      : 'Hosted AI is not currently included. Paid tools use your own supported API key, and your provider bills usage under its own limits and pricing. Brocco does not automatically charge per-run overages. Trial accounts cannot run live tools.',
  },
  {
    q: 'Do you train models on my data?',
    a: 'See our privacy and security pages for details about how prompts, model providers, and integrations handle your data. The dashboard preview uses examples; live workflows send the data needed to the model and tools you choose.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Open billing from your account to cancel through Stripe. Our terms provide for a prorated refund of the unused portion of paid plans on cancellation in good standing. Contact help@brocco.dev for refund assistance.',
  },
  {
    q: 'How is this different from Zapier or n8n?',
    a: 'Zapier and n8n run pre-defined steps. Brocco agents reason: they decide which tool to call, read the result, and adapt. Use Zapier when steps are deterministic. Use Brocco when the workflow needs judgement.',
  },
  {
    q: 'Can I self-host?',
    a: 'The Solo and Team offer on this page is access to the Brocco web dashboard. Refer to the public repository for available code and setup information. Contact us about deployment requirements before relying on a self-hosted setup.',
  },
  {
    q: 'How long until I have my first agent running?',
    a: 'Add your card at checkout, then create your account to preview the dashboard. Live runs unlock when your paid subscription starts after seven days, or sooner if you confirm early activation. Then choose a workflow, connect any required credentials, and submit your task.',
  },
  {
    q: 'Where can I review data handling and security details?',
    a: 'Our privacy policy describes saved project data, model requests, and API-key handling. Review your model provider\'s own data policies too. Contact help@brocco.dev for questions about controls or documentation required by your team.',
  },
];

export function Faq({ hostedAvailable = false }: { hostedAvailable?: boolean }) {
  const QA = buildQuestions(hostedAvailable);
  // The structured data uses the same availability-aware copy as the page.
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: QA.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
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

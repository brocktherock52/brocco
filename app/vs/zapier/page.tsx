import type { Metadata } from 'next';
import { ComparePage } from '@/components/compare-page';

export const metadata: Metadata = {
  title: 'brocco vs Zapier - agents vs Zaps',
  description:
    'Zapier runs deterministic step chains. Brocco runs reasoning agents that pick the next tool dynamically. Compare on judgment, audit logs, BYOK, and per-run cost.',
  alternates: { canonical: '/vs/zapier' },
  openGraph: {
    title: 'brocco vs Zapier',
    description: 'Agents that reason vs Zaps that execute.',
  },
};

export default function VsZapierPage() {
  return (
    <ComparePage
      competitor="Zapier"
      competitorTagline="They are great when steps never change shape; we are great when judgment is required."
      hero={{
        eyebrow: 'Compare',
        titleA: 'brocco vs Zapier.',
        titleB: 'Reason vs execute.',
        subtitle:
          'Zapier runs the same step chain every time. Brocco agents read the data and decide what to do next. Use Zapier when the workflow is deterministic. Use brocco when it needs judgment.',
      }}
      oneLine={{
        brocco:
          'A multi-agent dashboard. The agent reads each step output, picks the next tool, and adapts. Full JSONL trace. Paid plan required; BYOK, or hosted where configured.',
        competitor:
          'A workflow automation platform with 6,000+ app integrations. Triggers and pre-defined Zap steps. No-code, fast to ship deterministic chains.',
      }}
      matrix={[
        { label: 'Decision model', brocco: 'Agent reasons each step', competitor: 'Pre-defined Zap chain' },
        { label: 'Handles input shape changes', brocco: true, competitor: 'Partial' },
        { label: 'Apps / integrations', brocco: '8 first-class + custom tool factory', competitor: '6,000+' },
        { label: 'Audit log', brocco: 'JSONL, exportable', competitor: 'Task history (UI only)' },
        { label: 'BYOK (LLM provider)', brocco: true, competitor: false },
        { label: 'Free tier', brocco: false, competitor: '100 tasks / mo' },
        { label: 'Paid entry', brocco: '$49 / mo (Solo)', competitor: '$20 / mo (Starter)' },
        { label: 'Cost per run / task', brocco: 'Subscription plus provider usage with BYOK', competitor: '$0.20 / task' },
        { label: 'Self-host', brocco: true, competitor: false },
        { label: 'REST API to invoke', brocco: 'POST /api/v1/run (SSE)', competitor: 'Webhooks' },
        { label: 'Inside Claude Desktop (MCP)', brocco: true, competitor: false },
        { label: 'Reasoning over reads (multi-step)', brocco: true, competitor: false },
      ]}
      wins={{
        brocco: [
          'The workflow needs judgment, not just a fixed pipeline.',
          'You want a JSONL audit log your security team can review.',
          'You want to use your own Anthropic or xAI provider account on a paid plan.',
          'You hit Zap-shape-change errors weekly and want a system that adapts.',
          'You want to expose the agent inside Claude Desktop or Cursor.',
        ],
        competitor: [
          'The workflow is fully deterministic and never changes shape.',
          'You need to wire 6,000+ apps and would rather not write code.',
          'A non-technical teammate owns the automation.',
          'Cost matters and the chain is short (1-3 steps).',
        ],
      }}
      faq={[
        {
          q: 'Can brocco replace all my Zaps?',
          a: 'Probably not. Zaps that are pure if-this-then-that are best in Zapier: fast to build, cheap, predictable. Zaps that break when input shape changes or that require reading + deciding are exactly where brocco shines.',
        },
        {
          q: 'How do I trigger a brocco agent from a Zap?',
          a: 'The current /api/v1/run endpoint requires a signed-in Brocco session, a paid subscription, and configured hosted AI. An Anthropic key as a Bearer token does not grant access. Use the dashboard for supported runs; a standalone Zapier API credential flow is not currently offered.',
        },
        {
          q: 'What is the actual cost difference?',
          a: 'Brocco Solo is $49/month or $490/year; Team is $199/month or $1,990/year. When hosted AI is unavailable, your own API key is required and your provider bills usage separately. Compare total subscription and provider costs for your actual workflow. The seven-day preview does not include live runs.',
        },
        {
          q: 'Do you have native Slack / Notion / Stripe integrations?',
          a: 'Yes. Stripe, Slack, Discord, Postgres, Gmail, plus a tool factory pattern that lets you wire any HTTP API in ~30 lines of Python. We are not trying to match 6,000 integrations; we ship the ones agents actually need.',
        },
      ]}
    />
  );
}

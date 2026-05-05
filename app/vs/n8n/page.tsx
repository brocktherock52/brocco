import type { Metadata } from 'next';
import { ComparePage } from '@/components/compare-page';

export const metadata: Metadata = {
  title: 'brocco vs n8n — agents vs nodes',
  description:
    'n8n is open-source workflow automation with hundreds of nodes. Brocco is a multi-agent reasoning dashboard. Compare on host model, decision logic, BYOK, audit trail, and integration shape.',
  alternates: { canonical: '/vs/n8n' },
  openGraph: {
    title: 'brocco vs n8n',
    description: 'Reasoning agents vs node-graph workflows.',
  },
};

export default function VsN8nPage() {
  return (
    <ComparePage
      competitor="n8n"
      competitorTagline="They are great at hand-built node graphs; we are great when the graph should write itself."
      hero={{
        eyebrow: 'Compare',
        titleA: 'brocco vs n8n.',
        titleB: 'Reason vs route.',
        subtitle:
          'n8n is the open-source workflow engine for builders who want full control of every node. Brocco is the agentic dashboard for builders who want the agent to read the data and decide what runs next. Both ship today, both are good. Different shapes.',
      }}
      oneLine={{
        brocco:
          'A multi-agent reasoning dashboard. The agent picks the next tool. JSONL audit log. BYOK on free, hosted on paid.',
        competitor:
          'An open-source workflow automation engine with hundreds of pre-built nodes. Self-hosted or n8n Cloud. You design the graph; n8n executes it.',
      }}
      matrix={[
        { label: 'Decision model', brocco: 'Agent reasons each step', competitor: 'Hand-built node graph' },
        { label: 'Self-hostable', brocco: true, competitor: true },
        { label: 'Open source', brocco: 'Charter runtime (MIT)', competitor: 'Fair-code (Sustainable Use)' },
        { label: 'Built-in integrations', brocco: '8 first-class + tool factory', competitor: '400+ nodes' },
        { label: 'BYOK (LLM provider)', brocco: true, competitor: 'AI nodes only' },
        { label: 'JSONL audit log per run', brocco: true, competitor: 'Execution log (UI)' },
        { label: 'Visual editor', brocco: 'Markdown agents', competitor: 'Drag-drop canvas' },
        { label: 'Free tier', brocco: '100 runs / mo BYOK', competitor: 'Free self-host or Starter cloud' },
        { label: 'Paid entry', brocco: '$49 / mo (Solo)', competitor: '$24 / mo (Starter Cloud)' },
        { label: 'AI agent capability', brocco: 'Native (the product)', competitor: 'AI nodes (LangChain integration)' },
        { label: 'MCP server (Claude Desktop)', brocco: true, competitor: false },
        { label: 'REST API to invoke', brocco: 'POST /api/v1/run', competitor: 'Webhook nodes' },
      ]}
      wins={{
        brocco: [
          'You want the agent to choose the path, not pre-define it.',
          'Your workflow needs reasoning, not just routing.',
          'You want a clean JSONL audit log per run for compliance.',
          'You bring your own Claude key and want zero data retention.',
          'You need the same agents inside Claude Desktop, Cursor, and a CLI.',
        ],
        competitor: [
          'The workflow is well-defined and you want every node visible.',
          'You need wide integration coverage (400+ apps) out of the box.',
          'Your team prefers a drag-and-drop canvas to markdown agents.',
          'You want to self-host on your own infra with no per-run pricing.',
          'You are wiring deterministic data pipelines (ETL, sync jobs, alerts).',
        ],
      }}
      faq={[
        {
          q: 'Can I run brocco from inside an n8n workflow?',
          a: 'Yes. Use n8n\'s HTTP Request node, POST to /api/v1/run with a Bearer Anthropic key, and the brocco run streams back via SSE. Treat brocco as the "reasoning step" in an otherwise deterministic n8n graph.',
        },
        {
          q: 'Does n8n already have AI agents?',
          a: 'Yes — n8n ships AI Agent and LangChain nodes. They are great when you want one node in a graph to make a decision. If the entire workflow is the agent, brocco is the right tool.',
        },
        {
          q: 'Is brocco open source like n8n?',
          a: 'The charter runtime under brocco is MIT-licensed. The hosted dashboard, audit pipeline, and Stripe billing are proprietary. Self-host the runtime free; pay for the hosted experience.',
        },
        {
          q: 'Cost comparison?',
          a: 'n8n self-hosted: free + your VPS cost. n8n Starter Cloud: $24/mo for 2,500 executions. Brocco free: 100 runs/mo BYOK. Brocco Solo: $49/mo with 2,000 runs covered. n8n is cheaper at high volume of simple steps; brocco is cheaper when each "task" is one reasoning run instead of 12 pre-defined nodes.',
        },
      ]}
    />
  );
}

import type { Metadata } from 'next';
import { ComparePage } from '@/components/compare-page';

export const metadata: Metadata = {
  title: 'brocco vs Devin — multi-agent dashboard vs autonomous SWE',
  description:
    'Devin is an autonomous AI software engineer. Brocco is a multi-agent dashboard for ops, research, content, and outreach. Compare on visibility, parallelism, BYOK, and price.',
  alternates: { canonical: '/vs/devin' },
  openGraph: {
    title: 'brocco vs Devin',
    description: 'Watch agents work in parallel vs hand off to a single autonomous engineer.',
  },
};

export default function VsDevinPage() {
  return (
    <ComparePage
      competitor="Devin"
      competitorTagline="They aim at autonomous SWE; we aim at every workflow that is not code."
      hero={{
        eyebrow: 'Compare',
        titleA: 'brocco vs Devin.',
        titleB: 'Different bets.',
        subtitle:
          'Devin is a single autonomous engineer that takes a ticket and ships a PR. Brocco is a multi-agent dashboard where you watch 888 specialists run in parallel on whatever your day requires. Different bets, different prices.',
      }}
      oneLine={{
        brocco:
          'A multi-agent dashboard. 888 specialists, 13 tools, parallel panes, JSONL audit log. BYOK on free, hosted on paid.',
        competitor:
          'An autonomous AI engineer. Reads a task, plans, codes, runs tests, ships a PR. One agent, one pane, async by default.',
      }}
      matrix={[
        { label: 'Best for', brocco: 'Ops + research + content + outreach', competitor: 'Software engineering tasks' },
        { label: 'Pane model', brocco: 'N parallel panes (Broadcast)', competitor: '1 sandbox at a time' },
        { label: 'Visibility during run', brocco: 'Live tool calls + token stream', competitor: 'Activity log + replay' },
        { label: 'BYOK', brocco: true, competitor: false },
        { label: 'Free tier', brocco: '100 runs / mo BYOK', competitor: false },
        { label: 'Paid entry', brocco: '$49 / mo (Solo)', competitor: '$50 - $200+ / mo' },
        { label: 'JSONL audit log', brocco: true, competitor: 'Task history' },
        { label: 'REST API to invoke', brocco: 'POST /api/v1/run (SSE)', competitor: 'Slack + UI' },
        { label: 'Self-host / on-prem', brocco: true, competitor: false },
        { label: 'MCP server for Claude Desktop', brocco: true, competitor: false },
        { label: 'Custom Python tools', brocco: true, competitor: 'Limited' },
        { label: 'Outreach / content / research agents', brocco: true, competitor: false },
      ]}
      wins={{
        brocco: [
          'You want to run 5 agents at once on different sub-tasks.',
          'Your work is a mix of research, outreach, planning, and content.',
          'You bring your own Claude key and want the run on your tokens.',
          'You need an audit log your security team will sign off on.',
          'You want the agents available inside Claude Desktop, n8n, or Zapier.',
        ],
        competitor: [
          'You have a backlog of well-scoped engineering tickets.',
          'You want a single autonomous agent to handle the whole loop (plan → code → test → PR).',
          'You are a small team and want async dev work happening overnight.',
          'You are okay with $50-$200+/mo and a single-pane workflow.',
        ],
      }}
      faq={[
        {
          q: 'Is brocco trying to be Devin?',
          a: 'No. Devin is betting on full autonomy in software engineering. Brocco bets on visibility and parallelism across every workflow that is NOT code. We share infrastructure (Claude, sandbox, tool calls), not market.',
        },
        {
          q: 'Can brocco write code?',
          a: 'Yes — brocco has a coder agent that plans, writes, and saves files. It is good for small surgical changes (utility functions, single-file scripts, prototypes). For multi-file refactors and shipping PRs, Devin or Cursor are stronger today.',
        },
        {
          q: 'How transparent is each run?',
          a: 'Brocco shows every tool call, every result, every token, in real time, in a separate pane per agent, exported as JSONL. Devin shows you a replayable activity log when it finishes. Both visible — different shapes.',
        },
        {
          q: 'Pricing comparison?',
          a: 'Brocco: free tier (100 runs BYOK), Solo $49/mo (2,000 runs covered), Team $199/mo (10,000 runs). Devin: tiered, starts higher, public pricing varies. If you are spending under $30/mo on agent runs today, brocco is dramatically cheaper.',
        },
      ]}
    />
  );
}

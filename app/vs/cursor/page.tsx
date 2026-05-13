import type { Metadata } from 'next';
import { ComparePage } from '@/components/compare-page';

export const metadata: Metadata = {
  title: 'brocco vs Cursor — agentic dashboard vs IDE',
  description:
    'Cursor is the best AI-native code editor. Brocco is the multi-agent dashboard for ops, research, and content workflows. Compare on parallel agents, BYOK, audit trails, and pricing.',
  alternates: { canonical: '/vs/cursor' },
  openGraph: {
    title: 'brocco vs Cursor',
    description: 'Multi-agent dashboard vs AI code editor. Side-by-side feature matrix.',
  },
};

export default function VsCursorPage() {
  return (
    <ComparePage
      competitor="Cursor"
      competitorTagline="They are great at editor agents; we are great at ops + content + research agents."
      hero={{
        eyebrow: 'Compare',
        titleA: 'brocco vs Cursor.',
        titleB: 'Different jobs.',
        subtitle:
          'Cursor lives inside your code editor. Brocco runs your AI team in parallel for everything that is not code: research, outreach, planning, content, ops. Same Claude under the hood, very different surface.',
      }}
      oneLine={{
        brocco:
          'A multi-agent dashboard. Type one goal, your AI team works in parallel with full JSONL audit logs. BYOK or hosted.',
        competitor:
          'An AI-native fork of VS Code with a built-in agent that edits files, runs commands, and reviews diffs. Best when the work IS code.',
      }}
      matrix={[
        { label: 'Primary surface', brocco: 'Browser dashboard + PWA', competitor: 'Desktop IDE' },
        { label: 'Best for', brocco: 'Ops, research, outreach, content', competitor: 'Writing and editing code' },
        { label: 'Agents in parallel', brocco: 'Up to 9 (Broadcast)', competitor: '1 active agent' },
        { label: 'Built-in tool registry', brocco: '13 (search, http, file, memory, delegate)', competitor: 'File ops + shell + Cursor tools' },
        { label: 'BYOK', brocco: true, competitor: true },
        { label: 'Free tier', brocco: '100 runs / mo (BYOK)', competitor: 'Free with limits' },
        { label: 'Paid entry', brocco: '$49 / mo (Solo)', competitor: '$20 / mo (Pro)' },
        { label: 'JSONL audit trail', brocco: true, competitor: false },
        { label: 'MCP server (use inside Claude Desktop)', brocco: true, competitor: 'Partial' },
        { label: 'REST API', brocco: 'POST /api/v1/run', competitor: false },
        { label: 'Self-host', brocco: true, competitor: false },
        { label: 'Browser-first PWA', brocco: true, competitor: false },
        { label: 'Custom Python tools (factory pattern)', brocco: true, competitor: false },
      ]}
      wins={{
        brocco: [
          'You are a solo founder, ops lead, or PM, not a full-time engineer.',
          'You want one prompt to fan out to 5 agents at once (Broadcast).',
          'You need an audit log your security team will actually approve.',
          'You want to expose brocco agents inside Claude Desktop, n8n, or Zapier.',
          'You bring your own Anthropic key and want zero data retention.',
        ],
        competitor: [
          'Your job is writing and editing code, full stop.',
          'You want diff-aware suggestions and inline completions.',
          'You live in VS Code or a fork and do not want to leave it.',
          'You need agentic edits across a large repo (multi-file refactors).',
        ],
      }}
      faq={[
        {
          q: 'Can I use brocco inside Cursor?',
          a: 'Yes. Brocco exposes a REST API and an MCP server, so you can trigger any brocco agent from Cursor commands or from a custom Cursor extension. Many users run Cursor for code and brocco for everything else in parallel.',
        },
        {
          q: 'Why not just use Cursor for ops?',
          a: 'Cursor is optimized for in-editor edits. Ops, outreach, and research need a dashboard with parallel panes, broadcast prompts, and a JSONL log you can hand to compliance. That is what brocco is.',
        },
        {
          q: 'Is brocco cheaper than Cursor?',
          a: 'Not by sticker price. Cursor Pro is $20/mo, brocco Solo is $49/mo. Brocco covers more tokens at Solo and ships a free BYOK tier with 100 runs/mo. Total cost depends on usage.',
        },
        {
          q: 'Do they share any infrastructure?',
          a: 'Both are built on Claude. Both support BYOK. Both stream tool calls. After that they diverge: Cursor mounts agents inside an IDE, brocco mounts them inside a workflow dashboard.',
        },
      ]}
    />
  );
}

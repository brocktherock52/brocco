// Blog post seeds — high-intent SEO targets. These render as full pages
// today; long-form copy gets filled in iteratively. Each entry is a
// real, indexable URL with H1 + meta description + outline.

export interface PostSeed {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  keywords: string[];
  outline: { h2: string; bullets: string[] }[];
  intro: string;
}

export const POSTS: PostSeed[] = [
  {
    slug: 'agentic-ai-dashboard',
    title: 'What an agentic AI dashboard actually looks like in 2026',
    description:
      'A walkthrough of multi-agent dashboards, tool registries, and audit logs. Real screenshots from production agents.',
    date: '2026-05-05',
    readingMinutes: 7,
    keywords: ['agentic AI dashboard', 'multi-agent dashboard', 'AI agents 2026'],
    intro:
      'The most common question we get is "why do I need a dashboard at all?" Here is the honest answer: you do not, until you run more than two agents in parallel and want to know what they did.',
    outline: [
      {
        h2: 'The single-pane fallacy',
        bullets: [
          'Cursor, Devin, and Claude Desktop all default to one pane',
          'Why one pane fails the second you broadcast a goal',
          'The shape of a real multi-agent dashboard',
        ],
      },
      {
        h2: 'What goes in the audit log',
        bullets: [
          'JSONL events: prompt, tool_call, tool_result, text, done',
          'Why CSV exports lose the structure',
          'How brocco renders the same JSONL into a live timeline',
        ],
      },
      {
        h2: 'Tool registries vs walled gardens',
        bullets: [
          'Zapier-style: pre-built integrations, no custom logic',
          'Brocco-style: 13 built-in tools + a Python factory you can wire in 30 lines',
        ],
      },
    ],
  },
  {
    slug: 'mcp-server-tools-claude-desktop',
    title: 'Building MCP server tools for Claude Desktop (with examples)',
    description:
      'How brocco exposes its 9 agents as Model Context Protocol tools inside Claude Desktop. Config, code, and gotchas.',
    date: '2026-05-04',
    readingMinutes: 9,
    keywords: ['MCP server', 'Claude Desktop tools', 'Model Context Protocol'],
    intro:
      'MCP is the wire protocol Anthropic shipped so any agent runtime can register itself as a tool inside Claude Desktop. Here is exactly how brocco does it.',
    outline: [
      { h2: 'What MCP gives you', bullets: ['Tool definitions', 'Streaming results', 'No vendor lock-in'] },
      { h2: 'A minimal MCP server in 40 lines', bullets: ['Python', 'Type signatures', 'Returning structured output'] },
      { h2: 'Wiring it into Claude Desktop config', bullets: ['claude_desktop_config.json', 'Env vars', 'Restart and verify'] },
      { h2: 'How brocco maps 9 agents to MCP', bullets: ['One tool per agent', 'Streaming SSE → MCP chunks', 'BYOK passthrough'] },
    ],
  },
  {
    slug: 'byok-claude-explained',
    title: 'BYOK explained: bring your own Anthropic key, keep your data',
    description:
      'Why BYOK matters, how it actually works in brocco, and the security posture we ship by default.',
    date: '2026-05-03',
    readingMinutes: 6,
    keywords: ['BYOK Claude', 'bring your own key', 'Anthropic ZDR'],
    intro:
      'BYOK ("bring your own key") sounds like a pricing trick. It is actually a security posture. Here is the difference, and what brocco ships by default.',
    outline: [
      { h2: 'The three BYOK postures', bullets: ['Server proxy', 'Client direct', 'Hosted with ZDR'] },
      { h2: 'How brocco does it', bullets: ['Browser → Anthropic direct on free tier', 'Hosted runtime with ZDR on paid', 'Audit log stays on your side'] },
      { h2: 'What "zero data retention" actually means', bullets: ['Anthropic side: not stored after the run', 'Brocco side: nothing logged after the JSONL is exported'] },
    ],
  },
  {
    slug: 'broadcast-pattern-multi-agent',
    title: 'The broadcast pattern: one prompt to N agents, in parallel',
    description:
      'Why broadcast mode is the killer feature most agent platforms missed, with three example workflows.',
    date: '2026-05-02',
    readingMinutes: 5,
    keywords: ['multi-agent broadcast', 'parallel agents', 'agent fan-out'],
    intro:
      'When you stop thinking of agents as one-at-a-time and start thinking of them as a team you broadcast to, every workflow gets shorter. Three examples.',
    outline: [
      { h2: 'Workflow 1: launch sprint', bullets: ['researcher + planner + outreach + designer + analyst, parallel', '3 hours of work in one prompt'] },
      { h2: 'Workflow 2: customer deep dive', bullets: ['researcher + outreach to one named lead', 'Output: brief + cold email pair'] },
      { h2: 'Workflow 3: content sprint', bullets: ['Five posts on one topic, five different angles, in parallel'] },
    ],
  },
  {
    slug: 'ai-audit-log-jsonl',
    title: 'JSONL audit logs for AI agents (and why your security team will love you)',
    description:
      'Why JSONL beats SQL + CSV + UI-only logs for agent runs, with a working example you can grep.',
    date: '2026-05-01',
    readingMinutes: 5,
    keywords: ['AI audit log', 'agent run JSONL', 'compliance AI'],
    intro:
      'Every brocco run appends one JSONL file. You can grep it, diff it, and hand it to your security team. Here is why that beats every alternative.',
    outline: [
      { h2: 'Why JSONL', bullets: ['One event per line', 'Append-only', 'Greppable', 'Diffable across runs'] },
      { h2: 'Schema', bullets: ['ts, agent, step, type, payload', 'Tool calls + results inline'] },
      { h2: 'How to ship it to your SIEM', bullets: ['Vector', 'Datadog', 'Splunk forwarder'] },
    ],
  },
];

export function getPost(slug: string): PostSeed | null {
  return POSTS.find((p) => p.slug === slug) ?? null;
}

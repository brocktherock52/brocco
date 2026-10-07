import type { Metadata } from 'next';
import { ComparePage } from '@/components/compare-page';

export const metadata: Metadata = {
  title: 'brocco vs CrewAI - dashboard vs framework',
  description:
    'CrewAI is a Python framework for building multi-agent systems. Brocco is a hosted dashboard with the framework already built. Compare on time-to-first-run, BYOK, audit, and pricing.',
  alternates: { canonical: '/vs/crewai' },
  openGraph: {
    title: 'brocco vs CrewAI',
    description: 'Hosted dashboard vs Python framework.',
  },
};

export default function VsCrewAiPage() {
  return (
    <ComparePage
      competitor="CrewAI"
      competitorTagline="They are great when you want to author the orchestration; we are great when you want it ready to run."
      hero={{
        eyebrow: 'Compare',
        titleA: 'brocco vs CrewAI.',
        titleB: 'Use vs author.',
        subtitle:
          'CrewAI is the Python framework you reach for when you want to write your own multi-agent system. Brocco is the dashboard you open when you want one already running. Both target multi-agent. Very different time-to-value.',
      }}
      oneLine={{
        brocco:
          'A multi-agent dashboard with agents, tools, recipes, and a JSONL log. Paid plan required; BYOK, or hosted where configured.',
        competitor:
          'A Python framework + enterprise platform for designing, deploying, and monitoring multi-agent crews. You write the agents and tasks; CrewAI orchestrates them.',
      }}
      matrix={[
        { label: 'Surface', brocco: 'Browser dashboard + PWA', competitor: 'Python SDK + cloud platform' },
        { label: 'Time to first agent run', brocco: '~11 minutes', competitor: 'Hours to days' },
        { label: 'Author agents in', brocco: 'Markdown + YAML', competitor: 'Python (Crew, Agent, Task)' },
        { label: 'Built-in agents', brocco: '9 (researcher, coder, outreach, etc.)', competitor: 'Bring your own' },
        { label: 'Tool registry', brocco: '13 + factory', competitor: 'Bring your own + LangChain tools' },
        { label: 'BYOK (LLM provider)', brocco: true, competitor: true },
        { label: 'Free tier', brocco: false, competitor: 'Open-source SDK free' },
        { label: 'Paid entry', brocco: '$49 / mo (Solo)', competitor: 'Enterprise (custom)' },
        { label: 'JSONL audit per run', brocco: true, competitor: 'Custom logging' },
        { label: 'MCP server (Claude Desktop)', brocco: true, competitor: false },
        { label: 'REST API to invoke', brocco: 'POST /api/v1/run', competitor: 'Self-deployed endpoint' },
        { label: 'Self-host', brocco: true, competitor: true },
      ]}
      wins={{
        brocco: [
          'You want a working multi-agent dashboard today, not in two sprints.',
          'You want to use your own Anthropic or xAI provider account on a paid plan.',
          'You want a JSONL audit log out of the box for compliance.',
          'You want the agents inside Claude Desktop or n8n (MCP + REST).',
          'Your team is not Python-first.',
        ],
        competitor: [
          'You want to design the orchestration logic from scratch.',
          'Your team is Python-first and ships in production with custom code.',
          'You need precise control over how agents hand off, share state, and verify.',
          'You are building an internal product where the multi-agent layer is the moat.',
        ],
      }}
      faq={[
        {
          q: 'Can I deploy a CrewAI crew behind a brocco dashboard?',
          a: 'Yes. Wrap each CrewAI crew as a tool factory inside brocco. The brocco supervisor agent calls your crew via REST or local Python, gets the synthesized result, and continues the workflow. Best of both worlds.',
        },
        {
          q: 'When should I write my own with CrewAI instead?',
          a: 'When the orchestration is the product (you are shipping a multi-agent feature inside YOUR app). Use CrewAI to author the logic. Use brocco when multi-agent is the dashboard you need internally, not the thing you ship to customers.',
        },
        {
          q: 'Are the agent specs portable?',
          a: 'Sort of. Brocco agents are markdown + YAML with a tool list, easy to translate to a CrewAI Agent + Task pair. The reverse is also reasonable. Both ecosystems converge on "system prompt + allowed tools + decomposition."',
        },
        {
          q: 'Pricing reality?',
          a: 'CrewAI core is open source with your own hosting and provider costs. Brocco offers a seven-day dashboard preview with a card required; live tools require a paid plan. Brocco Solo is $49/month or $490/year; Team is $199/month or $1,990/year. When hosted AI is unavailable, connect your own supported API key; provider usage is billed separately.',
        },
      ]}
    />
  );
}

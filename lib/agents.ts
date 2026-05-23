// Built-in agent specs powering the /app demo.

export type AgentName =
  | 'supervisor'
  | 'researcher'
  | 'analyst'
  | 'outreach'
  | 'coder'
  | 'browser'
  | 'designer'
  | 'planner'
  | 'app_builder';

export interface Agent {
  name: AgentName;
  label: string;
  description: string;
  color: string; // hex
  ring: string; // tailwind ring color hex (kept simple)
  tools: string[];
  emoji?: string;
  sample: string; // sample goal that pre-fills the input
  // Character handles from the Brocco show universe. See [[brocco-episodic-bible]]
  // and the rendered episodes in public/assets/episodes/.
  personaName?: string;
  personaBio?: string;
}

export const AGENTS: Agent[] = [
  {
    name: 'supervisor',
    label: 'Supervisor',
    description: 'Decompose a goal, delegate to specialists, synthesize.',
    color: '#22C55E',
    ring: 'ring-emerald-400/30',
    tools: ['delegate', 'memory_get', 'memory_put', 'done'],
    emoji: '👑',
    sample: 'Run a launch sprint: research, draft tweets, write a landing hero, plan day-1 outreach.',
    personaName: 'Sully',
    personaBio: 'The boss croc. Crown, beige cardigan, claps once before he says nothing important.',
  },
  {
    name: 'researcher',
    label: 'Researcher',
    description: 'Web research and sourced briefs with citations.',
    color: '#67E8F9',
    ring: 'ring-cyan-400/30',
    tools: ['search_web', 'http_get', 'memory_put', 'file_save', 'done'],
    emoji: '🔍',
    sample: 'Brief me on the agentic AI market in 2026: top 3 platforms, wedge, pricing, weaknesses.',
    personaName: 'Reggie',
    personaBio: 'The footnote freak. Wire-frame glasses, clipboard. Asks "source?" before he asks your name.',
  },
  {
    name: 'analyst',
    label: 'Analyst',
    description: 'Pattern-finding and decision-grade structured reports.',
    color: '#A78BFA',
    ring: 'ring-violet-400/30',
    tools: ['search_web', 'http_get', 'memory_put', 'file_save', 'done'],
    emoji: '📊',
    sample: 'Compare Claude Opus 4.7 vs Sonnet 4.6 on cost, latency, and tool-use accuracy.',
    personaName: 'Ana',
    personaBio: 'The dashboard girl. Two violet monitors. Will sigh once before she answers your question.',
  },
  {
    name: 'outreach',
    label: 'Outreach',
    description: 'Cold messages that read like a human did the homework.',
    color: '#FBBF24',
    ring: 'ring-amber-400/30',
    tools: ['search_web', 'memory_put', 'file_save', 'done'],
    emoji: '💬',
    sample: 'Draft 3 cold emails to YC founders launching agentic workflow tools this quarter.',
    personaName: 'Olly',
    personaBio: 'The handshake. Headset, oversized mug, draft folder of 412 unfinished emails.',
  },
  {
    name: 'coder',
    label: 'Coder',
    description: 'Plan and write the smallest correct code change.',
    color: '#4ADE80',
    ring: 'ring-emerald-300/30',
    tools: ['search_web', 'http_get', 'file_save', 'done'],
    emoji: '⌨️',
    sample: 'Write a TypeScript debounce function with tests. ESM-only, no deps.',
    personaName: 'Cody',
    personaBio: 'The lone wolf. Hood up, Monster can, has not blinked since onboarding. Says "pushed."',
  },
  {
    name: 'browser',
    label: 'Browser',
    description: 'Crawl, follow links, extract structured data.',
    color: '#22D3EE',
    ring: 'ring-cyan-500/30',
    tools: ['search_web', 'http_get', 'memory_put', 'file_save', 'done'],
    emoji: '🌐',
    sample: 'Find the pricing pages of Cursor, Devin and Replit Agent and extract the tiers as a table.',
    personaName: 'Briar',
    personaBio: 'The lurker. Fedora, pinstripe vest, 847 tabs open. Saw your post in 2019. Remembers.',
  },
  {
    name: 'designer',
    label: 'Designer',
    description: 'Visual concepts and design briefs from a prompt.',
    color: '#F472B6',
    ring: 'ring-pink-400/30',
    tools: ['search_web', 'image_gen', 'file_save', 'done'],
    emoji: '🎨',
    sample: 'Three logo concepts for a calm, trustworthy fintech for solo traders. Dark theme.',
    personaName: 'Daisy',
    personaBio: 'The colorist. Pink beret, paint-splattered apron, currently designing a logo that is one circle.',
  },
  {
    name: 'planner',
    label: 'Planner',
    description: 'Turn a fuzzy goal into a numbered execution plan.',
    color: '#FB7185',
    ring: 'ring-rose-400/30',
    tools: ['search_web', 'memory_put', 'file_save', 'done'],
    emoji: '🗂️',
    sample: 'Plan a 7-day launch for a $49/mo SaaS with 0 audience and a $200 budget.',
    personaName: 'Penny',
    personaBio: 'The mother hen. Sticky note on her forehead, two clipboards (one for the other clipboard).',
  },
  {
    name: 'app_builder',
    label: 'App builder',
    description: 'Single-file working web app from a one-liner.',
    color: '#F59E0B',
    ring: 'ring-amber-500/30',
    tools: ['search_web', 'file_save', 'done'],
    emoji: '🔧',
    sample: 'Build a single-file pomodoro timer with keyboard shortcuts and dark mode.',
    personaName: 'Abby',
    personaBio: 'The sniper. Wrench behind one ear. Two words max. Already shipped your fix.',
  },
];

export const TOOLS_LIST = [
  'search_web',
  'http_get',
  'http_post',
  'memory_put',
  'memory_get',
  'memory_list',
  'file_save',
  'file_read',
  'shell_exec',
  'delegate',
  'image_gen',
  'voice_tts',
  'done',
];

export const RECIPES: { id: string; name: string; description: string; agents: AgentName[]; goal: string }[] = [
  {
    id: 'market-research',
    name: 'Market research',
    description: '3 agents survey competitors',
    agents: ['researcher', 'analyst', 'planner'],
    goal: 'Survey the top 5 competitors to brocco.dev. Compare pricing, wedge, weaknesses. Output a 1-page brief with a recommendation.',
  },
  {
    id: 'launch-day',
    name: 'Launch day',
    description: 'Tweets, HN post, landing copy in parallel',
    agents: ['outreach', 'researcher', 'planner'],
    goal: 'Today is launch day. Draft a Show HN post, 5 launch tweets, and the homepage hero copy. Be specific, no fluff.',
  },
  {
    id: 'customer-deep-dive',
    name: 'Customer deep dive',
    description: 'Research a lead from email + draft opener',
    agents: ['researcher', 'outreach'],
    goal: 'Research the founder of Linear from public sources. Draft a cold email pitching brocco for their ops team.',
  },
  {
    id: 'content-sprint',
    name: 'Content sprint',
    description: '5 short-form posts on a topic',
    agents: ['researcher', 'outreach', 'planner', 'designer'],
    goal: 'Topic: "How agentic AI replaces Zapier in 2026". Produce 5 LinkedIn posts, a Twitter thread, and 3 hero images.',
  },
];

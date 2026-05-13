// Custom-agent storage and templates.
//
// Users create custom agents through the /app/agents/new wizard. Each
// agent is local to the browser (localStorage) until auth lands; then
// we mirror server-side and add a marketplace.
//
// The shape mirrors built-in `Agent` from lib/agents.ts but adds a
// `template` field naming the base persona the user picked, and a
// `crocBase` slug telling the icon composer which built-in croc to
// remix.

import type { AgentName } from '@/lib/agents';

export type CustomCrocBase =
  | 'researcher'
  | 'planner'
  | 'outreach'
  | 'designer'
  | 'analyst'
  | 'coder'
  | 'ops'
  | 'supervisor'
  | 'browser';

export interface CustomAgent {
  /** stable id, derived from name + ts */
  id: string;
  /** user-chosen lowercase slug-safe name */
  name: string;
  /** display label, free text */
  label: string;
  /** short description shown in agent cards */
  description: string;
  /** accent hex */
  accent: string;
  /** template id the agent was forked from */
  template: TemplateId;
  /** which built-in croc the icon remixes */
  crocBase: CustomCrocBase;
  /** which tools the agent can call */
  tools: string[];
  /** the system prompt, generated from template + user inputs */
  systemPrompt: string;
  /** ts */
  createdAt: number;
}

export type TemplateId =
  | 'researcher'
  | 'closer'
  | 'reviewer'
  | 'analyst'
  | 'qa'
  | 'recruiter'
  | 'pm'
  | 'editor';

export interface AgentTemplate {
  id: TemplateId;
  label: string;
  description: string;
  defaultDescription: string;
  defaultAccent: string;
  defaultCrocBase: CustomCrocBase;
  defaultTools: string[];
  // Token {{topic}} gets replaced with the user's focus area
  systemPromptTemplate: string;
  examples: string[];
}

export const TEMPLATES: AgentTemplate[] = [
  {
    id: 'researcher',
    label: 'researcher',
    description: 'gathers sourced briefs on a topic you set',
    defaultDescription: 'sourced briefs on {{topic}} with citations',
    defaultAccent: '#67E8F9',
    defaultCrocBase: 'researcher',
    defaultTools: ['search_web', 'http_get', 'file_save'],
    systemPromptTemplate:
      'You are a senior research analyst focused on {{topic}}. Produce sourced briefs with citations. Be concise, factual, and decision-grade. Avoid speculation.',
    examples: ['ai infrastructure trends', 'b2b saas pricing', 'pre-foreclosure leads in michigan'],
  },
  {
    id: 'closer',
    label: 'closer',
    description: 'writes cold messages that read like a human did the homework',
    defaultDescription: 'cold outreach for {{topic}} that reads human',
    defaultAccent: '#FBBF24',
    defaultCrocBase: 'outreach',
    defaultTools: ['draft_email', 'http_get', 'file_save'],
    systemPromptTemplate:
      'You are a senior outbound rep targeting {{topic}}. Write short, specific cold messages that prove you did the homework. Never send. Always queue drafts for review.',
    examples: ['yc w26 design leads', 'detroit hvac smb owners', 'agency owners 5-20 ppl'],
  },
  {
    id: 'reviewer',
    label: 'reviewer',
    description: 'audits work and surfaces what to fix before ship',
    defaultDescription: 'reviews {{topic}} before ship',
    defaultAccent: '#A78BFA',
    defaultCrocBase: 'analyst',
    defaultTools: ['file_save', 'memory_put', 'memory_get'],
    systemPromptTemplate:
      'You are a sharp, kind reviewer for {{topic}}. Surface the three things that would most hurt this if shipped. Quote the offending text. Suggest the fix.',
    examples: ['landing-page copy', 'pull-request diffs', 'sales decks'],
  },
  {
    id: 'analyst',
    label: 'analyst',
    description: 'pattern-finds in your data and makes a call',
    defaultDescription: 'analyzes {{topic}} and proposes the next move',
    defaultAccent: '#A78BFA',
    defaultCrocBase: 'analyst',
    defaultTools: ['search_web', 'file_save', 'memory_put'],
    systemPromptTemplate:
      'You are a sharp decision-grade analyst on {{topic}}. Pattern-find. Always end with a single recommendation and the strongest counter.',
    examples: ['weekly reply-rate trend', 'churn cohort drift', 'cac payback by channel'],
  },
  {
    id: 'qa',
    label: 'qa',
    description: 'finds the bugs you missed in code or copy',
    defaultDescription: 'qa for {{topic}}: regressions, edge cases, bad copy',
    defaultAccent: '#4ADE80',
    defaultCrocBase: 'coder',
    defaultTools: ['file_save', 'http_get'],
    systemPromptTemplate:
      'You are a paranoid qa lead for {{topic}}. Find the worst regression, the most embarrassing edge case, and the dumbest copy mistake. Quote, suggest fix.',
    examples: ['react components', 'onboarding flow copy', 'pricing-page math'],
  },
  {
    id: 'recruiter',
    label: 'recruiter',
    description: 'sources, screens, and drafts outreach to candidates',
    defaultDescription: 'recruiting for {{topic}}',
    defaultAccent: '#22D3EE',
    defaultCrocBase: 'outreach',
    defaultTools: ['search_web', 'http_get', 'draft_email', 'file_save'],
    systemPromptTemplate:
      'You are a senior recruiter focused on {{topic}}. Source 10, screen on hard criteria, draft personalized outreach. Never claim to know the candidate.',
    examples: ['staff swes in seattle', 'cre brokers in nashville', 'crocstack design leads'],
  },
  {
    id: 'pm',
    label: 'pm',
    description: 'turns a goal into a phased plan with owners and dates',
    defaultDescription: 'plans {{topic}} as a phased project',
    defaultAccent: '#FB7185',
    defaultCrocBase: 'planner',
    defaultTools: ['file_save', 'memory_put', 'memory_get'],
    systemPromptTemplate:
      'You are a senior product manager planning {{topic}}. Break the goal into 5-7 phases. Each phase: deliverable, owner role, days, success criterion.',
    examples: ['ship a public beta', 'win a regulated market', 'kill tech debt q3'],
  },
  {
    id: 'editor',
    label: 'editor',
    description: 'rewrites copy until it cuts',
    defaultDescription: 'edits {{topic}} for clarity and bite',
    defaultAccent: '#F472B6',
    defaultCrocBase: 'designer',
    defaultTools: ['file_save', 'memory_put'],
    systemPromptTemplate:
      'You are a senior editor for {{topic}}. Rewrite for clarity, momentum, and bite. Cut 30%. Lead with the verb. Show the diff.',
    examples: ['landing-page copy', 'cold-email drafts', 'launch tweets'],
  },
];

const STORAGE_KEY = 'brocco:custom-agents';

export function getCustomAgents(): CustomAgent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as CustomAgent[];
    return [];
  } catch {
    return [];
  }
}

export function saveCustomAgent(agent: CustomAgent): void {
  if (typeof window === 'undefined') return;
  const all = getCustomAgents();
  const next = [...all.filter((a) => a.id !== agent.id), agent];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('brocco:custom-agents-changed'));
  } catch {}
}

export function deleteCustomAgent(id: string): void {
  if (typeof window === 'undefined') return;
  const all = getCustomAgents();
  const next = all.filter((a) => a.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('brocco:custom-agents-changed'));
  } catch {}
}

export function buildAgent(
  template: AgentTemplate,
  inputs: {
    name: string;
    label?: string;
    description?: string;
    topic: string;
    accent?: string;
    crocBase?: CustomCrocBase;
    tools?: string[];
  },
): CustomAgent {
  const safeName = inputs.name.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'custom-agent';
  const description = (inputs.description || template.defaultDescription).replace(/{{topic}}/g, inputs.topic || template.examples[0]);
  const systemPrompt = template.systemPromptTemplate.replace(/{{topic}}/g, inputs.topic || template.examples[0]);
  return {
    id: `${safeName}-${Date.now()}`,
    name: safeName,
    label: inputs.label || inputs.name,
    description,
    accent: inputs.accent || template.defaultAccent,
    template: template.id,
    crocBase: inputs.crocBase || template.defaultCrocBase,
    tools: inputs.tools || template.defaultTools,
    systemPrompt,
    createdAt: Date.now(),
  };
}

// All available tools the wizard can offer. Mirror the built-in
// tool registry semantically (lib/agents.ts tools field). If we add
// real backend tool routes later, validate against that registry.
export const TOOL_CATALOG: Array<{ id: string; label: string; description: string }> = [
  { id: 'search_web', label: 'search web', description: 'live web search via the configured provider' },
  { id: 'http_get', label: 'http get', description: 'fetch a url and read its content' },
  { id: 'http_post', label: 'http post', description: 'submit data to a webhook' },
  { id: 'draft_email', label: 'draft email', description: 'queue an email draft, never send' },
  { id: 'file_save', label: 'save file', description: 'write output to the user\'s workspace' },
  { id: 'memory_put', label: 'memory write', description: 'persist a fact for later runs' },
  { id: 'memory_get', label: 'memory read', description: 'recall a previously-saved fact' },
  { id: 'browser_open', label: 'open browser', description: 'navigate the chrome bridge to a page' },
  { id: 'image_gen', label: 'generate image', description: 'create an image from a text prompt' },
];

// Accent palette the wizard offers
export const ACCENT_OPTIONS: string[] = [
  '#67E8F9', // cyan
  '#22D3EE', // teal
  '#22C55E', // green
  '#4ADE80', // emerald
  '#FBBF24', // amber
  '#FB7185', // rose
  '#F472B6', // pink
  '#A78BFA', // violet
];

export const CROC_BASE_OPTIONS: CustomCrocBase[] = [
  'researcher',
  'planner',
  'outreach',
  'designer',
  'analyst',
  'coder',
  'ops',
  'supervisor',
  'browser',
];

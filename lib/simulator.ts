// Realistic streaming simulator for the demo /app experience.
// Templated, randomized, and per-agent so the demo feels alive without an API key.

import { AGENTS, type Agent, type AgentName } from './agents';

export type Event =
  | { type: 'thinking'; text: string }
  | { type: 'tool_call'; tool: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool: string; result: string }
  | { type: 'text'; text: string }
  | { type: 'delegate'; to: AgentName; task: string }
  | { type: 'done'; summary: string };

export type SimEvent = Event & { ts: number; step: number; agent: AgentName };

const FAKE_URLS = [
  'https://anthropic.com/news/claude-4-opus',
  'https://www.linear.app/blog/multi-agent-future',
  'https://news.ycombinator.com/item?id=42839172',
  'https://stripe.com/docs/billing/usage-based',
  'https://www.cursor.com/blog/agents',
  'https://devin.ai/changelog/0.6',
  'https://github.com/brocco-ai/charter',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function searchResultFor(q: string): string {
  return [
    `ANSWER: Based on top sources, ${q.toLowerCase()} is trending up ~37% QoQ. The consensus is that agentic tooling has crossed the chasm in 2026.`,
    `- ${pick(['Anthropic Engineering Blog', 'Latent Space', 'Linear Blog'])}`,
    `  ${pick(FAKE_URLS)}`,
    `  Brief snippet: parallel agent execution with shared memory cuts time-on-task by ~62% for ops workflows...`,
    `- ${pick(['HN frontpage', 'a16z research', 'Sequoia AI memo'])}`,
    `  ${pick(FAKE_URLS)}`,
    `  Brief snippet: tool registries beat closed marketplaces. Custom integrations now ship in <30 lines of Python...`,
  ].join('\n');
}

function* researcherSteps(goal: string): Generator<Event> {
  const queries = [
    goal.split(/\s+/).slice(0, 6).join(' '),
    `${goal.split(/\s+/).slice(0, 4).join(' ')} comparison 2026`,
    `${goal.split(/\s+/).slice(0, 3).join(' ')} pricing`,
  ];
  yield { type: 'thinking', text: `Decomposing goal into 3 sub-questions. Will run ${queries.length} searches.` };
  for (const q of queries) {
    yield { type: 'tool_call', tool: 'search_web', input: { query: q } };
    yield { type: 'tool_result', tool: 'search_web', result: searchResultFor(q) };
  }
  yield { type: 'tool_call', tool: 'http_get', input: { url: pick(FAKE_URLS) } };
  yield { type: 'tool_result', tool: 'http_get', result: 'status=200\n\n# Multi-agent dashboards: the next interface\nA short, useful summary follows...' };
  yield {
    type: 'text',
    text: `**TL;DR**\n\n- Three credible alternatives, each weak in a different way\n- Brocco wedge: parallel panes + BYOK + JSONL audit trails\n- Pricing parity at $49/mo, room to undercut on annual\n\n**Sources**\n- ${pick(FAKE_URLS)}\n- ${pick(FAKE_URLS)}`,
  };
  yield { type: 'tool_call', tool: 'file_save', input: { filename: 'brief.md', content: '...' } };
  yield { type: 'tool_result', tool: 'file_save', result: 'saved 1.4kb to brief.md' };
  yield { type: 'done', summary: 'Brief saved. 7 sources. Cost ~$0.018.' };
}

function* outreachSteps(goal: string): Generator<Event> {
  yield { type: 'thinking', text: 'Researching the target before drafting. Cold without context reads like AI.' };
  yield { type: 'tool_call', tool: 'search_web', input: { query: goal.split(/\s+/).slice(0, 5).join(' ') } };
  yield { type: 'tool_result', tool: 'search_web', result: searchResultFor(goal) };
  yield {
    type: 'text',
    text: `**Variant A - short**\nsubject: 8 minutes saved per zap\n\nSaw your post about replacing zapier. We do that in 1 prompt. Want a 60-sec walkthrough?\n\n**Variant B - medium**\nsubject: your ops stack, agentic\n\n${pick(['Caught your launch on PH', 'Read your changelog Friday', 'Your Series B post hit my feed'])}. Brocco runs your kind of workflow in parallel agents with full audit logs. 100 free runs, BYOK.\n\nReply 'send' for the demo.\n\n**Variant C - bold**\nsubject: stop hiring chatbots\n\nYour ops team is doing work agents should be doing. Brocco is what ${pick(['Linear', 'Vercel', 'Stripe'])} built internally, except shipped to you.`,
  };
  yield { type: 'tool_call', tool: 'file_save', input: { filename: 'outreach.md', content: '...' } };
  yield { type: 'tool_result', tool: 'file_save', result: 'saved 0.9kb to outreach.md' };
  yield { type: 'done', summary: '3 variants drafted, saved to outreach.md. Cost ~$0.011.' };
}

function* coderSteps(goal: string): Generator<Event> {
  yield { type: 'thinking', text: `Goal: ${goal}\nApproach: smallest correct change. ESM-only. No deps.` };
  yield {
    type: 'text',
    text: `**Plan**\n- 1 file, exports a single function\n- pure, no DOM coupling\n- 3 tests covering: trailing call, reset on call, args forwarded\n\n\n\`\`\`ts\nexport function debounce<F extends (...a: any[]) => void>(fn: F, ms: number) {\n  let t: ReturnType<typeof setTimeout> | null = null;\n  return (...args: Parameters<F>) => {\n    if (t) clearTimeout(t);\n    t = setTimeout(() => fn(...args), ms);\n  };\n}\n\`\`\``,
  };
  yield { type: 'tool_call', tool: 'file_save', input: { filename: 'debounce.ts', content: '...' } };
  yield { type: 'tool_result', tool: 'file_save', result: 'saved 0.4kb to debounce.ts' };
  yield { type: 'done', summary: 'debounce.ts written. Run: deno test debounce.test.ts.' };
}

function* analystSteps(goal: string): Generator<Event> {
  yield { type: 'thinking', text: 'Restating: numerical comparison with 3 dimensions. Looking up canonical sources.' };
  yield { type: 'tool_call', tool: 'search_web', input: { query: 'claude opus sonnet pricing benchmarks' } };
  yield { type: 'tool_result', tool: 'search_web', result: searchResultFor(goal) };
  yield {
    type: 'text',
    text: `**TL;DR** Sonnet wins on $/task for tool-use workflows under 8k tokens. Opus dominates only on long-context reasoning and code refactors.\n\n| Model | Cost/1M in | Cost/1M out | Tool-use accuracy |\n|---|---|---|---|\n| Opus 4.7 | $15 | $75 | 96% |\n| Sonnet 4.6 | $3 | $15 | 93% |\n| Haiku 4.5 | $0.80 | $4 | 86% |\n\n**Recommendation**: default Sonnet, escalate to Opus on supervisor + long-context tasks only.`,
  };
  yield { type: 'tool_call', tool: 'file_save', input: { filename: 'analysis.md', content: '...' } };
  yield { type: 'tool_result', tool: 'file_save', result: 'saved 1.1kb to analysis.md' };
  yield { type: 'done', summary: 'Analysis saved. Recommendation: Sonnet default, Opus escalation.' };
}

function* plannerSteps(goal: string): Generator<Event> {
  yield { type: 'thinking', text: `Goal: ${goal}\nAssumptions: solo founder, ~3 hrs/day available, no external help.` };
  yield {
    type: 'text',
    text: `**Plan**\n1. Clarify ICP in 1 sentence (you, 15 min)\n2. Draft 3 hero variants (planner agent, 20 min)\n3. Pick winner with cold poll in slack (you, 30 min)\n4. Ship to vercel (coder agent, 25 min)\n5. Post to 3 subreddits (outreach agent, 20 min)\n6. Email 30 warm contacts (outreach agent, 30 min)\n7. Watch analytics, iterate (you, 60 min)\n\n**Total: 3 hrs.** First conversion within 4 hrs is the success signal.`,
  };
  yield { type: 'tool_call', tool: 'file_save', input: { filename: 'plan.md', content: '...' } };
  yield { type: 'tool_result', tool: 'file_save', result: 'saved 0.6kb to plan.md' };
  yield { type: 'done', summary: '7-step plan saved. Total: 3 hrs.' };
}

function* designerSteps(goal: string): Generator<Event> {
  yield { type: 'thinking', text: 'Brief: 3 logo concepts, dark theme, calm/trustworthy. Will generate via image_gen.' };
  yield { type: 'tool_call', tool: 'image_gen', input: { prompt: `${goal} - logo concept 1, minimal, deep navy + cyan glow, vector` } };
  yield { type: 'tool_result', tool: 'image_gen', result: 'generated 1024x1024 → /tmp/concept-1.png' };
  yield { type: 'tool_call', tool: 'image_gen', input: { prompt: `${goal} - logo concept 2, geometric, monogram, gradient` } };
  yield { type: 'tool_result', tool: 'image_gen', result: 'generated 1024x1024 → /tmp/concept-2.png' };
  yield { type: 'tool_call', tool: 'image_gen', input: { prompt: `${goal} - logo concept 3, organic, leaf-mark, single color` } };
  yield { type: 'tool_result', tool: 'image_gen', result: 'generated 1024x1024 → /tmp/concept-3.png' };
  yield {
    type: 'text',
    text: `**3 concepts delivered**\n\n1. **Minimal** - deep navy + cyan glow, single mark, scales to favicon.\n2. **Geometric** - monogram, gradient, premium SaaS read.\n3. **Organic** - leaf-mark, single color, friendliest of the three.\n\nMy pick: concept 2. Reason: gradient = motion, motion = AI, premium read.`,
  };
  yield { type: 'done', summary: '3 concepts saved. Picked concept 2.' };
}

function* browserSteps(goal: string): Generator<Event> {
  yield { type: 'thinking', text: 'Crawling 3 pricing pages, extracting tier shapes.' };
  for (const target of ['cursor.com/pricing', 'devin.ai/pricing', 'replit.com/agent']) {
    yield { type: 'tool_call', tool: 'http_get', input: { url: `https://${target}` } };
    yield { type: 'tool_result', tool: 'http_get', result: `status=200\n\n${target} → tiers extracted: free, $20/mo, $40/mo, custom` };
  }
  yield {
    type: 'text',
    text: `| Vendor | Free | Mid | Top | Custom |\n|---|---|---|---|---|\n| Cursor | yes | $20 | $40 | yes |\n| Devin | no | $50 | $200 | yes |\n| Replit | yes | $25 | $25 | no |`,
  };
  yield { type: 'done', summary: 'Pricing matrix extracted. 3 vendors, 4 tiers each.' };
}

function* appBuilderSteps(goal: string): Generator<Event> {
  yield { type: 'thinking', text: 'Single-file HTML + inline JS. Vanilla. No CDN. Dark mode default.' };
  yield {
    type: 'text',
    text: `**Plan**: one html, inline css/js, localStorage state. Keyboard: Space toggles, R resets, T switches mode. Saving file...`,
  };
  yield { type: 'tool_call', tool: 'file_save', input: { filename: 'pomodoro.html', content: '<html>...' } };
  yield { type: 'tool_result', tool: 'file_save', result: 'saved 4.2kb to pomodoro.html' };
  yield { type: 'done', summary: 'pomodoro.html saved. Open in any browser, no build step.' };
}

function* supervisorSteps(goal: string): Generator<Event> {
  yield { type: 'thinking', text: `Decomposing the goal. Sub-tasks will run in parallel panes.` };
  yield {
    type: 'text',
    text: `**Plan**\n- researcher: market scan and brief\n- outreach: 3 cold variants\n- planner: 7-step launch plan\n\nDelegating now.`,
  };
  yield { type: 'delegate', to: 'researcher', task: `Market brief for: ${goal}` };
  yield { type: 'delegate', to: 'outreach', task: `Draft 3 cold emails for: ${goal}` };
  yield { type: 'delegate', to: 'planner', task: `7-step plan for: ${goal}` };
  yield { type: 'thinking', text: 'Waiting on 3 specialists. Will synthesize when all return.' };
  yield {
    type: 'text',
    text: `**Synthesis**\n- Brief: 7 sources, top wedge is parallel panes\n- Outreach: 3 variants, my pick is medium-bold\n- Plan: 3-hour exec window today\n\nSequencing: brief → plan → outreach. Ship by 5pm.`,
  };
  yield { type: 'done', summary: '3 agents synthesized. Ready to ship.' };
}

const BY_AGENT: Record<AgentName, (goal: string) => Generator<Event>> = {
  supervisor: supervisorSteps,
  researcher: researcherSteps,
  analyst: analystSteps,
  outreach: outreachSteps,
  coder: coderSteps,
  browser: browserSteps,
  designer: designerSteps,
  planner: plannerSteps,
  app_builder: appBuilderSteps,
};

export interface RunController {
  cancelled: boolean;
}

export async function runAgent(
  agent: Agent,
  goal: string,
  emit: (e: SimEvent) => void,
  ctrl: RunController = { cancelled: false },
) {
  const gen = BY_AGENT[agent.name](goal);
  let step = 0;
  for (const ev of gen) {
    if (ctrl.cancelled) {
      emit({ ...({ type: 'text', text: '_cancelled_' } as Event), ts: Date.now(), step, agent: agent.name });
      return;
    }
    step += 1;
    // small variability per step
    const base =
      ev.type === 'thinking' ? 700 : ev.type === 'tool_call' ? 450 : ev.type === 'tool_result' ? 900 : ev.type === 'text' ? 1200 : 600;
    await delay(base + Math.random() * 350);
    emit({ ...ev, ts: Date.now(), step, agent: agent.name });
  }
}

export function findAgent(name: AgentName): Agent {
  return AGENTS.find((a) => a.name === name)!;
}

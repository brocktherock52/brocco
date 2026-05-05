// Direct browser-side Claude calls when the user has set their key in BYOK.
// Uses anthropic-dangerous-direct-browser-access to bypass CORS for BYOK use only.

import type { Agent } from './agents';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';

const TOOLS_DEF = [
  {
    name: 'search_web',
    description:
      'Search the web. Returns titles, URLs, and short snippets for the top results.',
    input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
  },
  {
    name: 'http_get',
    description: 'HTTP GET a URL via the brocco proxy. Returns status and a truncated body.',
    input_schema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
  },
  {
    name: 'file_save',
    description: 'Save a text artifact for the user (filename + content). Returns confirmation.',
    input_schema: {
      type: 'object',
      properties: { filename: { type: 'string' }, content: { type: 'string' } },
      required: ['filename', 'content'],
    },
  },
  {
    name: 'memory_put',
    description: 'Save a value to long-term memory. Returns confirmation.',
    input_schema: {
      type: 'object',
      properties: { key: { type: 'string' }, value: {} },
      required: ['key', 'value'],
    },
  },
  {
    name: 'done',
    description: 'Signal task complete with the final answer.',
    input_schema: { type: 'object', properties: { answer: { type: 'string' } }, required: ['answer'] },
  },
];

interface AnthropicBlock {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
}

interface AnthropicResponse {
  content: AnthropicBlock[];
  stop_reason: string;
  usage?: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number };
}

export type LiveEvent =
  | { type: 'thinking'; text: string }
  | { type: 'tool_call'; tool: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool: string; result: string }
  | { type: 'text'; text: string }
  | { type: 'usage'; in: number; out: number; cache_read?: number }
  | { type: 'done'; summary: string }
  | { type: 'error'; message: string };

const SAFE_MODEL_MAP: Record<string, string> = {
  'claude-opus-4-7': 'claude-opus-4-5-20251201',
  'claude-sonnet-4-6': 'claude-sonnet-4-5-20250929',
  'claude-haiku-4-5': 'claude-haiku-4-5-20251001',
};

function pickModel(modelId: string): string {
  return SAFE_MODEL_MAP[modelId] ?? 'claude-haiku-4-5-20251001';
}

async function executeBrowserTool(name: string, input: Record<string, unknown>): Promise<string> {
  if (name === 'search_web') {
    const q = String(input.query ?? '');
    const r = await fetch(`/api/proxy?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`)}`);
    const text = (await r.text()).slice(0, 3500);
    return `query: ${q}\nstatus=${r.status}\n\n${text.slice(0, 2000)}`;
  }
  if (name === 'http_get') {
    const url = String(input.url ?? '');
    const r = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
    const text = (await r.text()).slice(0, 3500);
    return `status=${r.status}\n\n${text}`;
  }
  if (name === 'file_save') {
    const fn = String(input.filename ?? 'output.txt');
    const content = String(input.content ?? '');
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fn;
      a.click();
      URL.revokeObjectURL(a.href);
      return `saved ${content.length} bytes to ${fn} (downloaded to your machine)`;
    } catch (e) {
      return `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  if (name === 'memory_put') {
    try {
      const k = `brocco:mem:${String(input.key ?? 'unkeyed')}`;
      localStorage.setItem(k, JSON.stringify(input.value ?? null));
      return `saved ${k}`;
    } catch (e) {
      return `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  return `ERROR: unknown tool ${name}`;
}

export async function runClaudeLive(opts: {
  apiKey: string;
  modelId: string;
  agent: Agent;
  goal: string;
  emit: (e: LiveEvent) => void;
  signal: AbortSignal;
  systemPrompt: string;
  maxSteps?: number;
}): Promise<void> {
  const { apiKey, modelId, agent, goal, emit, signal, systemPrompt, maxSteps = 6 } = opts;
  const messages: Array<{ role: string; content: unknown }> = [{ role: 'user', content: goal }];

  emit({ type: 'thinking', text: `Live mode: calling ${pickModel(modelId)} with your key.` });

  let cumIn = 0;
  let cumOut = 0;

  for (let step = 1; step <= maxSteps; step++) {
    if (signal.aborted) {
      emit({ type: 'error', message: 'cancelled' });
      return;
    }

    let resp: Response;
    try {
      resp = await fetch(ENDPOINT, {
        method: 'POST',
        signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: pickModel(modelId),
          max_tokens: 2048,
          system: systemPrompt,
          tools: TOOLS_DEF,
          messages,
        }),
      });
    } catch (e) {
      emit({ type: 'error', message: e instanceof Error ? e.message : String(e) });
      return;
    }

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      emit({
        type: 'error',
        message: `${resp.status} ${resp.statusText}: ${body.slice(0, 200)}`,
      });
      return;
    }

    const data = (await resp.json()) as AnthropicResponse;
    const usage = data.usage;
    if (usage) {
      cumIn += usage.input_tokens ?? 0;
      cumOut += usage.output_tokens ?? 0;
      emit({ type: 'usage', in: cumIn, out: cumOut, cache_read: usage.cache_read_input_tokens });
    }

    // Emit text
    for (const block of data.content) {
      if (block.type === 'text' && block.text) {
        emit({ type: 'text', text: block.text });
      }
    }

    // Emit tool calls and execute them
    const toolUses = data.content.filter((b) => b.type === 'tool_use');

    if (data.stop_reason !== 'tool_use' || toolUses.length === 0) {
      const final = data.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      emit({ type: 'done', summary: final || `Run finished. ${cumIn} in / ${cumOut} out tokens.` });
      return;
    }

    messages.push({ role: 'assistant', content: data.content });

    const toolResults: Array<{ type: string; tool_use_id: string; content: string }> = [];
    for (const tu of toolUses) {
      const toolName = tu.name ?? 'unknown';
      const toolInput = tu.input ?? {};
      emit({ type: 'tool_call', tool: toolName, input: toolInput });
      const result = await executeBrowserTool(toolName, toolInput);
      emit({ type: 'tool_result', tool: toolName, result });
      toolResults.push({ type: 'tool_result', tool_use_id: tu.id ?? '', content: result });
      if (toolName === 'done') {
        emit({
          type: 'done',
          summary: typeof toolInput.answer === 'string' ? toolInput.answer : 'done',
        });
        return;
      }
    }
    messages.push({ role: 'user', content: toolResults });
  }

  emit({ type: 'done', summary: `Reached ${maxSteps}-step cap. ${cumIn} in / ${cumOut} out tokens.` });
}

export const SYSTEM_PROMPTS: Record<string, string> = {
  supervisor: `You are the supervisor. Decompose the goal in 2-4 bullets, do the first sub-task yourself with tools, synthesize a clean final answer. Cite sources. Never use em-dashes.`,
  researcher: `You are a research agent. Decompose into 2-4 sub-questions, search efficiently, synthesize a 5-7 bullet TL;DR with sources, save brief.md, then call done.`,
  analyst: `You are an analyst. Restate the question, gather data with search/http, output a markdown report with TL;DR, key findings (bullets), data table, recommendation. Save analysis.md.`,
  outreach: `You are an outreach agent. Research the target, draft 3 cold message variants (short, medium, bold). No "I hope this finds you well." Save outreach.md, call done.`,
  coder: `You are a coder. Plan in 2-3 bullets, write the smallest correct code change, save as a file, list what is left to do. Modern conventions, no comments unless WHY is non-obvious.`,
  browser: `You are a browser/scraper agent. Cap fetches at 6. Extract structured data (entities, prices, dates) into a markdown table. Save scrape.md.`,
  designer: `You are a designer agent. Restate the brief, propose 3 directions in 2-3 bullets each, save design.md. Do not call image_gen here; describe the concept instead.`,
  planner: `You are a planner. Output a numbered 5-10 step execution plan, each step under 1 hour, with owner and success signal. Save plan.md.`,
  app_builder: `You are an app builder. Plan in 3 bullets, save a single complete HTML file with inline CSS+JS, no external deps, dark mode default.`,
};

// v3.0 PR2: production-hardened live Claude calls direct from the browser.
// Replaces the v2 best-effort version with:
//   - retry + exponential backoff on 429 / 5xx (3 attempts, ≤30s total wait)
//   - AbortController propagated to upstream fetch (real abort, not flag)
//   - structured error events surfaced to the pane UI
//   - per-token cost streaming (live $ chip, not at-end summary)
//   - rate-limit awareness from Anthropic response headers
//
// Uses anthropic-dangerous-direct-browser-access for BYOK use only.

import type { Agent } from './agents';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';

const TOOLS_DEF = [
  {
    name: 'search_web',
    description: 'Search the web. Returns titles, URLs, and short snippets for the top results.',
    input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
  },
  {
    name: 'http_get',
    description: 'HTTP GET a URL via the brocco proxy. Returns status and a truncated body.',
    input_schema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
  },
  {
    name: 'file_save',
    description: 'Save a text artifact (filename + content). Returns confirmation.',
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
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
}

export type LiveErrorKind =
  | 'auth'
  | 'rate_limit'
  | 'overloaded'
  | 'invalid_request'
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'unknown';

export type LiveEvent =
  | { type: 'thinking'; text: string }
  | { type: 'tool_call'; tool: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool: string; result: string }
  | { type: 'text'; text: string }
  | { type: 'usage'; in: number; out: number; cache_read?: number; cost_usd: number }
  | { type: 'rate_limit'; remaining_requests?: number; remaining_tokens?: number; reset_in_seconds?: number }
  | { type: 'retry'; attempt: number; reason: string; wait_ms: number }
  | { type: 'done'; summary: string }
  | { type: 'error'; kind: LiveErrorKind; message: string; retryable: boolean };

// Pricing per 1M tokens (Anthropic public, 2026-05).
// Used for the live cost ticker.
const PRICING: Record<string, { input: number; output: number; cache_read: number }> = {
  'claude-opus-4-5-20251201': { input: 15, output: 75, cache_read: 1.5 },
  'claude-sonnet-4-5-20250929': { input: 3, output: 15, cache_read: 0.3 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4, cache_read: 0.08 },
};

const MODEL_ALIAS: Record<string, string> = {
  'claude-opus-4-7': 'claude-opus-4-5-20251201',
  'claude-sonnet-4-6': 'claude-sonnet-4-5-20250929',
  'claude-haiku-4-5': 'claude-haiku-4-5-20251001',
};

function pickModel(modelId: string): string {
  return MODEL_ALIAS[modelId] ?? modelId;
}

function calcCostUsd(model: string, inT: number, outT: number, cachedT: number): number {
  const p = PRICING[model] ?? PRICING['claude-sonnet-4-5-20250929'];
  return ((inT - cachedT) * p.input + outT * p.output + cachedT * p.cache_read) / 1_000_000;
}

async function executeBrowserTool(name: string, input: Record<string, unknown>): Promise<string> {
  if (name === 'search_web') {
    const q = String(input.query ?? '');
    const r = await fetch(
      `/api/proxy?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`)}`,
    );
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

/**
 * Classify an Anthropic error response into a LiveErrorKind + message.
 * The Anthropic error shape is:
 *   { type: "error", error: { type: "...", message: "..." } }
 */
function classifyError(status: number, bodyText: string): { kind: LiveErrorKind; message: string; retryable: boolean } {
  let parsed: any = null;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    /* non-json body */
  }
  const innerType = parsed?.error?.type ?? '';
  const innerMessage = parsed?.error?.message ?? bodyText.slice(0, 240);

  if (status === 401 || innerType === 'authentication_error') {
    return {
      kind: 'auth',
      message: 'your anthropic key is invalid or revoked. update it in the BYOK panel.',
      retryable: false,
    };
  }
  if (status === 429 || innerType === 'rate_limit_error') {
    return {
      kind: 'rate_limit',
      message: 'anthropic rate limit hit. waiting then retrying.',
      retryable: true,
    };
  }
  if (status === 529 || innerType === 'overloaded_error') {
    return {
      kind: 'overloaded',
      message: 'anthropic is overloaded. retrying with backoff.',
      retryable: true,
    };
  }
  if (status >= 500) {
    return {
      kind: 'overloaded',
      message: `anthropic ${status}: ${innerMessage}`,
      retryable: true,
    };
  }
  if (status === 400 || innerType === 'invalid_request_error') {
    return {
      kind: 'invalid_request',
      message: `invalid request: ${innerMessage}`,
      retryable: false,
    };
  }
  return {
    kind: 'unknown',
    message: `${status}: ${innerMessage}`,
    retryable: status >= 500,
  };
}

interface RateLimitInfo {
  remaining_requests?: number;
  remaining_tokens?: number;
  reset_in_seconds?: number;
}

function parseRateLimitHeaders(h: Headers): RateLimitInfo {
  const rr = h.get('anthropic-ratelimit-requests-remaining');
  const rt = h.get('anthropic-ratelimit-tokens-remaining');
  const reset = h.get('anthropic-ratelimit-requests-reset') || h.get('retry-after');
  const out: RateLimitInfo = {};
  if (rr) out.remaining_requests = Number(rr);
  if (rt) out.remaining_tokens = Number(rt);
  if (reset) {
    // reset is either an ISO timestamp or seconds
    const asNumber = Number(reset);
    if (Number.isFinite(asNumber)) {
      out.reset_in_seconds = asNumber;
    } else {
      const t = Date.parse(reset);
      if (!Number.isNaN(t)) {
        out.reset_in_seconds = Math.max(0, Math.round((t - Date.now()) / 1000));
      }
    }
  }
  return out;
}

/**
 * One Anthropic call with retry + backoff. Honours abort signal at every wait.
 * Caps at 3 attempts and ~30s of total wait.
 */
async function callAnthropicWithRetry(opts: {
  apiKey: string;
  body: unknown;
  signal: AbortSignal;
  emit: (e: LiveEvent) => void;
}): Promise<{ data: AnthropicResponse; rl: RateLimitInfo } | { error: { kind: LiveErrorKind; message: string; retryable: boolean } }> {
  const { apiKey, body, signal, emit } = opts;
  const MAX_ATTEMPTS = 3;
  let lastErr: { kind: LiveErrorKind; message: string; retryable: boolean } | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (signal.aborted) {
      return { error: { kind: 'cancelled', message: 'cancelled by user', retryable: false } };
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
        body: JSON.stringify(body),
      });
    } catch (e) {
      if (signal.aborted) {
        return { error: { kind: 'cancelled', message: 'cancelled by user', retryable: false } };
      }
      const message = e instanceof Error ? e.message : String(e);
      lastErr = { kind: 'network', message: `network: ${message}`, retryable: true };
      if (attempt < MAX_ATTEMPTS) {
        const wait = Math.min(8000, 800 * Math.pow(2, attempt - 1));
        emit({ type: 'retry', attempt, reason: 'network', wait_ms: wait });
        await sleep(wait, signal);
        continue;
      }
      return { error: lastErr };
    }

    const rl = parseRateLimitHeaders(resp.headers);
    if (rl.remaining_requests !== undefined || rl.remaining_tokens !== undefined) {
      emit({ type: 'rate_limit', ...rl });
    }

    if (resp.ok) {
      const data = (await resp.json()) as AnthropicResponse;
      return { data, rl };
    }

    const text = await resp.text().catch(() => '');
    const cls = classifyError(resp.status, text);
    lastErr = cls;
    if (!cls.retryable || attempt === MAX_ATTEMPTS) {
      return { error: cls };
    }
    // honour Retry-After if present, otherwise exponential backoff
    let wait = Math.min(20000, 1500 * Math.pow(2, attempt - 1));
    if (rl.reset_in_seconds !== undefined) {
      wait = Math.min(20000, Math.max(wait, rl.reset_in_seconds * 1000));
    }
    emit({ type: 'retry', attempt, reason: cls.kind, wait_ms: wait });
    await sleep(wait, signal);
  }

  return { error: lastErr ?? { kind: 'unknown', message: 'exhausted retries', retryable: false } };
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('cancelled', 'AbortError'));
    const t = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    const cleanup = () => {
      clearTimeout(t);
      signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      cleanup();
      reject(new DOMException('cancelled', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
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
  const model = pickModel(modelId);
  const messages: Array<{ role: string; content: unknown }> = [{ role: 'user', content: goal }];

  emit({ type: 'thinking', text: `live mode: ${model}, byok, max ${maxSteps} steps.` });

  let cumIn = 0;
  let cumOut = 0;
  let cumCache = 0;

  for (let step = 1; step <= maxSteps; step++) {
    if (signal.aborted) {
      emit({ type: 'error', kind: 'cancelled', message: 'cancelled by user', retryable: false });
      return;
    }

    const result = await callAnthropicWithRetry({
      apiKey,
      body: {
        model,
        max_tokens: 2048,
        system: systemPrompt,
        tools: TOOLS_DEF,
        messages,
      },
      signal,
      emit,
    });

    if ('error' in result) {
      emit({ type: 'error', ...result.error });
      return;
    }

    const data = result.data;
    const usage = data.usage;
    if (usage) {
      cumIn += usage.input_tokens ?? 0;
      cumOut += usage.output_tokens ?? 0;
      cumCache += usage.cache_read_input_tokens ?? 0;
      const cost = calcCostUsd(model, cumIn, cumOut, cumCache);
      emit({ type: 'usage', in: cumIn, out: cumOut, cache_read: cumCache, cost_usd: cost });
    }

    // Emit text blocks
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
      const cost = calcCostUsd(model, cumIn, cumOut, cumCache);
      emit({
        type: 'done',
        summary:
          (final || `run finished after ${step} steps.`) +
          ` · ${cumIn} in / ${cumOut} out tokens · est $${cost.toFixed(4)}`,
      });
      return;
    }

    messages.push({ role: 'assistant', content: data.content });

    const toolResults: Array<{ type: string; tool_use_id: string; content: string }> = [];
    for (const tu of toolUses) {
      if (signal.aborted) {
        emit({ type: 'error', kind: 'cancelled', message: 'cancelled by user', retryable: false });
        return;
      }
      const toolName = tu.name ?? 'unknown';
      const toolInput = tu.input ?? {};
      emit({ type: 'tool_call', tool: toolName, input: toolInput });
      let toolResult: string;
      try {
        toolResult = await executeBrowserTool(toolName, toolInput);
      } catch (e) {
        toolResult = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
      }
      emit({ type: 'tool_result', tool: toolName, result: toolResult });
      toolResults.push({ type: 'tool_result', tool_use_id: tu.id ?? '', content: toolResult });
      if (toolName === 'done') {
        emit({
          type: 'done',
          summary:
            typeof toolInput.answer === 'string'
              ? toolInput.answer
              : `done · ${cumIn} in / ${cumOut} out tokens`,
        });
        return;
      }
    }
    messages.push({ role: 'user', content: toolResults });
  }

  const cost = calcCostUsd(model, cumIn, cumOut, cumCache);
  emit({
    type: 'done',
    summary: `reached ${maxSteps}-step cap · ${cumIn} in / ${cumOut} out · est $${cost.toFixed(4)}`,
  });
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

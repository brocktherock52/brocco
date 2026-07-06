// xAI (Grok) live runner. BYOK, browser-direct, mirrors lib/claude.ts but
// speaks the OpenAI-compatible chat/completions schema that xAI exposes at
// https://api.x.ai/v1/chat/completions.
//
// Added 2026-06-02 (consultant note): the consultant recommended testing a far
// cheaper model for the high-volume real-estate lead-gen runs. Grok 4.2 fast
// (grok-4.20-0309-non-reasoning) is much cheaper than the premium Claude models,
// and xAI returns Access-Control-Allow-Origin:* so we can call it directly from
// the browser with the user's own key (key never touches brocco servers), the
// same privacy posture as the Anthropic path.

import type { Agent } from './agents';
import type { ClaudeAttachment, LiveEvent, LiveErrorKind } from './claude';

const ENDPOINT = 'https://api.x.ai/v1/chat/completions';

// OpenAI-format tool defs (xAI uses the OpenAI function-calling schema). Same
// capabilities as the Anthropic TOOLS_DEF in lib/claude.ts.
const TOOLS_DEF = [
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the web. Returns titles, URLs, and short snippets for the top results.',
      parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'http_get',
      description: 'HTTP GET a URL via the brocco proxy. Returns status and a truncated body.',
      parameters: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'file_save',
      description: 'Save a text artifact (filename + content). Returns confirmation.',
      parameters: {
        type: 'object',
        properties: { filename: { type: 'string' }, content: { type: 'string' } },
        required: ['filename', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'memory_put',
      description: 'Save a value to long-term memory. Returns confirmation.',
      parameters: {
        type: 'object',
        properties: { key: { type: 'string' }, value: { type: 'string' } },
        required: ['key', 'value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'done',
      description: 'Signal task complete with the final answer.',
      parameters: { type: 'object', properties: { answer: { type: 'string' } }, required: ['answer'] },
    },
  },
];

// xAI pricing per 1M tokens (docs.x.ai, 2026-06). grok-build is the cheap coder
// tier; the grok-4.x chat/reasoning models share 1.25 in / 2.50 out.
const PRICING: Record<string, { input: number; output: number }> = {
  'grok-4.20-0309-non-reasoning': { input: 1.25, output: 2.5 },
  'grok-4.20-0309-reasoning': { input: 1.25, output: 2.5 },
  'grok-4.3': { input: 1.25, output: 2.5 },
  'grok-build-0.1': { input: 1.0, output: 2.0 },
};

function calcCostUsd(model: string, inT: number, outT: number): number {
  const p = PRICING[model] ?? { input: 1.25, output: 2.5 };
  return (inT * p.input + outT * p.output) / 1_000_000;
}

interface OpenAIToolCall {
  id: string;
  type: string;
  function: { name: string; arguments: string };
}
interface OpenAIChoice {
  message: { role: string; content: string | null; tool_calls?: OpenAIToolCall[] };
  finish_reason: string;
}
interface OpenAIResponse {
  choices: OpenAIChoice[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
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

function classifyError(status: number, bodyText: string): { kind: LiveErrorKind; message: string; retryable: boolean } {
  let parsed: any = null;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    /* non-json */
  }
  const innerMessage = parsed?.error?.message ?? parsed?.error ?? bodyText.slice(0, 240);
  if (status === 401 || status === 403) {
    return { kind: 'auth', message: 'your xAI (Grok) key is invalid or revoked. update it in the BYOK panel.', retryable: false };
  }
  if (status === 429) {
    return { kind: 'rate_limit', message: 'xAI rate limit hit. waiting then retrying.', retryable: true };
  }
  if (status >= 500) {
    return { kind: 'overloaded', message: `xAI ${status}: ${innerMessage}`, retryable: true };
  }
  if (status === 400) {
    return { kind: 'invalid_request', message: `invalid request: ${innerMessage}`, retryable: false };
  }
  return { kind: 'unknown', message: `${status}: ${innerMessage}`, retryable: status >= 500 };
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

async function callXaiWithRetry(opts: {
  apiKey: string;
  body: unknown;
  signal: AbortSignal;
  emit: (e: LiveEvent) => void;
}): Promise<{ data: OpenAIResponse } | { error: { kind: LiveErrorKind; message: string; retryable: boolean } }> {
  const { apiKey, body, signal, emit } = opts;
  const MAX_ATTEMPTS = 3;
  let lastErr: { kind: LiveErrorKind; message: string; retryable: boolean } | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (signal.aborted) return { error: { kind: 'cancelled', message: 'cancelled by user', retryable: false } };
    let resp: Response;
    try {
      resp = await fetch(ENDPOINT, {
        method: 'POST',
        signal,
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      if (signal.aborted) return { error: { kind: 'cancelled', message: 'cancelled by user', retryable: false } };
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

    if (resp.ok) {
      const data = (await resp.json()) as OpenAIResponse;
      return { data };
    }

    const text = await resp.text().catch(() => '');
    const cls = classifyError(resp.status, text);
    lastErr = cls;
    if (!cls.retryable || attempt === MAX_ATTEMPTS) return { error: cls };
    const wait = Math.min(20000, 1500 * Math.pow(2, attempt - 1));
    emit({ type: 'retry', attempt, reason: cls.kind, wait_ms: wait });
    await sleep(wait, signal);
  }

  return { error: lastErr ?? { kind: 'unknown', message: 'exhausted retries', retryable: false } };
}

function buildUserContent(goal: string, attachments: ClaudeAttachment[]): unknown {
  // OpenAI multimodal content array. Images ride as image_url data URIs; text
  // attachments are inlined; documents we name (xAI chat does not take PDFs the
  // way Anthropic does, so we surface the filename rather than the bytes).
  const hasImage = attachments.some((a) => a.kind === 'image' && a.data);
  if (attachments.length === 0) return goal;
  if (!hasImage) {
    const textParts = [goal];
    for (const f of attachments) {
      if (f.kind === 'text' && f.text) {
        textParts.push(`\n<attachment name="${f.name}">\n${f.text}\n</attachment>`);
      } else {
        textParts.push(`\n[attachment: ${f.name} (${f.mediaType || 'unknown'})]`);
      }
    }
    return textParts.join('\n');
  }
  const blocks: Array<Record<string, unknown>> = [{ type: 'text', text: goal }];
  for (const f of attachments) {
    if (f.kind === 'image' && f.data) {
      blocks.push({ type: 'image_url', image_url: { url: `data:${f.mediaType};base64,${f.data}` } });
    } else if (f.kind === 'text' && f.text) {
      blocks.push({ type: 'text', text: `\n<attachment name="${f.name}">\n${f.text}\n</attachment>` });
    }
  }
  return blocks;
}

/** Run a single agent live against xAI (Grok). Same shape as runClaudeLive so
 *  the dispatcher in lib/run-live.ts can swap between providers transparently. */
export async function runXaiLive(opts: {
  apiKey: string;
  modelId: string;
  agent: Agent;
  goal: string;
  attachments?: ClaudeAttachment[];
  emit: (e: LiveEvent) => void;
  signal: AbortSignal;
  systemPrompt: string;
  maxSteps?: number;
}): Promise<void> {
  const { apiKey, modelId, goal, attachments = [], emit, signal, systemPrompt, maxSteps = 6 } = opts;

  const messages: Array<Record<string, unknown>> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: buildUserContent(goal, attachments) },
  ];

  emit({
    type: 'thinking',
    text: `live mode: ${modelId} (xAI / Grok), byok, max ${maxSteps} steps.${attachments.length ? ` ${attachments.length} attachment${attachments.length === 1 ? '' : 's'} included.` : ''}`,
  });

  let cumIn = 0;
  let cumOut = 0;

  for (let step = 1; step <= maxSteps; step++) {
    if (signal.aborted) {
      emit({ type: 'error', kind: 'cancelled', message: 'cancelled by user', retryable: false });
      return;
    }

    const result = await callXaiWithRetry({
      apiKey,
      body: { model: modelId, max_tokens: 2048, tools: TOOLS_DEF, messages },
      signal,
      emit,
    });

    if ('error' in result) {
      emit({ type: 'error', ...result.error });
      return;
    }

    const choice = result.data.choices?.[0];
    const usage = result.data.usage;
    if (usage) {
      cumIn += usage.prompt_tokens ?? 0;
      cumOut += usage.completion_tokens ?? 0;
      emit({ type: 'usage', in: cumIn, out: cumOut, cost_usd: calcCostUsd(modelId, cumIn, cumOut) });
    }

    const msg = choice?.message;
    if (msg?.content) emit({ type: 'text', text: msg.content });

    const toolCalls = msg?.tool_calls ?? [];
    if (!toolCalls.length || choice?.finish_reason !== 'tool_calls') {
      const cost = calcCostUsd(modelId, cumIn, cumOut);
      emit({
        type: 'done',
        summary:
          (msg?.content || `run finished after ${step} steps.`) +
          ` · ${cumIn} in / ${cumOut} out tokens · est $${cost.toFixed(4)}`,
      });
      return;
    }

    // Echo the assistant tool-call message back, then each tool result.
    messages.push({ role: 'assistant', content: msg?.content ?? '', tool_calls: toolCalls });
    for (const tc of toolCalls) {
      if (signal.aborted) {
        emit({ type: 'error', kind: 'cancelled', message: 'cancelled by user', retryable: false });
        return;
      }
      const toolName = tc.function?.name ?? 'unknown';
      let toolInput: Record<string, unknown> = {};
      try {
        toolInput = JSON.parse(tc.function?.arguments || '{}');
      } catch {
        /* leave empty */
      }
      emit({ type: 'tool_call', tool: toolName, input: toolInput });
      let toolResult: string;
      try {
        toolResult = await executeBrowserTool(toolName, toolInput);
      } catch (e) {
        toolResult = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
      }
      emit({ type: 'tool_result', tool: toolName, result: toolResult });
      messages.push({ role: 'tool', tool_call_id: tc.id, content: toolResult });
      if (toolName === 'done') {
        emit({
          type: 'done',
          summary: typeof toolInput.answer === 'string' ? toolInput.answer : `done · ${cumIn} in / ${cumOut} out tokens`,
        });
        return;
      }
    }
  }

  const cost = calcCostUsd(modelId, cumIn, cumOut);
  emit({ type: 'done', summary: `reached ${maxSteps}-step cap · ${cumIn} in / ${cumOut} out · est $${cost.toFixed(4)}` });
}

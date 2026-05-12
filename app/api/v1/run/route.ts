/* POST /api/v1/run - SSE-streamed Claude tool-use loop with search_web + http_get.
   Cookie-rate-limited (1 run / 24h per browser). Hard caps: 1000-char prompt,
   6 steps. Streams Anthropic delta events through to the client (real per-token
   stream, not buffered per step). AbortSignal propagated upstream. Retry+backoff
   on 429/5xx. SSRF protection on http_get tool. */

import { checkUrl } from '@/lib/ssrf';
import { errorResponse, makeRequestId } from '@/lib/errors';

export const runtime = 'edge';

interface ToolUseBlock { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
interface TextBlock { type: 'text'; text: string }
type Block = ToolUseBlock | TextBlock;

interface AnthropicUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

const TOOLS = [
  {
    name: 'search_web',
    description: 'Search the web with Tavily. Returns titles, URLs, and short snippets for the top results.',
    input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
  },
  {
    name: 'http_get',
    description: 'HTTP GET a public URL. Returns status and a truncated body. Use to fetch a page after search_web. Private and loopback addresses are blocked.',
    input_schema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
  },
];

const SYSTEM = `You are Brocco's live demo agent, a research/synthesis specialist.
You have two tools: search_web (Tavily) and http_get. Decompose the user's
question, search efficiently (1-3 queries max), fetch one URL only when
necessary, and end with a tight markdown answer including 2-4 sources as
bullet links. Cap yourself at ~6 steps. Be concise; the user is watching this stream live.`;

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MAX_STEPS = 6;
const MAX_RETRIES = 3;
const MAX_RETRY_WAIT_MS = 30_000;

async function executeTool(name: string, input: Record<string, unknown>, signal: AbortSignal): Promise<string> {
  try {
    if (name === 'search_web') {
      const tav = process.env.TAVILY_API_KEY;
      if (!tav) return 'ERROR: TAVILY_API_KEY not set';
      const r = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: tav, query: input.query, max_results: 4, include_answer: true }),
        signal,
      });
      if (!r.ok) return `ERROR: tavily ${r.status}`;
      const d = (await r.json()) as { answer?: string; results?: Array<{ title: string; url: string; content?: string }> };
      const parts: string[] = [];
      if (d.answer) parts.push(`ANSWER: ${d.answer}`);
      for (const h of (d.results ?? []).slice(0, 4)) {
        parts.push(`- ${h.title}\n  ${h.url}\n  ${(h.content ?? '').slice(0, 280)}`);
      }
      return parts.join('\n').slice(0, 3500);
    }
    if (name === 'http_get') {
      const check = checkUrl(String(input.url));
      if (!check.ok) return `ERROR: ssrf_blocked — ${check.reason}`;
      const r = await fetch(check.url!.toString(), {
        headers: { 'User-Agent': 'Brocco-Demo/1.0' },
        signal,
      });
      const text = (await r.text()).slice(0, 3500);
      return `status=${r.status}\n\n${text}`;
    }
    return `ERROR: unknown tool ${name}`;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return 'ERROR: aborted';
    return `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }
}

function getCookie(req: Request, name: string): string | null {
  const raw = req.headers.get('cookie') ?? '';
  for (const part of raw.split(';')) {
    const [k, v] = part.trim().split('=');
    if (k === name) return v ?? '';
  }
  return null;
}

async function callAnthropicStreaming(
  apiKey: string,
  messages: Array<{ role: string; content: unknown }>,
  signal: AbortSignal,
): Promise<Response> {
  // Anthropic native streaming. Each retry is a fresh fetch.
  let lastErr: { status: number; body: string } | null = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const resp = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        stream: true,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        tools: TOOLS,
        messages,
      }),
      signal,
    });
    if (resp.ok) return resp;
    const status = resp.status;
    const body = await resp.text().catch(() => '');
    lastErr = { status, body };
    // Don't retry 4xx (except 429).
    if (status !== 429 && status < 500) break;
    // Exponential backoff capped at MAX_RETRY_WAIT_MS, honoring Retry-After if present.
    const retryAfter = Number(resp.headers.get('retry-after'));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, MAX_RETRY_WAIT_MS)
      : Math.min(2 ** attempt * 1000, MAX_RETRY_WAIT_MS);
    await new Promise((res) => setTimeout(res, waitMs));
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  }
  throw Object.assign(new Error(`anthropic ${lastErr?.status}: ${lastErr?.body.slice(0, 300)}`), {
    status: lastErr?.status,
    body: lastErr?.body,
  });
}

interface ParsedStreamResult {
  content: Block[];
  stop_reason: string;
  usage: AnthropicUsage;
}

// Parse Anthropic SSE stream while emitting per-token deltas to the client.
// Returns the assembled assistant turn (content array + stop_reason + usage)
// for use in the next step's input.
async function consumeAnthropicStream(
  resp: Response,
  step: number,
  emit: (ev: object) => void,
  signal: AbortSignal,
): Promise<ParsedStreamResult> {
  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const content: Block[] = [];
  let stop_reason = 'end_turn';
  const usage: AnthropicUsage = {};
  let currentBlock: Partial<Block> | null = null;
  let currentToolInputBuf = '';

  while (true) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      let eventName = '';
      let dataLine = '';
      for (const line of frame.split('\n')) {
        if (line.startsWith('event: ')) eventName = line.slice(7).trim();
        else if (line.startsWith('data: ')) dataLine = line.slice(6);
      }
      if (!dataLine) continue;
      let data: Record<string, unknown>;
      try { data = JSON.parse(dataLine); } catch { continue; }

      switch (eventName) {
        case 'message_start': {
          const m = (data.message as { usage?: AnthropicUsage } | undefined)?.usage;
          if (m) Object.assign(usage, m);
          break;
        }
        case 'content_block_start': {
          const block = data.content_block as { type: string; text?: string; id?: string; name?: string };
          if (block.type === 'text') {
            currentBlock = { type: 'text', text: '' };
          } else if (block.type === 'tool_use') {
            currentBlock = { type: 'tool_use', id: block.id ?? '', name: block.name ?? '', input: {} };
            currentToolInputBuf = '';
          }
          break;
        }
        case 'content_block_delta': {
          const delta = data.delta as { type: string; text?: string; partial_json?: string };
          if (delta.type === 'text_delta' && currentBlock?.type === 'text') {
            (currentBlock as TextBlock).text += delta.text ?? '';
            // Stream the per-token text delta to the client.
            emit({ type: 'text_delta', step, text: delta.text ?? '' });
          } else if (delta.type === 'input_json_delta' && currentBlock?.type === 'tool_use') {
            currentToolInputBuf += delta.partial_json ?? '';
          }
          break;
        }
        case 'content_block_stop': {
          if (currentBlock?.type === 'tool_use') {
            try { (currentBlock as ToolUseBlock).input = JSON.parse(currentToolInputBuf || '{}'); }
            catch { (currentBlock as ToolUseBlock).input = {}; }
          }
          if (currentBlock) content.push(currentBlock as Block);
          currentBlock = null;
          currentToolInputBuf = '';
          break;
        }
        case 'message_delta': {
          const delta = data.delta as { stop_reason?: string };
          if (delta.stop_reason) stop_reason = delta.stop_reason;
          const u = data.usage as AnthropicUsage | undefined;
          if (u) Object.assign(usage, u);
          break;
        }
        case 'message_stop':
          break;
        case 'error': {
          const msg = (data.error as { message?: string } | undefined)?.message ?? 'anthropic stream error';
          throw new Error(msg);
        }
      }
    }
  }
  return { content, stop_reason, usage };
}

export async function POST(req: Request): Promise<Response> {
  const requestId = makeRequestId();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return errorResponse(
      'demo_offline',
      'ANTHROPIC_API_KEY not configured on server. Sign up to run agents on your own key.',
      { requestId },
    );
  }

  if (getCookie(req, 'brocco_demo_used') === '1') {
    return errorResponse(
      'rate_limit',
      "You've used your free demo run for today. Sign up free for 100 runs/month.",
      { requestId },
    );
  }

  let body: { prompt?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse('invalid_json', 'Request body is not valid JSON', { requestId });
  }
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (prompt.length < 4 || prompt.length > 1000) {
    return errorResponse(
      'validation_failed',
      `Prompt must be 4-1000 characters. Got ${prompt.length}.`,
      { requestId },
    );
  }

  // AbortController that fires when the SSE consumer disconnects.
  const upstreamAbort = new AbortController();
  // 60s hard cap to bound the demo.
  const hardCapTimer = setTimeout(() => upstreamAbort.abort(), 60_000);
  // Heartbeat ping every 5s to keep proxies happy (Cloudflare can kill idle SSE at 10-15s).
  let pingTimer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (ev: object) => {
        try { controller.enqueue(enc.encode(`data: ${JSON.stringify(ev)}\n\n`)); }
        catch { /* controller closed */ }
      };
      pingTimer = setInterval(() => {
        try { controller.enqueue(enc.encode(`: ping\n\n`)); }
        catch { /* closed */ }
      }, 5_000);

      try {
        send({ type: 'run_started', request_id: requestId, agent: 'demo', prompt });
        const messages: Array<{ role: string; content: unknown }> = [{ role: 'user', content: prompt }];

        for (let step = 1; step <= MAX_STEPS; step++) {
          if (upstreamAbort.signal.aborted) break;
          send({ type: 'step_start', step });

          let resp: Response;
          try {
            resp = await callAnthropicStreaming(apiKey, messages, upstreamAbort.signal);
          } catch (e) {
            const err = e as { status?: number; message?: string };
            const code = err.status === 429 ? 'upstream_rate_limit'
              : err.status && err.status >= 500 ? 'upstream_overloaded'
              : (e instanceof DOMException && e.name === 'AbortError') ? 'aborted'
              : 'upstream_error';
            send({
              type: 'run_finished',
              status: 'error',
              code,
              error: err.message ?? String(e),
              request_id: requestId,
            });
            break;
          }

          let parsed: ParsedStreamResult;
          try {
            parsed = await consumeAnthropicStream(resp, step, send, upstreamAbort.signal);
          } catch (e) {
            const aborted = e instanceof DOMException && e.name === 'AbortError';
            send({
              type: 'run_finished',
              status: 'error',
              code: aborted ? 'aborted' : 'upstream_error',
              error: e instanceof Error ? e.message : String(e),
              request_id: requestId,
            });
            break;
          }

          send({
            type: 'assistant_turn',
            step,
            stop_reason: parsed.stop_reason,
            content: parsed.content,
            usage: parsed.usage,
          });
          messages.push({ role: 'assistant', content: parsed.content });

          if (parsed.stop_reason !== 'tool_use') {
            const text = parsed.content
              .filter((b): b is TextBlock => b.type === 'text')
              .map((b) => b.text)
              .join('\n')
              .trim();
            send({ type: 'assistant_text', text });
            send({ type: 'run_finished', status: 'done', steps: step, request_id: requestId });
            break;
          }

          // Run tool calls in PARALLEL within a step (latency win).
          const toolUses = parsed.content.filter((b): b is ToolUseBlock => b.type === 'tool_use');
          const toolPromises = toolUses.map(async (tu) => {
            send({ type: 'tool_call', step, tool: tu.name, input: tu.input, tool_use_id: tu.id });
            const output = await executeTool(tu.name, tu.input, upstreamAbort.signal);
            const isErr = output.startsWith('ERROR');
            send({ type: 'tool_result', step, tool: tu.name, output, is_error: isErr, tool_use_id: tu.id });
            return { type: 'tool_result' as const, tool_use_id: tu.id, content: output, is_error: isErr };
          });
          const toolResults = await Promise.all(toolPromises);
          messages.push({ role: 'user', content: toolResults });
        }
      } catch (e) {
        send({
          type: 'run_finished',
          status: 'error',
          code: 'internal',
          error: e instanceof Error ? e.message : String(e),
          request_id: requestId,
        });
      } finally {
        if (pingTimer) clearInterval(pingTimer);
        clearTimeout(hardCapTimer);
        try { controller.enqueue(new TextEncoder().encode('event: done\ndata: {}\n\n')); }
        catch { /* closed */ }
        try { controller.close(); } catch { /* already */ }
      }
    },
    cancel() {
      // Client disconnected; abort upstream Anthropic fetch + any in-flight tool calls.
      upstreamAbort.abort();
      if (pingTimer) clearInterval(pingTimer);
      clearTimeout(hardCapTimer);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'X-Brocco-Request-Id': requestId,
      Connection: 'keep-alive',
      'Set-Cookie': 'brocco_demo_used=1; Max-Age=86400; Path=/; SameSite=Lax',
    },
  });
}

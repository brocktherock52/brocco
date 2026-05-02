/* /api/run -Vercel Edge function. Streams a real Claude tool-use loop
   (search_web + http_get) over SSE so the brocco.ai demo can run a live
   agent on a visitor-supplied prompt.

   Required env (set via `vercel env add ... production`):
     ANTHROPIC_API_KEY   -Claude
     TAVILY_API_KEY      -web search

   Per-IP rate limit via cookie (1 run / 24h). Hard caps: 1000-char prompt,
   6 tool-use steps. Returns 503 if keys not configured so the client can
   gracefully fall back to the recorded demo.
*/

export const config = { runtime: 'edge' };

interface ToolUseBlock { type: 'tool_use'; id: string; name: string; input: Record<string, unknown>; }
interface TextBlock { type: 'text'; text: string; }
type Block = ToolUseBlock | TextBlock | { type: string; [k: string]: unknown };

const TOOLS = [
  {
    name: 'search_web',
    description: 'Search the web with Tavily. Returns titles, URLs, and short snippets for the top results.',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
  {
    name: 'http_get',
    description: 'HTTP GET a URL. Returns status and a truncated body. Use to fetch a page after search_web.',
    input_schema: {
      type: 'object',
      properties: { url: { type: 'string' } },
      required: ['url'],
    },
  },
];

const SYSTEM = `You are Brocco's live demo agent -a research/synthesis specialist.
You have two tools: search_web (Tavily) and http_get. Decompose the user's
question, search efficiently (1-3 queries max), fetch one URL only when
necessary, and end with a tight markdown answer including 2-4 sources as
bullet links. Cap yourself at ~6 steps. Be concise; the user is watching this stream live.`;

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    if (name === 'search_web') {
      const tav = process.env.TAVILY_API_KEY;
      if (!tav) return 'ERROR: TAVILY_API_KEY not set';
      const r = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: tav, query: input.query, max_results: 4, include_answer: true }),
      });
      if (!r.ok) return `ERROR: tavily ${r.status}`;
      const d = await r.json() as { answer?: string; results?: Array<{ title: string; url: string; content?: string }> };
      const parts: string[] = [];
      if (d.answer) parts.push(`ANSWER: ${d.answer}`);
      for (const h of (d.results ?? []).slice(0, 4)) {
        parts.push(`- ${h.title}\n  ${h.url}\n  ${(h.content ?? '').slice(0, 280)}`);
      }
      return parts.join('\n').slice(0, 3500);
    }
    if (name === 'http_get') {
      const url = String(input.url);
      const r = await fetch(url, { headers: { 'User-Agent': 'Brocco-Demo/0.1' } });
      const text = (await r.text()).slice(0, 3500);
      return `status=${r.status}\n\n${text}`;
    }
    return `ERROR: unknown tool ${name}`;
  } catch (e) {
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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'demo offline', detail: 'ANTHROPIC_API_KEY not configured on server. Sign up to run agents on your own key.' },
      { status: 503 },
    );
  }

  if (getCookie(req, 'brocco_demo_used') === '1') {
    return Response.json(
      { error: 'rate limit', detail: "You've used your free demo run for today. Sign up free for 100 runs/month." },
      { status: 429 },
    );
  }

  let body: { prompt?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (prompt.length < 4 || prompt.length > 1000) {
    return Response.json({ error: 'prompt must be 4-1000 chars' }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (ev: object) => {
        controller.enqueue(enc.encode(`data: ${JSON.stringify(ev)}\n\n`));
      };

      try {
        send({ type: 'run_started', agent: 'demo', prompt });
        const messages: Array<{ role: string; content: unknown }> = [{ role: 'user', content: prompt }];

        for (let step = 1; step <= 6; step++) {
          send({ type: 'step_start', step });

          const resp = await fetch('https://api.anthropic.com/v1/messages', {
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
              system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
              tools: TOOLS,
              messages,
            }),
          });

          if (!resp.ok) {
            const txt = await resp.text();
            send({ type: 'run_finished', status: 'error', error: `anthropic ${resp.status}: ${txt.slice(0, 300)}` });
            break;
          }

          const data = await resp.json() as { content: Block[]; stop_reason: string; usage?: object };
          send({ type: 'assistant_turn', step, stop_reason: data.stop_reason, content: data.content, usage: data.usage });
          messages.push({ role: 'assistant', content: data.content });

          if (data.stop_reason !== 'tool_use') {
            const text = data.content.filter((b): b is TextBlock => b.type === 'text').map((b) => b.text).join('\n').trim();
            send({ type: 'assistant_text', text });
            send({ type: 'run_finished', status: 'done', steps: step });
            break;
          }

          const toolResults: Array<{ type: string; tool_use_id: string; content: string; is_error?: boolean }> = [];
          for (const block of data.content) {
            if (block.type !== 'tool_use') continue;
            const tu = block as ToolUseBlock;
            send({ type: 'tool_call', step, tool: tu.name, input: tu.input, tool_use_id: tu.id });
            const result = await executeTool(tu.name, tu.input);
            const isErr = result.startsWith('ERROR');
            send({ type: 'tool_result', step, tool: tu.name, output: result, is_error: isErr, tool_use_id: tu.id });
            toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: result, is_error: isErr });
          }
          messages.push({ role: 'user', content: toolResults });
        }
      } catch (e) {
        send({ type: 'run_finished', status: 'error', error: e instanceof Error ? e.message : String(e) });
      } finally {
        controller.enqueue(enc.encode('event: done\ndata: {}\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Connection': 'keep-alive',
      'Set-Cookie': 'brocco_demo_used=1; Max-Age=86400; Path=/; SameSite=Lax',
    },
  });
}

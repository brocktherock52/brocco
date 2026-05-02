/* /api/v1/run - Public REST API for brocco agents.

   Auth: Bearer API key (issued from /account; for v1, accepts any
   non-empty key matching BROCCO_API_KEYS env var as a comma-separated
   allowlist; or any sk-ant-* / sk-* key passed through as BYOK).

   POST /api/v1/run
   Body: {
     "agent": "researcher" | "coder" | "outreach" | "analyst" | "supervisor" | "planner" | "browser" | "designer" | "app_builder",
     "prompt": "string (required, max 4000 chars)",
     "model": "claude-sonnet-4-6" (optional),
     "max_steps": 6 (optional)
   }

   Response (SSE stream of events) with same shape as /api/run:
     - { type: 'run_started', agent, prompt }
     - { type: 'step_start', step }
     - { type: 'tool_call', step, tool, input, tool_use_id }
     - { type: 'tool_result', step, tool, output, is_error, tool_use_id }
     - { type: 'assistant_turn', step, stop_reason, content, usage }
     - { type: 'assistant_text', text } (final synthesis)
     - { type: 'run_finished', status, steps }

   Designed to be called from Claude / ChatGPT / curl / Cursor / any HTTP client.
*/

export const config = { runtime: 'edge' };

interface AgentSpec { name: string; system: string; tools: string[]; }

const AGENTS: Record<string, AgentSpec> = {
  researcher: {
    name: 'researcher',
    system: 'You are a research agent. Search the web, synthesize findings into a tight markdown brief with sources. End with a clear answer.',
    tools: ['search_web', 'http_get'],
  },
  analyst: {
    name: 'analyst',
    system: 'You are an analyst. Read data, find patterns, output a structured markdown report with TL;DR, findings, and a recommendation.',
    tools: ['search_web', 'http_get'],
  },
  outreach: {
    name: 'outreach',
    system: 'You are an outreach agent. Draft cold email/DM/SMS variants. No AI cliches, no em-dashes. Lead with a fact about the recipient.',
    tools: ['search_web'],
  },
  coder: {
    name: 'coder',
    system: 'You are a coder agent. Plan the smallest change, write the code, list files touched. No comments explaining what well-named code already says.',
    tools: ['search_web', 'http_get'],
  },
  supervisor: {
    name: 'supervisor',
    system: 'You are the supervisor. Decompose the goal into sub-tasks. State the plan in 2-4 bullets. Synthesize a final answer.',
    tools: ['search_web'],
  },
  planner: {
    name: 'planner',
    system: 'You are a planner agent. Output a numbered execution plan: 5-10 verb-first steps, time estimates, who-does-what.',
    tools: ['search_web'],
  },
  browser: {
    name: 'browser',
    system: 'You are a browser agent. Crawl pages, extract structured data into markdown tables, cite every URL.',
    tools: ['search_web', 'http_get'],
  },
  designer: {
    name: 'designer',
    system: 'You are a designer. Restate the brief, search for visual references, write 1-3 detailed design briefs with palette and composition.',
    tools: ['search_web'],
  },
  app_builder: {
    name: 'app_builder',
    system: 'You are an app builder. Output a complete single-file HTML+CSS+JS web app from the prompt. No external dependencies. Vanilla JS only.',
    tools: ['search_web'],
  },
};

const TOOLS = [
  {
    name: 'search_web',
    description: 'Search the web with Tavily. Returns a synthesized answer plus top results.',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string' }, max_results: { type: 'integer', default: 5 } },
      required: ['query'],
    },
  },
  {
    name: 'http_get',
    description: 'HTTP GET a URL via brocco proxy. Returns status and a truncated body.',
    input_schema: {
      type: 'object',
      properties: { url: { type: 'string' } },
      required: ['url'],
    },
  },
];

function authorize(req: Request): { ok: boolean; reason?: string; mode?: 'allowlist' | 'byok'; byokKey?: string } {
  const auth = req.headers.get('authorization') || req.headers.get('x-api-key') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  const token = m ? m[1].trim() : auth.trim();
  if (!token) return { ok: false, reason: 'Missing Authorization or x-api-key header' };

  const allowlist = (process.env.BROCCO_API_KEYS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowlist.includes(token)) return { ok: true, mode: 'allowlist' };

  // BYOK mode: pass the user's own anthropic key through (sk-ant-*)
  if (token.startsWith('sk-ant-') || token.startsWith('sk_test_') || token.startsWith('sk-')) {
    return { ok: true, mode: 'byok', byokKey: token };
  }

  return { ok: false, reason: 'Invalid token. Provide a brocco API key from /account, or your own Anthropic key as Bearer token.' };
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    if (name === 'search_web') {
      const tav = process.env.TAVILY_API_KEY;
      if (!tav) return 'ERROR: TAVILY_API_KEY not configured on server';
      const r = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: tav, query: input.query, max_results: input.max_results || 4, include_answer: true }),
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
      const r = await fetch(url, { headers: { 'User-Agent': 'Brocco-API/1.0' } });
      const text = (await r.text()).slice(0, 3500);
      return `status=${r.status}\n\n${text}`;
    }
    return `ERROR: unknown tool ${name}`;
  } catch (e) {
    return `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export default async function handler(req: Request): Promise<Response> {
  // CORS for browser callers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Api-Key',
    'Access-Control-Max-Age': '86400',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405, headers: corsHeaders });

  const auth = authorize(req);
  if (!auth.ok) {
    return Response.json({ error: 'unauthorized', detail: auth.reason }, { status: 401, headers: corsHeaders });
  }

  let body: { agent?: unknown; prompt?: unknown; model?: unknown; max_steps?: unknown };
  try { body = await req.json(); } catch { return Response.json({ error: 'invalid json' }, { status: 400, headers: corsHeaders }); }

  const agentName = String(body.agent || '').toLowerCase();
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const model = typeof body.model === 'string' ? body.model : 'claude-sonnet-4-6';
  const maxSteps = Math.min(12, Math.max(1, Number(body.max_steps) || 6));

  if (!AGENTS[agentName]) {
    return Response.json({ error: 'invalid agent', available: Object.keys(AGENTS) }, { status: 400, headers: corsHeaders });
  }
  if (prompt.length < 4 || prompt.length > 4000) {
    return Response.json({ error: 'prompt must be 4 to 4000 chars' }, { status: 400, headers: corsHeaders });
  }

  // Pick the Anthropic key: BYOK from auth, or server's
  let anthropicKey: string;
  if (auth.mode === 'byok' && auth.byokKey?.startsWith('sk-ant-')) {
    anthropicKey = auth.byokKey;
  } else {
    anthropicKey = process.env.ANTHROPIC_API_KEY || '';
    if (!anthropicKey) {
      return Response.json({ error: 'no anthropic key', detail: 'Pass your own sk-ant-* as Bearer token, or wait for the server to be configured.' }, { status: 503, headers: corsHeaders });
    }
  }

  const agent = AGENTS[agentName];

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (ev: object) => controller.enqueue(enc.encode(`data: ${JSON.stringify(ev)}\n\n`));

      try {
        send({ type: 'run_started', agent: agent.name, prompt });
        const tools = TOOLS.filter(t => agent.tools.includes(t.name));
        const messages: Array<{ role: string; content: unknown }> = [{ role: 'user', content: prompt }];

        for (let step = 1; step <= maxSteps; step++) {
          send({ type: 'step_start', step });

          const resp = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicKey,
              'anthropic-version': '2023-06-01',
              'anthropic-beta': 'prompt-caching-2024-07-31',
            },
            body: JSON.stringify({
              model,
              max_tokens: 2048,
              system: [{ type: 'text', text: agent.system, cache_control: { type: 'ephemeral' } }],
              tools,
              messages,
            }),
          });

          if (!resp.ok) {
            const txt = await resp.text();
            send({ type: 'run_finished', status: 'error', error: `anthropic ${resp.status}: ${txt.slice(0, 300)}` });
            break;
          }

          const data = await resp.json() as { content: Array<Record<string, unknown>>; stop_reason: string; usage?: object };
          send({ type: 'assistant_turn', step, stop_reason: data.stop_reason, content: data.content, usage: data.usage });
          messages.push({ role: 'assistant', content: data.content });

          if (data.stop_reason !== 'tool_use') {
            const text = data.content.filter((b) => b.type === 'text').map((b) => String(b.text || '')).join('\n').trim();
            send({ type: 'assistant_text', text });
            send({ type: 'run_finished', status: 'done', steps: step });
            break;
          }

          const toolResults: Array<{ type: string; tool_use_id: string; content: string; is_error?: boolean }> = [];
          for (const block of data.content) {
            if (block.type !== 'tool_use') continue;
            const tu = block as { id: string; name: string; input: Record<string, unknown> };
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
      ...corsHeaders,
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

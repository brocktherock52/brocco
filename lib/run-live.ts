// Provider dispatcher for live BYOK runs. Routes a run to the right engine by
// model id so callers (app-shell, refresh) stay provider-agnostic. Added with
// the xAI/Grok integration 2026-06-02.

import type { Agent } from './agents';
import type { ClaudeAttachment, LiveEvent } from './claude';
import { runClaudeLive } from './claude';
import { runXaiLive } from './xai';
import { fetchBillingAccess } from './billing-client';

export type Provider = 'anthropic' | 'xai';

/** Which provider a model id belongs to. Grok ids route to xAI; everything
 *  else falls through to the Anthropic engine (the historical default). */
export function providerForModel(modelId: string): Provider {
  return modelId.toLowerCase().startsWith('grok') ? 'xai' : 'anthropic';
}

export interface RunLiveOpts {
  apiKey: string;
  modelId: string;
  agent: Agent;
  goal: string;
  attachments?: ClaudeAttachment[];
  emit: (e: LiveEvent) => void;
  signal: AbortSignal;
  systemPrompt: string;
  maxSteps?: number;
}

/** Run one agent live against whichever provider owns the selected model. The
 *  caller passes the user's BYOK key for that provider (the key must match the
 *  model: an Anthropic sk-ant-… for Claude models, an xAI xai-… for Grok). */
export async function assertClientToolAccess() {
  const access = await fetchBillingAccess();
  if (!access.canUseTools) throw new Error('An active paid subscription is required to use tools. Your trial includes dashboard preview only.');
  return access;
}

export async function runAgentLive(opts: RunLiveOpts): Promise<void> {
  // BYOK does not bypass Brocco's subscription. Keys stay in the browser;
  // hosted requests independently enforce the same entitlement server-side.
  const access = await assertClientToolAccess();
  if (!opts.apiKey && !access.hostedAvailable) throw new Error('Connect your own API key in settings to run tools. Hosted AI is not available for this workspace yet.');
  if (!opts.apiKey) return runHosted(opts);
  if (providerForModel(opts.modelId) === 'xai') {
    return runXaiLive(opts);
  }
  return runClaudeLive(opts);
}

async function runHosted(opts: RunLiveOpts): Promise<void> {
  if (opts.attachments?.length) throw new Error('Hosted runs do not support attachments yet. Remove the attachments or connect your own API key.');
  const response = await fetch('/api/v1/run', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: opts.signal,
    body: JSON.stringify({ prompt: opts.goal, agent: opts.agent.name }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { detail?: string };
    throw new Error(body.detail || 'The hosted run could not start. Please try again.');
  }
  if (!response.body) throw new Error('The hosted run returned no stream.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let textStreamed = false;
  let finished = false;
  let inputTokens = 0;
  let outputTokens = 0;
  opts.emit({ type: 'thinking', text: 'Running your agent with Brocco hosted AI.' });
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const data = frame.split('\n').find((line) => line.startsWith('data: '));
        if (!data) continue;
        let event: { type?: string; delta?: string; text?: string; tool?: string; input?: Record<string, unknown>; output?: string; status?: string; error?: string; usage?: { input_tokens?: number; output_tokens?: number } };
        try { event = JSON.parse(data.slice(6)); } catch { continue; }
        if (event.type === 'text_delta' && event.text) { textStreamed = true; opts.emit({ type: 'text', text: event.text }); }
        if (event.type === 'tool_call') opts.emit({ type: 'tool_call', tool: event.tool || 'tool', input: event.input || {} });
        if (event.type === 'tool_result') opts.emit({ type: 'tool_result', tool: event.tool || 'tool', result: event.output || '' });
        if (event.type === 'assistant_text' && !textStreamed && event.text) opts.emit({ type: 'text', text: event.text });
        if (event.type === 'assistant_turn' && event.usage) {
          inputTokens += event.usage.input_tokens || 0;
          outputTokens += event.usage.output_tokens || 0;
          opts.emit({ type: 'usage', in: inputTokens, out: outputTokens, cost_usd: 0 });
        }
        if (event.type === 'run_finished') {
          finished = true;
          if (event.status !== 'done') throw new Error(event.error || 'The run did not complete. Please try again.');
          opts.emit({ type: 'done', summary: '' });
        }
      }
    }
    if (!finished) throw new Error('The connection ended before the run completed. Please retry.');
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

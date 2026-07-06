// Provider dispatcher for live BYOK runs. Routes a run to the right engine by
// model id so callers (app-shell, refresh) stay provider-agnostic. Added with
// the xAI/Grok integration 2026-06-02.

import type { Agent } from './agents';
import type { ClaudeAttachment, LiveEvent } from './claude';
import { runClaudeLive } from './claude';
import { runXaiLive } from './xai';

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
export function runAgentLive(opts: RunLiveOpts): Promise<void> {
  if (providerForModel(opts.modelId) === 'xai') {
    return runXaiLive(opts);
  }
  return runClaudeLive(opts);
}

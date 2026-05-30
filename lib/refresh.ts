// Client-side "refresh a project + what-changed diff + brain" flow.
//
// This is the BYOK heart of the watcher Braeden asked for. The cron only
// DETECTS staleness and notifies; the actual re-run happens here, in the
// browser, with the user's key (or the simulator in demo mode). The server
// never needs the Anthropic key.
//
// On each refresh we:
//   1. read the accumulated project "brain" (prior iterations) so the run
//      visibly builds on what it learned last time (Brock's self-improving
//      "brain" pitch on the same call)
//   2. re-run the project's goal + agents to produce fresh output
//   3. derive a concise "what changed since [last run]" summary by diffing the
//      prior brain/output against the new output (one cheap haiku call live,
//      a local heuristic in demo)
//   4. append a new brain entry (what we did / learned / changed)
//   5. persist: record the refresh (resets cadence clock, files a
//      changes_found alert), so the bell lights up with the summary.
'use client';

import { AGENTS, type AgentName } from '@/lib/agents';
import { runAgent, type SimEvent } from '@/lib/simulator';
import { runClaudeLive, SYSTEM_PROMPTS, type LiveEvent } from '@/lib/claude';
import {
  getBrain,
  appendBrain,
  recordRefresh,
  appendMessage,
  type BrainEntry,
} from '@/lib/threads-client';

export interface RefreshResult {
  /** true when the diff found meaningful changes vs the last run */
  changed: boolean;
  /** the "what changed since last run" summary (markdown-ish bullets) */
  summary: string;
  /** how many prior iterations the brain held before this refresh */
  priorIterations: number;
}

const HAIKU = 'claude-haiku-4-5';

/** Collect the final text output of one agent run (live or demo). */
async function runOnce(opts: {
  agent: AgentName;
  goal: string;
  apiKey: string | null;
  modelId: string;
}): Promise<string> {
  const a = AGENTS.find((x) => x.name === opts.agent) ?? AGENTS[0];
  const chunks: string[] = [];
  const ctrl = new AbortController();

  if (opts.apiKey) {
    const sys = SYSTEM_PROMPTS[a.name] || SYSTEM_PROMPTS.researcher;
    await runClaudeLive({
      apiKey: opts.apiKey,
      modelId: opts.modelId,
      agent: a,
      goal: opts.goal,
      systemPrompt: sys,
      signal: ctrl.signal,
      emit: (e: LiveEvent) => {
        if (e.type === 'text' && e.text) chunks.push(e.text);
        if (e.type === 'done' && e.summary) chunks.push(e.summary);
      },
    }).catch(() => {});
  } else {
    await runAgent(
      a,
      opts.goal,
      (e: SimEvent) => {
        if (e.type === 'text' && e.text) chunks.push(e.text);
        if (e.type === 'done' && e.summary) chunks.push(e.summary);
      },
      { cancelled: false },
    );
  }
  return chunks.join('\n').trim();
}

/** Render the accumulated brain into a compact context block for the next run. */
export function brainToContext(brain: BrainEntry[]): string {
  if (!brain.length) return '';
  const lines = brain.slice(-6).map((b) => {
    const parts: string[] = [`Iteration ${b.iteration}:`];
    if (b.did) parts.push(`did: ${b.did}`);
    if (b.learned) parts.push(`learned: ${b.learned}`);
    if (b.changed) parts.push(`changed: ${b.changed}`);
    return parts.join(' ');
  });
  return `What this project has done and learned in prior iterations (build on this, do not repeat it):\n${lines.join('\n')}`;
}

/** Cheap haiku call that diffs old vs new output into 2-5 "what changed" bullets. */
async function diffWithClaude(
  apiKey: string,
  prior: string,
  next: string,
  lastRunLabel: string,
): Promise<string> {
  const prompt = `You compare two versions of an AI research/work output for the SAME project and report what is new or changed.

PREVIOUS VERSION (from ${lastRunLabel}):
"""
${prior.slice(0, 6000)}
"""

NEW VERSION (just produced):
"""
${next.slice(0, 6000)}
"""

Write 2 to 5 short bullet points of what is NEW, CHANGED, or worth the user's attention since the previous version. Be specific and concrete. If nothing material changed, reply with the single line: No material changes. Do not use em dashes.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: 'You are a precise change-summarizer. Output only the bullets, no preamble.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) return localDiff(prior, next);
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('\n')
      .trim();
    return text || localDiff(prior, next);
  } catch {
    return localDiff(prior, next);
  }
}

/** Local heuristic diff used in demo mode (no key) or when the haiku call fails. */
function localDiff(prior: string, next: string): string {
  const norm = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .split(/\n+/)
        .map((l) => l.replace(/^[-*\d.\s]+/, '').trim())
        .filter((l) => l.length > 12),
    );
  const oldLines = norm(prior);
  const newLines = [...norm(next)];
  const fresh = newLines.filter((l) => !oldLines.has(l)).slice(0, 5);
  if (!prior.trim()) {
    return '- First run captured. Future refreshes will show what changed since this baseline.';
  }
  if (fresh.length === 0) {
    return 'No material changes.';
  }
  return fresh.map((l) => `- New: ${l.slice(0, 140)}`).join('\n');
}

function relativeLabel(ms: number | null): string {
  if (!ms) return 'the last run';
  const days = Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

/**
 * Run a full refresh for a saved project. Works for both live (BYOK) and demo.
 * `threadId` may be null for purely-local projects (demo / anonymous), in which
 * case server persistence is skipped but the brain still accumulates locally.
 */
export async function refreshProjectWithDiff(opts: {
  threadId: string | null;
  goal: string;
  agents: AgentName[];
  apiKey: string | null;
  modelId: string;
  lastRunMs: number | null;
}): Promise<RefreshResult> {
  const { threadId, goal, agents, apiKey, modelId, lastRunMs } = opts;

  // 1. read the brain so this iteration builds on the last
  const brain = threadId ? await getBrain(threadId) : [];
  const priorIterations = brain.length;
  const context = brainToContext(brain);
  const priorOutput = brain
    .map((b) => [b.did, b.learned, b.changed].filter(Boolean).join(' '))
    .join('\n');

  // 2. re-run. Feed the brain in as leading context so the model improves
  //    on prior iterations rather than starting cold.
  const augmentedGoal = context ? `${context}\n\nGoal:\n${goal}` : goal;
  const primaryAgent = agents[0] ?? 'researcher';
  const fresh = await runOnce({ agent: primaryAgent, goal: augmentedGoal, apiKey, modelId });

  // 3. derive the "what changed" summary
  const lastRunLabel = relativeLabel(lastRunMs);
  const summary = apiKey
    ? await diffWithClaude(apiKey, priorOutput, fresh, lastRunLabel)
    : localDiff(priorOutput, fresh);
  const changed = summary.trim().toLowerCase() !== 'no material changes.';

  // 4. append a brain entry for this iteration
  if (threadId) {
    await appendBrain(threadId, {
      did: `Re-ran ${agents.join(', ')} on "${goal.slice(0, 100)}".`,
      learned: fresh.slice(0, 1200) || null,
      changed: summary.slice(0, 1200),
    });
    // keep the run output in the thread log too
    await appendMessage(threadId, {
      role: 'agent',
      agent: primaryAgent,
      content: fresh || '(no output produced)',
      meta: { kind: 'refresh', changed, summary },
    });
    // 5. record the refresh (resets cadence + files changes_found alert)
    await recordRefresh(threadId, {
      summary: changed ? summary : null,
      changed,
      threadTitle: goal.slice(0, 120),
    });
  }

  return { changed, summary, priorIterations };
}

export { HAIKU };

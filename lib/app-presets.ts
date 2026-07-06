// App workspace presets. Lets /app open pre-configured from a URL so the
// real-estate funnel (and any vertical/recipe page) can deep-link a tailored
// experience instead of dumping everyone on the generic "launch sprint"
// default. Two real RE users bounced because the blank app was not obviously
// for them; this gives each category the right crew, a starter goal, and
// category-specific examples.
//
// Deep-link shapes that /app understands:
//   /app?for=wholesalers
//   /app?recipe=skip-trace-and-outreach
//   /app?goal=<encoded>&agents=researcher,outreach&label=Custom

import { AGENTS, type AgentName } from './agents';
import { getVertical } from './verticals';
import { RECIPE_PROFILES } from './recipe-profiles';

export interface AppPreset {
  /** short workspace label shown in the app, e.g. "Wholesaling" */
  label: string;
  /** prompt pre-filled into the goal box (may be empty to leave it blank) */
  goal: string;
  /** agent crew pre-selected (already sanitized to valid agents) */
  agents: AgentName[];
  /** category-specific "try one of these" starters */
  examples: string[];
}

const VALID = new Set<string>(AGENTS.map((a) => a.name));

/** Keep only agents /app actually supports (verticals reference some, e.g. `ops`,
 *  that are not selectable). Falls back to a sane default if nothing survives. */
function sanitizeAgents(agents: string[]): AgentName[] {
  const ok = agents.filter((a): a is AgentName => VALID.has(a));
  return ok.length ? ok : (['researcher', 'analyst', 'outreach'] as AgentName[]);
}

// Hand-tuned real-estate presets. Goals/examples are concrete and in the
// operator's language so a wholesaler immediately sees what to type.
const RE_PRESETS: Record<string, { label: string; goal: string; agents: AgentName[]; examples: string[] }> = {
  wholesalers: {
    label: 'Wholesaling',
    goal: 'find distressed / motivated-seller leads in [county or zip], filter to the ones that pencil for a wholesale assignment at our spread, then skip trace and draft a call + text list.',
    agents: ['browser', 'researcher', 'outreach', 'coder'],
    examples: [
      'pull tax-delinquent and pre-foreclosure leads in wayne county under $150k and build a prioritized call list',
      'skip trace these 20 addresses and write 3 cold-call openers + an sms for each owner',
      'run comps and max allowable offer on 1234 main st for a wholesale assignment with a $15k spread',
    ],
  },
  'land-investors': {
    label: 'Land investing',
    goal: 'find rural / infill land deals in [county] that fit a buy-low resell strategy, pull owner + parcel data, and draft low-ball offer letters.',
    agents: ['browser', 'researcher', 'analyst', 'outreach'],
    examples: [
      'find vacant land parcels 1-10 acres in [county] with delinquent taxes and rank by $/acre vs recent sales',
      'pull owner mailing info for these 30 parcels and draft a neutral low-ball offer letter',
      'comp this 5-acre lot against the last 12 months of land sales and suggest an offer + resale price',
    ],
  },
  'creative-finance-investors': {
    label: 'Creative finance',
    goal: 'find sellers who are good fits for subject-to / seller-finance in [market], research their situation, and draft a creative-offer pitch.',
    agents: ['researcher', 'analyst', 'outreach', 'coder'],
    examples: [
      'find tired-landlord and high-equity listings in [market] that fit a subject-to or seller-finance offer',
      'research this property + owner and draft a subject-to pitch that handles the "due on sale" objection',
      'build a seller-finance vs subject-to comparison for 1234 main st with monthly payment math',
    ],
  },
  'real-estate-agents': {
    label: 'Agent tools',
    goal: 'build a listing + lead workflow for my farm area: pull expired / FSBO leads, write outreach, and draft listing marketing.',
    agents: ['researcher', 'outreach', 'analyst', 'designer'],
    examples: [
      'pull expired and fsbo listings in [zip] and write a 3-touch outreach sequence for each',
      'draft listing copy, a just-listed social post, and an open-house plan for 1234 main st',
      'build a cma-style comp summary and a pricing recommendation for a 3/2 in [neighborhood]',
    ],
  },
};

/** Resolve a preset from a recipe slug (uses the recipe's prompt + crew). */
export function presetForRecipe(slug: string): AppPreset | null {
  const r = RECIPE_PROFILES.find((x) => x.slug === slug);
  if (!r) return null;
  return { label: r.name, goal: r.prompt, agents: sanitizeAgents(r.agents), examples: [] };
}

/** Resolve a preset from a vertical/category slug. RE categories get the
 *  hand-tuned presets above; other verticals fall back to their own crew. */
export function presetForVertical(slug: string): AppPreset | null {
  const re = RE_PRESETS[slug];
  if (re) return { ...re };
  const v = getVertical(slug);
  if (!v) return null;
  return { label: v.audience, goal: '', agents: sanitizeAgents(v.agents), examples: [] };
}

/** Resolve a full preset from a URLSearchParams-like object. Returns null if
 *  no preset params are present. Priority: recipe > for > raw goal/agents. */
export function resolvePreset(params: URLSearchParams): AppPreset | null {
  const recipe = params.get('recipe');
  const forSlug = params.get('for');
  const rawGoal = params.get('goal');
  const rawAgents = params.get('agents');
  const rawLabel = params.get('label');

  let base: AppPreset | null = null;
  if (recipe) base = presetForRecipe(recipe);
  if (!base && forSlug) base = presetForVertical(forSlug);

  if (rawGoal || rawAgents || rawLabel) {
    base = {
      label: rawLabel || base?.label || 'Custom',
      goal: rawGoal ?? base?.goal ?? '',
      agents: rawAgents ? sanitizeAgents(rawAgents.split(',').map((s) => s.trim())) : (base?.agents ?? sanitizeAgents([])),
      examples: base?.examples ?? [],
    };
  }
  return base;
}

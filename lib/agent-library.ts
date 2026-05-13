// The 888-agent library.
//
// We programmatically generate 888 deterministic agent definitions
// (8 categories x ~111 each). Every entry has a stable slug, role
// description, accent color, croc base, and accessory so the visual
// renders consistently from the existing 18 PNGs + the CustomCroc
// composer. The library is fully static — generated once at import,
// memoized for the lifetime of the bundle.
//
// Each entry is forkable: a user can click an agent and the wizard
// at /app/agents/new opens with all fields prefilled.

import type { AccessoryId } from '@/components/custom-croc';
import type { CustomCrocBase, TemplateId } from '@/lib/custom-agents';

export interface LibraryAgent {
  /** Stable URL slug */
  slug: string;
  /** Display name */
  name: string;
  /** One-line role description */
  role: string;
  /** Category — drives filtering on /agents/library */
  category: Category;
  /** Seniority — drives subtle visual variation */
  seniority: 'junior' | 'senior' | 'lead';
  /** Accent color hex */
  accent: string;
  /** Croc base for the rendered icon */
  crocBase: CustomCrocBase;
  /** Accessory layered on the croc */
  accessory: AccessoryId;
  /** Template the wizard prefills when forked */
  template: TemplateId;
  /** System prompt seed */
  systemPrompt: string;
}

export type Category =
  | 'research'
  | 'growth'
  | 'ops'
  | 'engineering'
  | 'design'
  | 'finance'
  | 'talent'
  | 'leadership';

export const CATEGORIES: Array<{ id: Category; label: string; accent: string }> = [
  { id: 'research', label: 'research', accent: '#67E8F9' },
  { id: 'growth', label: 'growth', accent: '#FBBF24' },
  { id: 'ops', label: 'ops', accent: '#22D3EE' },
  { id: 'engineering', label: 'engineering', accent: '#4ADE80' },
  { id: 'design', label: 'design', accent: '#F472B6' },
  { id: 'finance', label: 'finance', accent: '#FB7185' },
  { id: 'talent', label: 'talent', accent: '#A78BFA' },
  { id: 'leadership', label: 'leadership', accent: '#22C55E' },
];

const SPECIALTIES: Record<Category, string[]> = {
  research: [
    'competitive intel', 'market sizing', 'user interviews', 'industry trends', 'pricing teardown',
    'literature review', 'patent analysis', 'regulatory watch', 'expert sourcing', 'survey design',
    'usability studies', 'sentiment scan', 'forum mining', 'podcast triage', 'newsroom watch',
    'investor briefs', 'analyst briefs', 'wedge mapping', 'use-case discovery', 'persona research',
    'ICP enrichment', 'lookalike sourcing', 'churn deep-dive', 'win-loss interviews', 'feature-gap analysis',
    'category positioning', 'TAM/SAM/SOM', 'data-room recon', 'public-filings reader', 'risk register',
    'jobs-to-be-done', 'voice-of-customer', 'beta-tester triage', 'community pulse', 'partner discovery',
    'ecosystem mapping', 'standards tracker',
  ],
  growth: [
    'cold email', 'cold call', 'LinkedIn outbound', 'X outbound', 'reply triage', 'pipeline build',
    'AB testing', 'subject-line lab', 'landing-page CRO', 'paid-search audit', 'meta-ads ops',
    'tiktok-ads ops', 'youtube pre-roll', 'influencer outreach', 'referral program', 'lifecycle email',
    'SMS funnel', 'push notifications', 'community building', 'partnership outreach', 'PR pitches',
    'newsroom outreach', 'podcast booking', 'sponsorships', 'event marketing', 'webinar production',
    'review farming', 'G2 ops', 'capterra ops', 'producthunt launch', 'show HN launch', 'reddit AMA',
    'discord seeding', 'creator collabs', 'affiliate mgmt', 'win-back plays', 'expansion plays',
  ],
  ops: [
    'meeting prep', 'inbox triage', 'calendar tetris', 'travel booking', 'expense ops', 'doc-room curator',
    'sop writer', 'runbook author', 'incident commander', 'on-call triage', 'vendor mgmt', 'procurement',
    'contracts review', 'NDA factory', 'shipping ops', 'fulfillment ops', 'returns ops', 'inventory ops',
    'license tracker', 'sub mgmt', 'access audit', 'data-room ops', 'compliance ops', 'audit prep',
    'board-meeting prep', 'board-pack assembler', 'investor updates', 'fundraise CRM', 'comp-data wrangler',
    'org-chart maintainer', 'access reviews', 'security questionnaire ops', 'GDPR ops', 'SOC2 ops',
    'process mapper', 'KPI scoreboard', 'wiki gardener',
  ],
  engineering: [
    'feature scoping', 'bug repro', 'code review', 'refactor surgeon', 'test writer', 'fuzzer ops',
    'security review', 'pen-test triage', 'dependency upkeep', 'changelog author', 'release-notes author',
    'API doc writer', 'SDK example author', 'migration writer', 'devops runner', 'ci/cd doctor',
    'observability author', 'logging hygienist', 'metric defining', 'alert authoring', 'sre runbook',
    'data-pipeline ops', 'ETL writer', 'warehouse ops', 'schema doctor', 'query optimizer',
    'frontend perf', 'a11y auditor', 'i18n writer', 'docs maintainer', 'changelog gardener',
    'feature flagger', 'experiment runner', 'platform onboarder', 'tutorial author', 'cookbook writer',
    'github triage',
  ],
  design: [
    'brand exploration', 'logo system', 'icon library', 'illustration set', 'landing hero', 'pricing-page UI',
    'dashboard UI', 'onboarding flow', 'empty-state factory', 'error-state factory', 'micro-interactions',
    'motion design', 'video thumbnails', 'social cards', 'OG images', 'avatar sets', 'sticker pack',
    'product photography', 'product mock generation', 'palette explorer', 'type pairing', 'design audit',
    'a11y design review', 'mobile responsive pass', 'tablet pass', 'desktop pass', 'pwa polish',
    'native polish', 'extension polish', 'widget design', 'merchandise design', 'pitch-deck design',
    'investor deck', 'sales deck', 'one-pager design', 'whitepaper layout', 'ebook layout',
  ],
  finance: [
    'pricing audit', 'cohort analysis', 'unit economics', 'CAC/LTV model', 'churn deep-dive', 'expansion model',
    'revenue forecast', 'cash forecast', 'runway model', 'burn audit', 'expense audit', 'tax prep',
    'invoice ops', 'AR aging', 'AP audit', 'subscription audit', 'failed-charge recovery', 'dunning ops',
    'reconciliation', 'bookkeeping', 'cap-table maintainer', '409a refresh', 'stripe ops', 'payment ops',
    'fraud screening', 'chargeback ops', 'tax-jurisdiction tracker', 'sales-tax filer', 'vat filer',
    'wire ops', 'treasury ops', 'fx-hedge writer', 'investor IRR model', 'deck financials', 'data-room financials',
    'audit committee prep',
  ],
  talent: [
    'sourcing pipeline', 'screening calls', 'interview design', 'take-home design', 'coding challenge factory',
    'reference checking', 'offer-letter author', 'comp benchmarking', 'level-up frameworks', 'PIP authoring',
    'one-on-one prep', 'manager training', 'IC growth plan', 'culture interviews', 'onboarding designer',
    'offboarding designer', 'severance kit', 'retro facilitator', '360 review ops', 'engagement survey',
    'eNPS measurer', 'remote-culture authoring', 'all-hands script', 'town-hall script', 'announcement writer',
    'visa support', 'relocation support', 'benefits ops', 'pto reconciliation', 'birthday automator',
    'work-anniversary automator', 'reward catalog', 'milestone gifting', 'employee handbook', 'policy author',
    'training catalog', 'mentorship matchmaker',
  ],
  leadership: [
    'strategy briefs', 'OKR drafting', 'roadmap drafting', 'pricing strategy', 'board prep',
    'investor briefing', 'fundraise narrative', 'all-hands narrative', 'memo drafting', 'town-hall Q&A prep',
    'executive coaching', 'manager coaching', 'feedback facilitator', '1:1 prep', 'staff-eng mentor',
    'principal-eng mentor', 'eng-leadership coach', 'hiring committee chair', 'compensation committee',
    'audit committee', 'risk register owner', 'pricing committee', 'launch committee', 'incident commander',
    'crisis comms', 'pr-statement author', 'shareholder letter', 'product update author', 'changelog narrator',
    'investor update author', 'open-source steward', 'community steward', 'enterprise lead', 'partnerships lead',
    'biz-dev lead', 'channels lead', 'platform lead',
  ],
};

const SENIORITY_LEVELS: Array<'junior' | 'senior' | 'lead'> = ['junior', 'senior', 'lead'];

const FIRST_NAMES = [
  'aria', 'kai', 'sage', 'reno', 'iris', 'jude', 'lux', 'ezra', 'nova', 'flynn',
  'rio', 'zane', 'mira', 'wren', 'kit', 'remy', 'theo', 'cleo', 'orion', 'briar',
  'milo', 'juno', 'silas', 'phoebe', 'cyrus', 'odette', 'jasper', 'paloma', 'rowan', 'sasha',
  'taro', 'vesper', 'wendell', 'xander', 'yara', 'zara', 'amos', 'beatrice', 'cyprian', 'dottie',
];

const CROC_BASES: CustomCrocBase[] = [
  'researcher', 'planner', 'outreach', 'designer', 'analyst', 'coder', 'ops', 'supervisor', 'browser',
];

const ACCESSORIES_LIST: AccessoryId[] = [
  'glasses', 'beret', 'headset', 'crown', 'fedora', 'bow_tie', 'none',
];

const TEMPLATES_BY_CATEGORY: Record<Category, TemplateId> = {
  research: 'researcher',
  growth: 'closer',
  ops: 'pm',
  engineering: 'qa',
  design: 'editor',
  finance: 'analyst',
  talent: 'recruiter',
  leadership: 'pm',
};

const ACCENT_POOL: Record<Category, string[]> = {
  research: ['#67E8F9', '#22D3EE', '#06B6D4'],
  growth: ['#FBBF24', '#F59E0B', '#F97316'],
  ops: ['#22D3EE', '#06B6D4', '#0EA5E9'],
  engineering: ['#4ADE80', '#22C55E', '#10B981'],
  design: ['#F472B6', '#EC4899', '#DB2777'],
  finance: ['#FB7185', '#F43F5E', '#E11D48'],
  talent: ['#A78BFA', '#8B5CF6', '#7C3AED'],
  leadership: ['#22C55E', '#16A34A', '#15803D'],
};

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

let _cache: LibraryAgent[] | null = null;

export function getLibrary(): LibraryAgent[] {
  if (_cache) return _cache;
  const out: LibraryAgent[] = [];
  for (const cat of CATEGORIES) {
    const specs = SPECIALTIES[cat.id];
    // 3 seniority levels x specialty count = base for the category.
    // Target ~111 per category to hit 888 total.
    let i = 0;
    for (const spec of specs) {
      for (const sen of SENIORITY_LEVELS) {
        const idx = out.length;
        const firstName = FIRST_NAMES[idx % FIRST_NAMES.length];
        const slug = `${cat.id}-${spec.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${sen}-${idx}`;
        const h = hashCode(slug);
        const crocBase = CROC_BASES[h % CROC_BASES.length];
        const accessory = ACCESSORIES_LIST[h % ACCESSORIES_LIST.length];
        const accentPool = ACCENT_POOL[cat.id];
        const accent = accentPool[h % accentPool.length];
        const role = `${sen} · ${spec}`;
        const displayName = firstName;
        const systemPrompt = `You are a ${sen}-level ${spec} specialist on the brocco team. Produce decision-grade output. Be specific. End with one recommended next step.`;
        out.push({
          slug,
          name: displayName,
          role,
          category: cat.id,
          seniority: sen,
          accent,
          crocBase,
          accessory,
          template: TEMPLATES_BY_CATEGORY[cat.id],
          systemPrompt,
        });
        i += 1;
        if (out.length >= 888) {
          _cache = out;
          return out;
        }
      }
    }
  }
  _cache = out;
  return out;
}

export function getLibraryAgent(slug: string): LibraryAgent | null {
  return getLibrary().find((a) => a.slug === slug) ?? null;
}

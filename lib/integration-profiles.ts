// Integration pages — /integrations and /integrations/<slug>.

export interface IntegrationProfile {
  slug: string;
  name: string;
  category: 'model' | 'comms' | 'data' | 'productivity';
  tagline: string;
  setup: string;
  configSnippet: string;
  usedBy: string[];
  notes: string[];
  keywords: string[];
}

export const INTEGRATION_PROFILES: IntegrationProfile[] = [
  {
    slug: 'anthropic',
    name: 'Anthropic',
    category: 'model',
    tagline: 'Claude Opus, Sonnet, Haiku via your API key. BYOK or hosted.',
    setup: 'Add your ANTHROPIC_API_KEY in /app settings. Free tier: 100 BYOK runs/month against your Anthropic account. Paid tier: hosted with ZDR enabled on the account.',
    configSnippet: `// /app settings → BYOK
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4-7  // or claude-sonnet-4-6, claude-haiku-4-5`,
    usedBy: ['supervisor', 'researcher', 'planner', 'outreach', 'designer', 'analyst', 'coder', 'ops', 'browser'],
    notes: [
      'Default model is Sonnet 4.6 for cost; Opus 4.7 available for hard reasoning.',
      'Prompt cache is enabled by default for system prompts.',
    ],
    keywords: ['anthropic claude integration', 'byok claude', 'claude api'],
  },
  {
    slug: 'openai',
    name: 'OpenAI',
    category: 'model',
    tagline: 'GPT-5, GPT-4.1, o3 series via your API key. Compare side-by-side.',
    setup: 'Add OPENAI_API_KEY in /app settings. brocco can route any agent to GPT models for comparison; default is Anthropic.',
    configSnippet: `OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5  // or gpt-4.1, o3, o3-mini`,
    usedBy: ['supervisor', 'researcher', 'analyst', 'coder'],
    notes: [
      'Useful for cross-model broadcast: same prompt, two models, compare answers.',
      'Tool use shape differs slightly — brocco normalizes.',
    ],
    keywords: ['openai integration', 'gpt agent', 'multi-model agent'],
  },
  {
    slug: 'ollama',
    name: 'Ollama',
    category: 'model',
    tagline: 'Run agents fully local. brocco auto-detects localhost:11434.',
    setup: 'Run Ollama locally. brocco pings localhost:11434/v1/models on /app load and surfaces a "Use local Ollama" toggle if it sees one.',
    configSnippet: `# Default
ollama serve
ollama pull llama3.3:70b

# brocco picks it up automatically`,
    usedBy: ['supervisor', 'researcher', 'planner', 'outreach', 'designer', 'analyst', 'coder', 'ops'],
    notes: [
      'Tool use depends on model; llama3.3, qwen2.5-coder are best.',
      'Latency is the cost — local 70B is 5-15x slower than hosted.',
    ],
    keywords: ['ollama integration', 'local llm agent', 'self-hosted ai'],
  },
  {
    slug: 'stripe',
    name: 'Stripe',
    category: 'data',
    tagline: 'Read balances, MRR, customer lists. Optional writes for ops.',
    setup: 'Add STRIPE_API_KEY in /app settings. Defaults to read-only; opt-in to writes per-run.',
    configSnippet: `STRIPE_API_KEY=sk_live_...  // or sk_test_ for test mode

// Default: read-only
// To allow writes: pass allow_write=true at run start`,
    usedBy: ['analyst', 'ops'],
    notes: [
      'Test mode vs live is determined by the key prefix; check before broadcast.',
      'Pagination handled automatically; rate limits are yours.',
    ],
    keywords: ['stripe integration', 'mrr ai analysis', 'billing automation ai'],
  },
  {
    slug: 'slack',
    name: 'Slack',
    category: 'comms',
    tagline: 'Read channel history. Post on your behalf. Send DMs.',
    setup: 'Install the brocco Slack app from /integrations. Grant channels:history, chat:write, users:read scopes.',
    configSnippet: `# After install
SLACK_BOT_TOKEN=xoxb-...
SLACK_DEFAULT_CHANNEL=C0...

// Per-run override:
// channel_id="C0..."`,
    usedBy: ['outreach', 'ops', 'analyst'],
    notes: [
      'Posts go through the brocco Slack app, identified by your team.',
      'Audit log captures channel + message length, not body.',
    ],
    keywords: ['slack integration ai', 'agent slack post', 'channel summary ai'],
  },
  {
    slug: 'gmail',
    name: 'Gmail',
    category: 'comms',
    tagline: 'Search threads. Draft emails. Triage your inbox.',
    setup: 'Connect via Google OAuth on /integrations. Scopes: readonly + drafts.compose. Send requires explicit allow_send per-run.',
    configSnippet: `# OAuth handled in /integrations/gmail
# Per-run override:
allow_send=true  // default false`,
    usedBy: ['outreach', 'ops'],
    notes: [
      'Drafts default to compose-only; explicit send required at run start.',
      'Audit log captures recipients + subject + bytes, not body.',
    ],
    keywords: ['gmail integration ai', 'email draft ai', 'inbox triage'],
  },
  {
    slug: 'notion',
    name: 'Notion',
    category: 'productivity',
    tagline: 'Read databases. Append pages. Sync agent output to your wiki.',
    setup: 'Connect via Notion OAuth. Choose which databases brocco can read/write. All other databases stay invisible.',
    configSnippet: `# OAuth handled in /integrations/notion
# Database whitelist set at install time

# Per-run:
notion_database_id=...`,
    usedBy: ['researcher', 'planner', 'outreach', 'ops'],
    notes: [
      'Database whitelist is enforced server-side; agents cannot escape.',
      'Page hierarchy reads supported; full-text search uses Notion API.',
    ],
    keywords: ['notion integration ai', 'wiki sync agent', 'notion database ai'],
  },
  {
    slug: 'postgres',
    name: 'Postgres',
    category: 'data',
    tagline: 'Read-only SQL by default. Schema introspection automatic.',
    setup: 'Add a Postgres connection URI in /integrations. brocco introspects schema and exposes it via the postgres tool.',
    configSnippet: `POSTGRES_URI=postgresql://readonly:pwd@host:5432/db

// Read-only by default. To allow writes:
// allow_writes=true (at run start)`,
    usedBy: ['analyst', 'ops'],
    notes: [
      'Use a read-replica URI if your primary is performance-sensitive.',
      'EXPLAIN before queries against tables >100M rows.',
    ],
    keywords: ['postgres integration ai', 'database agent', 'sql ai automation'],
  },
];

export function getIntegrationProfile(slug: string): IntegrationProfile | null {
  return INTEGRATION_PROFILES.find((i) => i.slug === slug) ?? null;
}

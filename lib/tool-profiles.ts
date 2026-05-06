// Tool registry pages — /tools and /tools/<slug>. Mined from v12 build.

export interface ToolFaq { q: string; a: string }

export interface ToolProfile {
  slug: string;
  name: string;
  tagline: string;
  category: 'fetch' | 'storage' | 'compute' | 'creative' | 'data' | 'flow';
  what: string[];
  apiSpec: string;
  security: string;
  usedBy: string[];
  gotchas: string[];
  keywords: string[];
}

export const TOOL_PROFILES: ToolProfile[] = [
  {
    slug: 'search-web',
    name: 'search_web',
    tagline: 'Tavily web search. Returns query results with title, snippet, URL, score.',
    category: 'fetch',
    what: [
      'Wraps Tavily search with sensible defaults (advanced search, 5 to 10 results).',
      'Returns ranked results with title, snippet, URL, and a relevance score.',
      'Optional include_answer flag returns a short synthesized answer alongside.',
    ],
    apiSpec: `{
  "name": "search_web",
  "input_schema": {
    "properties": {
      "query": { "type": "string" },
      "max_results": { "type": "integer", "default": 5 },
      "include_answer": { "type": "boolean", "default": false }
    },
    "required": ["query"]
  }
}`,
    security: 'Searches go through Tavily on your account. No URL allowlist required for queries. Each call is JSONL-logged with query and result count.',
    usedBy: ['researcher', 'analyst', 'browser'],
    gotchas: [
      'Tavily quota counts each call. Watch the dashboard if you broadcast.',
      'Results are ranked by Tavily relevance, not freshness; pair with http_get for fresh page content.',
    ],
    keywords: ['ai web search tool', 'tavily search api', 'agent search'],
  },
  {
    slug: 'http-get',
    name: 'http_get',
    tagline: 'Fetch a URL through the brocco proxy. Returns status, headers, body.',
    category: 'fetch',
    what: [
      'Fetches a URL via the brocco egress proxy.',
      'Returns status, headers, body (truncated to 200 KB by default), and elapsed_ms.',
      'Pairs with search_web for "search then read" workflows.',
    ],
    apiSpec: `{
  "name": "http_get",
  "input_schema": {
    "properties": {
      "url": { "type": "string", "format": "uri" },
      "headers": { "type": "object" },
      "max_bytes": { "type": "integer", "default": 204800 }
    },
    "required": ["url"]
  }
}`,
    security: 'Allowlisted egress; per-agent host allowlist. Bodies capped at 200 KB to control token spend. Every call audit-logged.',
    usedBy: ['researcher', 'analyst', 'browser', 'coder'],
    gotchas: [
      'JS-rendered pages return empty body. Fall back to the browser agent.',
      '200 KB cap drops large pages; pass max_bytes if you need more.',
    ],
    keywords: ['agent http fetch', 'web scraping ai', 'proxy fetch'],
  },
  {
    slug: 'http-post',
    name: 'http_post',
    tagline: 'Send POST requests to APIs. JSON or form bodies. Auth headers supported.',
    category: 'fetch',
    what: [
      'Sends POST requests with JSON or form body to whitelisted hosts.',
      'Auth headers and bearer tokens supported via the headers field.',
      'Returns status, headers, and body for the model to reason about.',
    ],
    apiSpec: `{
  "name": "http_post",
  "input_schema": {
    "properties": {
      "url": { "type": "string", "format": "uri" },
      "body": { "type": "object" },
      "headers": { "type": "object" },
      "as_form": { "type": "boolean", "default": false }
    },
    "required": ["url", "body"]
  }
}`,
    security: 'Allowlisted hosts only. Tokens come from your env-vars or memory store, never sent in plaintext logs. Audit log captures URL + status, not bodies.',
    usedBy: ['outreach', 'ops', 'coder'],
    gotchas: [
      'Side-effecting calls — wrap in confirmation flow if you do not want auto-send.',
      'Rate limits hit you, not us. Add backoff if you broadcast bulk POSTs.',
    ],
    keywords: ['ai api call tool', 'post requests agent', 'agent http'],
  },
  {
    slug: 'file-read',
    name: 'file_read',
    tagline: 'Read a file from the run\'s scratch directory. Returns content as text.',
    category: 'storage',
    what: [
      'Reads a file from the per-run scratch directory.',
      'Auto-detects encoding for text files; returns base64 for binary.',
      'Pairs with file_save for persistent intermediate state across agents.',
    ],
    apiSpec: `{
  "name": "file_read",
  "input_schema": {
    "properties": {
      "path": { "type": "string" },
      "max_bytes": { "type": "integer", "default": 1048576 }
    },
    "required": ["path"]
  }
}`,
    security: 'Sandboxed to the run\'s scratch directory. Cannot read outside. Each read audit-logged with path + bytes.',
    usedBy: ['analyst', 'coder', 'designer'],
    gotchas: [
      '1 MB default cap. Pass max_bytes for larger files.',
      'Run scratch is wiped after run completes — file_read does not work across runs.',
    ],
    keywords: ['agent file read', 'sandbox filesystem ai'],
  },
  {
    slug: 'file-write',
    name: 'file_write',
    tagline: 'Write a file to the run\'s scratch directory. Persists for the run.',
    category: 'storage',
    what: [
      'Writes content to the per-run scratch directory.',
      'Returns the saved path so other agents can read it back.',
      'Use for briefs, plans, drafts, and any artifact you want exported at run-end.',
    ],
    apiSpec: `{
  "name": "file_write",
  "input_schema": {
    "properties": {
      "path": { "type": "string" },
      "content": { "type": "string" },
      "encoding": { "type": "string", "default": "utf-8" }
    },
    "required": ["path", "content"]
  }
}`,
    security: 'Sandboxed to scratch. Files exported as a zip at run-end and offered for download.',
    usedBy: ['researcher', 'planner', 'designer', 'coder'],
    gotchas: [
      'Append mode is opt-in; default overwrites.',
      'Scratch is wiped after run completes; export your zip if you need durability.',
    ],
    keywords: ['agent file write', 'sandbox storage ai'],
  },
  {
    slug: 'memory-get',
    name: 'memory_get',
    tagline: 'Read a value from cross-run memory. Persists across runs and agents.',
    category: 'storage',
    what: [
      'Reads a value from cross-run memory keyed by namespace + key.',
      'Persists across runs in your account, scoped to your workspace.',
      'Use for context that should outlive a single run (preferences, cached research).',
    ],
    apiSpec: `{
  "name": "memory_get",
  "input_schema": {
    "properties": {
      "namespace": { "type": "string" },
      "key": { "type": "string" }
    },
    "required": ["namespace", "key"]
  }
}`,
    security: 'Stored in your workspace KV. Encrypted at rest. Scoped per-namespace so two agents do not collide unless both read the same namespace.',
    usedBy: ['outreach', 'researcher', 'supervisor'],
    gotchas: [
      'Returns null on miss, not an error. Branch on null in your prompt template.',
      'Plan namespaces up front; renaming a namespace requires a manual migration.',
    ],
    keywords: ['agent memory', 'long term memory ai', 'kv store agent'],
  },
  {
    slug: 'memory-put',
    name: 'memory_put',
    tagline: 'Write a value to cross-run memory. Persists across runs.',
    category: 'storage',
    what: [
      'Writes a value to cross-run memory under namespace + key.',
      'TTL field optional; defaults to no expiry.',
      'Use for caching researcher output, lead enrichment, learned preferences.',
    ],
    apiSpec: `{
  "name": "memory_put",
  "input_schema": {
    "properties": {
      "namespace": { "type": "string" },
      "key": { "type": "string" },
      "value": { "type": ["string", "object"] },
      "ttl_seconds": { "type": "integer" }
    },
    "required": ["namespace", "key", "value"]
  }
}`,
    security: 'Workspace-scoped, encrypted at rest. Audit log captures namespace + key + ttl, never values.',
    usedBy: ['researcher', 'analyst', 'outreach', 'supervisor'],
    gotchas: [
      'Default no-TTL means values live forever. Set ttl_seconds for ephemeral cache.',
      'Large values cost storage; truncate or summarize before put.',
    ],
    keywords: ['agent memory write', 'kv put ai', 'ai cache'],
  },
  {
    slug: 'shell-exec',
    name: 'shell_exec',
    tagline: 'Run a shell command in the sandboxed coder runtime. Captures stdout/stderr.',
    category: 'compute',
    what: [
      'Executes a shell command inside the sandboxed coder container.',
      'Captures stdout, stderr, and exit code.',
      'Bash, Python, Node, and common CLI tools (jq, curl, git) are pre-installed.',
    ],
    apiSpec: `{
  "name": "shell_exec",
  "input_schema": {
    "properties": {
      "command": { "type": "string" },
      "timeout_seconds": { "type": "integer", "default": 60 },
      "cwd": { "type": "string" }
    },
    "required": ["command"]
  }
}`,
    security: 'Runs in an ephemeral Docker container per run. No outbound network unless explicitly enabled. 60-second default timeout. Read-only mount for /etc; writable scratch for /work.',
    usedBy: ['coder', 'browser', 'analyst'],
    gotchas: [
      'No persistent state between calls within a run; export to file_write if you need it.',
      'Network egress is opt-in; bare curl will fail unless your run enables it.',
    ],
    keywords: ['agent shell exec', 'sandbox code execution', 'ai runtime'],
  },
  {
    slug: 'image-gen',
    name: 'image_gen',
    tagline: 'Generate images from a text prompt. Saves PNG to the run\'s scratch.',
    category: 'creative',
    what: [
      'Generates a 1024x1024 image from a text prompt.',
      'Saves the PNG to scratch with a returned path.',
      'Use for moodboards, hero images, social art, and quick visual concepts.',
    ],
    apiSpec: `{
  "name": "image_gen",
  "input_schema": {
    "properties": {
      "prompt": { "type": "string" },
      "aspect_ratio": { "type": "string", "default": "1:1" },
      "negative_prompt": { "type": "string" }
    },
    "required": ["prompt"]
  }
}`,
    security: 'Runs against an account-scoped image model. Inputs and outputs JSONL-logged. No human faces by policy on the default model.',
    usedBy: ['designer'],
    gotchas: [
      'First call in a run is slow (cold start); subsequent calls are fast.',
      'Aspect ratios beyond 16:9 / 9:16 cost more credits.',
    ],
    keywords: ['ai image generation', 'agent image tool', 'text to image agent'],
  },
  {
    slug: 'voice-tts',
    name: 'voice_tts',
    tagline: 'Convert text to speech. Saves MP3 to scratch.',
    category: 'creative',
    what: [
      'Converts text to speech via ElevenLabs.',
      'Saves the MP3 to scratch with a returned path.',
      'Use for podcast clips, voicemail drops, and demo voiceovers.',
    ],
    apiSpec: `{
  "name": "voice_tts",
  "input_schema": {
    "properties": {
      "text": { "type": "string" },
      "voice_id": { "type": "string", "default": "default" },
      "model": { "type": "string", "default": "eleven_turbo_v2" }
    },
    "required": ["text"]
  }
}`,
    security: 'Goes through your ElevenLabs key (BYOK) or hosted account. Audit log captures text length and voice ID, not the text.',
    usedBy: ['designer', 'outreach'],
    gotchas: [
      'Long inputs (>5000 chars) get chunked and concatenated.',
      'Voice cloning requires user consent verification.',
    ],
    keywords: ['ai text to speech', 'elevenlabs agent', 'voiceover ai'],
  },
  {
    slug: 'postgres',
    name: 'postgres',
    tagline: 'Run read-only SQL against your Postgres. Returns rows + schema.',
    category: 'data',
    what: [
      'Runs read-only SQL against the Postgres URI you configure.',
      'Returns rows, column metadata, and execution time.',
      'Schema introspection is automatic; you do not have to describe tables.',
    ],
    apiSpec: `{
  "name": "postgres",
  "input_schema": {
    "properties": {
      "query": { "type": "string" },
      "params": { "type": "array" },
      "max_rows": { "type": "integer", "default": 1000 }
    },
    "required": ["query"]
  }
}`,
    security: 'Read-only by default — INSERT/UPDATE/DELETE rejected unless you opt in. Connections via your URI; we never store credentials in plaintext.',
    usedBy: ['analyst', 'ops'],
    gotchas: [
      'EXPLAIN before queries on tables >100M rows; missing indexes will time out.',
      '1000-row default cap; pass max_rows for larger pulls (cost increases).',
    ],
    keywords: ['ai postgres tool', 'agent sql', 'database ai agent'],
  },
  {
    slug: 'stripe',
    name: 'stripe',
    tagline: 'Read Stripe balances, subscriptions, customers. Idempotent writes opt-in.',
    category: 'data',
    what: [
      'Reads Stripe balances, charges, customers, and subscriptions.',
      'Writes (create-customer, create-subscription) require explicit opt-in flag.',
      'Use for billing dashboards, MRR analysis, and dunning workflows.',
    ],
    apiSpec: `{
  "name": "stripe",
  "input_schema": {
    "properties": {
      "operation": { "enum": ["read_balance", "list_customers", "list_subscriptions", "list_charges", "create_customer"] },
      "params": { "type": "object" }
    },
    "required": ["operation"]
  }
}`,
    security: 'Uses your Stripe key (sk_live or sk_test). Writes require allow_write=true at runtime. Audit log captures operation + params, not API key.',
    usedBy: ['analyst', 'ops'],
    gotchas: [
      'Test vs live mode is determined by your key prefix; check before you broadcast.',
      'Pagination is cursor-based; the agent handles it but watch the rate limit.',
    ],
    keywords: ['ai stripe agent', 'billing ai automation', 'mrr analysis ai'],
  },
  {
    slug: 'delegate',
    name: 'delegate',
    tagline: 'Hand off a sub-task to another agent. The supervisor\'s primary tool.',
    category: 'flow',
    what: [
      'Dispatches a sub-task to another agent in the same run.',
      'Returns the sub-agent\'s final output back to the caller.',
      'Powers the broadcast pattern: supervisor decomposes, dispatches, synthesizes.',
    ],
    apiSpec: `{
  "name": "delegate",
  "input_schema": {
    "properties": {
      "agent": { "type": "string", "enum": ["researcher", "planner", "outreach", "designer", "analyst", "coder", "ops", "browser"] },
      "goal": { "type": "string" },
      "context": { "type": "string" }
    },
    "required": ["agent", "goal"]
  }
}`,
    security: 'Same sandbox as the calling agent. Sub-agent inherits the run\'s tool allowlist and JSONL log.',
    usedBy: ['supervisor', 'planner'],
    gotchas: [
      'No infinite recursion; max-depth is 3 by default.',
      'Sub-agent runs are billed separately; broadcast cost is the sum of all sub-agents.',
    ],
    keywords: ['multi-agent delegate', 'agent orchestration tool', 'broadcast pattern'],
  },
];

export function getToolProfile(slug: string): ToolProfile | null {
  return TOOL_PROFILES.find((t) => t.slug === slug) ?? null;
}

// Marketing-surface agent profile data. Renders at /agents and
// /agents/<slug>. Distinct from lib/agents.ts (which powers the /app
// runtime). Mined from the v12 static build's /agents/*.html.

export interface AgentMetric {
  label: string;
  value: string;
  sub: string;
}

export interface AgentExample {
  prompt: string;
  output: string;
}

export interface AgentFaq {
  q: string;
  a: string;
}

export interface AgentProfile {
  slug: string;
  name: string;
  tagline: string;
  lead: string;
  capabilities: string[];
  primaryTools: string[];
  secondaryTools: string[];
  examples: AgentExample[];
  promptTemplate: string;
  metrics: AgentMetric[];
  relatedRecipes: string[];
  compareWith: string[];
  faq: AgentFaq[];
  keywords: string[];
}

export const AGENT_PROFILES: AgentProfile[] = [
  {
    slug: 'researcher',
    name: 'researcher',
    tagline: 'Web search, synthesize, brief.',
    lead: 'Decomposes a topic, runs targeted Tavily searches, fetches pages with http_get when snippets are too thin, and ships a sourced markdown brief in under 8 minutes.',
    capabilities: [
      'Decomposes a fuzzy topic into 2 to 4 sub-questions before searching.',
      'Runs targeted web searches with tight queries.',
      'Fetches specific pages with http_get when snippets are thin.',
      'Cites every non-trivial claim with a source URL, no exceptions.',
      'Saves the final brief as brief.md and signals done.',
    ],
    primaryTools: ['search_web', 'http_get'],
    secondaryTools: ['memory_put', 'file_save', 'done'],
    examples: [
      { prompt: 'Brief me on agentic ops in regulated industries.', output: '5-bullet TLDR plus a sources block with 5 to 7 cited URLs covering vendors, compliance posture, and 2 open gaps.' },
      { prompt: 'What did our top three competitors ship in the last 30 days?', output: 'Searches changelogs, blogs, and X for each name. Returns a markdown table with shipped, hinted, silent.' },
      { prompt: 'Pull the public pricing tiers for the top 7 AI customer support tools.', output: 'Visits each pricing page via http_get, normalizes to per-seat or per-resolution, flags opaque ones.' },
    ],
    promptTemplate: `Research the [topic] for a [audience: founder, ops lead, investor].\n\nCover:\n1. Five most relevant entrants in 2026, with one-line positioning each.\n2. Public pricing if available, or note as opaque.\n3. Two credible weaknesses per entrant, with source URLs.\n4. The single biggest gap a new entrant could exploit.\n\nCite every non-trivial claim. Save as brief.md and call done.`,
    metrics: [
      { label: 'Average run time', value: '5m 30s', sub: '2 to 4 sub-questions' },
      { label: 'Average cost (BYOK)', value: '$0.12', sub: 'Sonnet 4.7, your key' },
      { label: 'Tokens', value: '~28k', sub: 'Input + output' },
    ],
    relatedRecipes: ['market-research', 'customer-deep-dive', 'launch-day'],
    compareWith: ['analyst', 'browser'],
    faq: [
      { q: 'What does the researcher agent do?', a: 'It decomposes a topic into sub-questions, runs targeted searches, fetches pages when snippets are not enough, and writes a markdown brief with sources. Treat the output as a junior analyst draft you verify before quoting.' },
      { q: 'Does the researcher agent invent figures?', a: 'No. Its system prompt requires a citation for every non-trivial claim. If a number is not in a source, it gets flagged as a gap rather than fabricated. You see every search query and fetch live in the pane.' },
      { q: 'How long does a researcher run take?', a: 'Most briefs finish in 4 to 8 minutes depending on how many sub-questions you scope. The default cap is 6 fetches plus the search calls it needs.' },
    ],
    keywords: ['ai researcher agent', 'autonomous research', 'web search agent', 'sourced briefs'],
  },
  {
    slug: 'planner',
    name: 'planner',
    tagline: 'Break work into phases the team can ship.',
    lead: 'Takes a goal and decomposes it into a sequenced plan with owners, deliverables, and a critical path. Saves to plan.md and hands off to the rest of the team.',
    capabilities: [
      'Turns a one-line goal into a 5 to 9 phase plan with sequencing.',
      'Identifies the critical path and flags blockers up front.',
      'Assigns each phase to the right brocco specialist.',
      'Estimates effort per phase in human-time and agent-time.',
      'Writes the plan as markdown, ready to drop in Notion or Linear.',
    ],
    primaryTools: ['memory_put', 'file_save'],
    secondaryTools: ['delegate', 'done'],
    examples: [
      { prompt: 'Plan a launch for our new pricing tier.', output: '7 phases (positioning, copy, pricing-page-update, in-product gates, comms, paid promo, post-launch review) with owners and deliverables.' },
      { prompt: 'I want to ship a customer onboarding email sequence.', output: '5 phases: audience map, drip skeleton, copy, deliverability check, send + measure. Hands off audience map to researcher.' },
      { prompt: 'Plan a one-week sales push to 200 cold leads.', output: '4-phase plan with researcher (enrichment), outreach (sequencing), ops (CRM hygiene), analyst (response analysis).' },
    ],
    promptTemplate: `Plan: [goal]\n\nConstraints:\n- Audience: [who]\n- Deadline: [when]\n- Resources available: [what]\n\nOutput: a phased plan in markdown with owner per phase, deliverable, and rough effort. Flag the critical path. Save as plan.md.`,
    metrics: [
      { label: 'Average run time', value: '2m 10s', sub: '5 to 9 phases' },
      { label: 'Average cost (BYOK)', value: '$0.04', sub: 'Sonnet 4.7' },
      { label: 'Tokens', value: '~12k', sub: 'Input + output' },
    ],
    relatedRecipes: ['launch-day', 'content-sprint', 'cold-outreach-batch'],
    compareWith: ['supervisor', 'ops'],
    faq: [
      { q: 'How is planner different from supervisor?', a: 'Planner shapes the plan up front. Supervisor coordinates the live broadcast and synthesizes results. Use planner first to scope the work, then run supervisor to execute.' },
      { q: 'Can planner trigger other agents?', a: 'Yes, when paired with delegate. By default planner just writes the plan and stops; with delegate it can hand off the first phase to the right specialist.' },
    ],
    keywords: ['ai planning agent', 'project decomposition', 'multi-agent orchestration'],
  },
  {
    slug: 'outreach',
    name: 'outreach',
    tagline: 'Cold email and DM that does not sound like AI.',
    lead: 'Drafts personalized first touches and follow-ups grounded in researcher output. One-message sends, sequences, and reply triage in one pane.',
    capabilities: [
      'Drafts cold email personalized from researcher dossiers.',
      'Generates LinkedIn DMs sized for the platform (under 300 chars).',
      'Builds 3-touch sequences with delay schedule and variant copy.',
      'Triages replies into hot, warm, dead with suggested next-action.',
      'Never uses em-dashes, "delve", "leverage", or other AI tells.',
    ],
    primaryTools: ['memory_get', 'file_save'],
    secondaryTools: ['search_web', 'http_get', 'done'],
    examples: [
      { prompt: 'Cold email Sarah Chen at Acme about our agentic ops tool.', output: 'Researcher pulls Sarah\'s recent posts. Outreach drafts a 4-line email referencing one specific post, no fluff.' },
      { prompt: 'Build a 3-touch sequence for 50 marketing leads.', output: '3-email sequence with 3-day, 5-day delays. Each variant grounded in lead\'s industry. Sends through your provider via http_post.' },
      { prompt: 'Triage 87 replies in the launch campaign.', output: 'Sorted output: 12 hot, 23 warm, 52 dead. Each row tagged with reasoning and source-line.' },
    ],
    promptTemplate: `Cold email [contact name] at [company].\n\nContext:\n- I am [your role] at [your company].\n- I do [your offer in one line].\n- The reason this person specifically: [hook from research].\n\nVoice: builder, direct, no AI vocabulary, no em-dashes. Maximum 5 sentences. End with a yes-or-no ask.`,
    metrics: [
      { label: 'Average run time', value: '1m 45s', sub: 'Per draft' },
      { label: 'Average cost (BYOK)', value: '$0.02', sub: 'Sonnet 4.7' },
      { label: 'Tokens', value: '~6k', sub: 'Input + output' },
    ],
    relatedRecipes: ['cold-outreach-batch', 'customer-deep-dive', 'candidate-screener'],
    compareWith: ['researcher', 'supervisor'],
    faq: [
      { q: 'Will this just sound like every other AI cold email?', a: 'No. Outreach\'s system prompt explicitly bans the AI-vocabulary tells (delve, leverage, em-dashes, "I hope this finds you well"). It writes the way builders text each other.' },
      { q: 'Can it actually send the emails?', a: 'Yes when paired with http_post and your provider\'s API key. Default behavior is draft-only so you review before send.' },
    ],
    keywords: ['cold email ai', 'outreach automation', 'sales agent', 'no ai vocabulary'],
  },
  {
    slug: 'designer',
    name: 'designer',
    tagline: 'Wireframes, copy, and visual direction in one pass.',
    lead: 'Designs landing pages, in-product flows, and email layouts. Generates HTML wireframes plus visual mood-board direction. Pairs with coder to ship working pages.',
    capabilities: [
      'Wireframes web pages with section sequence and copy in one pass.',
      'Generates moodboard direction (palette, type, reference sites).',
      'Renders quick HTML mockups with placeholder content.',
      'Critiques existing pages with specific change recommendations.',
      'Hands off to coder for production-ready React or HTML.',
    ],
    primaryTools: ['file_save', 'image_gen'],
    secondaryTools: ['search_web', 'http_get', 'delegate', 'done'],
    examples: [
      { prompt: 'Wireframe a landing page for a parallel-AI dashboard.', output: '8-section wireframe with placeholder copy and 3 visual references.' },
      { prompt: 'Critique our pricing page.', output: '12 specific changes ranked by expected lift, with one-paragraph rationale each.' },
      { prompt: 'Design 3 visual directions for our launch.', output: '3 moodboards: editorial-magazine, terminal-developer, glass-modern. Each with palette, type stack, 5 references.' },
    ],
    promptTemplate: `Design [surface: landing, pricing, onboarding email] for [product] aimed at [audience].\n\nConstraints:\n- Voice: [direct / playful / authoritative].\n- Brand colors: [hex list].\n- Reference sites I like: [3 URLs].\n\nOutput: section sequence, placeholder copy, 3 visual references. Save as wireframe.md.`,
    metrics: [
      { label: 'Average run time', value: '3m 20s', sub: 'Per surface' },
      { label: 'Average cost (BYOK)', value: '$0.08', sub: 'Sonnet 4.7' },
      { label: 'Tokens', value: '~18k', sub: 'Input + output' },
    ],
    relatedRecipes: ['launch-day', 'content-sprint', 'market-research'],
    compareWith: ['coder', 'analyst'],
    faq: [
      { q: 'Does designer produce real pixels or just copy?', a: 'Both. The default deliverable is a wireframe in markdown plus 3 visual references. Add image_gen to the tool list and it will render moodboard images in-line.' },
      { q: 'How does designer hand off to coder?', a: 'Via delegate. Designer writes wireframe.md and calls delegate with target=coder and context=wireframe.md. Coder picks it up and writes the page.' },
    ],
    keywords: ['ai designer agent', 'wireframe generator', 'landing page ai'],
  },
  {
    slug: 'analyst',
    name: 'analyst',
    tagline: 'Numbers, patterns, conclusions you can defend.',
    lead: 'Pulls data from postgres, csv, or scraped pages. Computes metrics, finds anomalies, and writes a memo with charts. Refuses to invent numbers.',
    capabilities: [
      'Reads csv, postgres, or http endpoints. No mocked data, ever.',
      'Computes summary stats, time-series, and cohort breakdowns.',
      'Flags anomalies with z-score and recent-window comparison.',
      'Generates inline ASCII or markdown tables for the brief.',
      'Refuses to write a number that does not appear in a source.',
    ],
    primaryTools: ['postgres', 'file_read'],
    secondaryTools: ['http_get', 'memory_put', 'file_save', 'done'],
    examples: [
      { prompt: 'Why did our weekly active users drop 14% last week?', output: 'Pulls events table, segments by feature, finds 22% drop concentrated in one cohort. Writes memo with 3 candidate causes ranked.' },
      { prompt: 'Show me the cohort retention curve for users who tried /app last month.', output: 'D1, D7, D30 retention table by signup-week, plus median session length per cohort.' },
      { prompt: 'Build a top-10 referrer report for last month.', output: 'Joins traffic + signup events, computes conversion rate per referrer, ranks by signups, flags sub-1% ones.' },
    ],
    promptTemplate: `Question: [your business question].\n\nData sources:\n- Postgres: [conn string or schema hint].\n- CSVs: [paths].\n- Endpoints: [URLs].\n\nConstraints: every claim must trace to a number in a source. Save the memo as analysis.md with inline tables.`,
    metrics: [
      { label: 'Average run time', value: '4m 10s', sub: 'Mid-complexity' },
      { label: 'Average cost (BYOK)', value: '$0.10', sub: 'Sonnet 4.7' },
      { label: 'Tokens', value: '~24k', sub: 'Input + output' },
    ],
    relatedRecipes: ['weekly-competitor-monitor', 'customer-support-triage', 'expense-categorizer'],
    compareWith: ['researcher', 'ops'],
    faq: [
      { q: 'What stops the analyst from inventing a number?', a: 'Two things. The system prompt explicitly refuses to write a number that does not appear in a source. And every quoted figure includes a source-line so you can verify.' },
      { q: 'Does it run on production data?', a: 'It runs against whatever postgres URI you give it. Read-only by default. For production data, point it at a read-replica.' },
    ],
    keywords: ['ai analyst agent', 'data analysis ai', 'postgres ai agent'],
  },
  {
    slug: 'coder',
    name: 'coder',
    tagline: 'Writes, runs, and tests code in a sandbox.',
    lead: 'Implements features, fixes bugs, writes tests. Reads existing code, plans the change, applies it, and runs the test suite to verify.',
    capabilities: [
      'Reads multiple files to understand context before editing.',
      'Writes minimal-diff changes; refuses to mass-rewrite unrelated code.',
      'Runs the test suite or executes the code to verify.',
      'Returns a diff plus a one-paragraph rationale per change.',
      'Refuses to leave code half-finished or with TODOs.',
    ],
    primaryTools: ['file_read', 'file_write', 'shell_exec'],
    secondaryTools: ['http_get', 'memory_put', 'done'],
    examples: [
      { prompt: 'Fix the rate-limit bug in /api/checkout.', output: 'Reads checkout.ts, identifies missing await, applies 3-line fix, runs the test suite, returns diff.' },
      { prompt: 'Add a /healthcheck endpoint to the api.', output: 'Adds endpoint, writes test for 200 response, runs suite, returns diff.' },
      { prompt: 'Migrate the user table to add a `created_via` column.', output: 'Writes migration file, applies in dev, updates the model, runs ORM tests, returns the migration + diff.' },
    ],
    promptTemplate: `Task: [bug or feature description].\n\nFiles I think are relevant: [paths or globs].\n\nConstraints:\n- Minimal diff. Do not refactor unrelated code.\n- Run the existing test suite after.\n- Return diff + one-paragraph rationale per change.`,
    metrics: [
      { label: 'Average run time', value: '6m 50s', sub: 'Mid-size change' },
      { label: 'Average cost (BYOK)', value: '$0.18', sub: 'Sonnet 4.7' },
      { label: 'Tokens', value: '~42k', sub: 'Input + output' },
    ],
    relatedRecipes: ['scrape-and-summarize', 'launch-day'],
    compareWith: ['ops', 'designer'],
    faq: [
      { q: 'Will it touch files I did not ask about?', a: 'Only if a referenced file pulls in others through imports. The system prompt explicitly bans drive-by refactors of unrelated code.' },
      { q: 'What language does it know?', a: 'Python, TypeScript, Go, Rust, SQL, shell. It reads the project to detect the stack and adapts.' },
    ],
    keywords: ['coding ai agent', 'autonomous coder', 'ai pair programming'],
  },
  {
    slug: 'ops',
    name: 'ops',
    tagline: 'CRM hygiene, scheduling, ticket triage.',
    lead: 'Keeps systems clean. Dedupes records, normalizes fields, schedules reminders, triages tickets. The agent that does the work nobody wants to do.',
    capabilities: [
      'Dedupes records across CRM, mailing list, contact databases.',
      'Normalizes phone, address, and email field formats.',
      'Schedules reminders and follow-ups in the team calendar.',
      'Triages support tickets by intent, priority, and language.',
      'Generates weekly hygiene reports flagging records that drifted.',
    ],
    primaryTools: ['postgres', 'http_post'],
    secondaryTools: ['file_read', 'memory_put', 'done'],
    examples: [
      { prompt: 'Dedupe the leads table and merge duplicate records.', output: 'Finds 87 duplicate clusters, writes merge SQL, runs in a transaction, returns audit log.' },
      { prompt: 'Triage 200 unresolved tickets and assign priority.', output: '12 P0, 34 P1, 87 P2, 67 P3. Each with reason and proposed assignee.' },
      { prompt: 'Schedule onboarding follow-ups for 50 new signups.', output: 'Creates 50 calendar events at D+1, D+7, D+30 per signup. Skips weekends.' },
    ],
    promptTemplate: `Operation: [dedupe / triage / normalize / schedule].\n\nSource: [postgres conn / csv path / api endpoint].\n\nConstraints:\n- Read-only first pass; show me the proposed changes before mutating.\n- Audit log every change.\n- Skip records older than [date] OR matching [filter].`,
    metrics: [
      { label: 'Average run time', value: '3m 15s', sub: 'Per batch' },
      { label: 'Average cost (BYOK)', value: '$0.07', sub: 'Sonnet 4.7' },
      { label: 'Tokens', value: '~16k', sub: 'Input + output' },
    ],
    relatedRecipes: ['customer-support-triage', 'expense-categorizer', 'cold-outreach-batch'],
    compareWith: ['analyst', 'coder'],
    faq: [
      { q: 'What stops it from corrupting records?', a: 'Two-stage default: read-only first pass shows proposed changes. You confirm before it mutates. Every change writes an audit row so you can roll back.' },
      { q: 'Can it write to my CRM?', a: 'Through http_post against your CRM\'s API. Salesforce, HubSpot, Pipedrive, Attio all supported via REST.' },
    ],
    keywords: ['ai ops agent', 'crm cleanup', 'ticket triage automation'],
  },
  {
    slug: 'supervisor',
    name: 'supervisor',
    tagline: 'Coordinates a parallel broadcast and synthesizes the result.',
    lead: 'Runs the broadcast pattern. Receives one prompt, dispatches sub-tasks to specialists in parallel, watches the JSONL streams, and writes the unified summary.',
    capabilities: [
      'Decomposes a prompt into parallel sub-tasks across specialists.',
      'Dispatches each sub-task to the right agent via delegate.',
      'Watches every pane\'s JSONL stream live, no polling.',
      'Synthesizes contradictions across panes into a single brief.',
      'Reports per-agent cost and time alongside the synthesis.',
    ],
    primaryTools: ['delegate', 'memory_put'],
    secondaryTools: ['file_save', 'done'],
    examples: [
      { prompt: 'Launch sprint for our pricing tier.', output: 'Dispatches researcher, planner, designer, outreach, analyst. Returns unified brief in 12 minutes.' },
      { prompt: 'Customer deep dive on Acme Corp.', output: 'Dispatches researcher (profile), outreach (touches), analyst (sizing). Returns brief + ready-to-send touches.' },
      { prompt: 'Content sprint: 5 angles on multi-agent dashboards.', output: 'Dispatches 5 writer instances with different angles. Returns 5 drafts ranked by predicted engagement.' },
    ],
    promptTemplate: `Goal: [one sentence].\n\nSpecialists to broadcast to: [comma list, or "auto"].\n\nConstraints:\n- Time budget: [minutes].\n- Cost cap: [dollars].\n- Tone: [your voice].\n\nOutput: unified brief with per-agent attribution and cost report.`,
    metrics: [
      { label: 'Average run time', value: '8m 30s', sub: '5 specialists in parallel' },
      { label: 'Average cost (BYOK)', value: '$0.45', sub: 'All specialists combined' },
      { label: 'Tokens', value: '~110k', sub: 'Input + output' },
    ],
    relatedRecipes: ['launch-day', 'customer-deep-dive', 'content-sprint'],
    compareWith: ['planner', 'browser'],
    faq: [
      { q: 'How is supervisor different from planner?', a: 'Planner shapes the plan. Supervisor runs it in parallel. Use planner first; pass the plan to supervisor to execute.' },
      { q: 'What if two agents disagree?', a: 'Supervisor surfaces contradictions explicitly in the synthesis. It does not silently pick a winner.' },
    ],
    keywords: ['multi-agent supervisor', 'broadcast pattern', 'parallel ai agents'],
  },
  {
    slug: 'browser',
    name: 'browser',
    tagline: 'Drives a real browser to extract or interact.',
    lead: 'For pages that need JavaScript, login state, or human-shaped clicks. Reads dynamic dashboards, fills forms, captures screenshots, returns structured data.',
    capabilities: [
      'Launches a headless browser, navigates, waits for hydration.',
      'Reads JS-rendered pages that fetch fails to capture.',
      'Fills forms and clicks buttons with human-shaped pacing.',
      'Captures screenshots and full-page accessibility snapshots.',
      'Returns structured data extracted from dashboards or SaaS UIs.',
    ],
    primaryTools: ['shell_exec', 'http_get'],
    secondaryTools: ['file_save', 'image_gen', 'memory_put', 'done'],
    examples: [
      { prompt: 'Pull the live ARR figure from our Stripe dashboard.', output: 'Logs in, navigates, reads the rendered ARR widget, returns the number with timestamp.' },
      { prompt: 'Fill the contact form on competitor.com with this lead capture.', output: 'Fills 6 fields, submits, captures success screenshot, returns confirmation URL.' },
      { prompt: 'Audit our top 10 pages on mobile and desktop.', output: '20 screenshots (10 pages, 2 viewports). Highlights 3 layout breaks per page.' },
    ],
    promptTemplate: `Task: [navigate / extract / fill-form / audit].\n\nTarget URL: [url].\nLogin required: [yes/no, credentials in memory key].\nSuccess criterion: [how I know it worked].\n\nOutput: structured data + screenshots. Save as run.md.`,
    metrics: [
      { label: 'Average run time', value: '2m 45s', sub: 'Single page' },
      { label: 'Average cost (BYOK)', value: '$0.06', sub: 'Sonnet 4.7' },
      { label: 'Tokens', value: '~14k', sub: 'Input + output' },
    ],
    relatedRecipes: ['scrape-and-summarize', 'weekly-competitor-monitor', 'market-research'],
    compareWith: ['researcher', 'coder'],
    faq: [
      { q: 'Is this just headless Chromium?', a: 'Yes, with a thin layer that gives the model a stable accessibility-tree view of the page so it does not have to pixel-hunt.' },
      { q: 'Can it bypass captchas?', a: 'No. By design. If a page requires human verification, the agent stops and asks you to complete it.' },
    ],
    keywords: ['ai browser agent', 'web scraping ai', 'headless browser automation'],
  },
];

export function getAgentProfile(slug: string): AgentProfile | null {
  return AGENT_PROFILES.find((a) => a.slug === slug) ?? null;
}

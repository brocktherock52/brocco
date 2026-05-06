// Recipe pages — /recipes and /recipes/<slug>. Pre-built broadcast
// patterns. Mined from v12 build.

export interface RecipeProfile {
  slug: string;
  name: string;
  tagline: string;
  audience: string;
  whatYouGet: string[];
  agents: string[];
  prompt: string;
  expectedOutput: string;
  cost: { time: string; price: string };
  keywords: string[];
}

export const RECIPE_PROFILES: RecipeProfile[] = [
  {
    slug: 'market-research',
    name: 'Market research',
    tagline: 'Survey the field. Compare entrants. Spot the gap.',
    audience: 'Founders, product managers, growth leads.',
    whatYouGet: [
      'Top 5 to 10 entrants in the category with one-line positioning each.',
      'Public pricing crosswalk, normalized to per-seat or per-resolution.',
      '2 to 3 credible weaknesses per entrant with source URLs.',
      'A one-paragraph "the biggest gap" recommendation.',
    ],
    agents: ['researcher', 'analyst', 'planner'],
    prompt: `Survey the [category] market in 2026. Cover the top 5 to 10 entrants, their positioning, public pricing, and 2 to 3 credible weaknesses each. Identify the single biggest gap a new entrant could exploit. Cite every non-trivial claim. Save as market.md.`,
    expectedOutput: `12-page brief with TLDR, per-entrant cards, comparison table, gap analysis, and 30+ source URLs.`,
    cost: { time: '12 to 18 minutes', price: '$0.40 - $0.80 BYOK' },
    keywords: ['market research ai', 'competitor analysis', 'category survey'],
  },
  {
    slug: 'content-sprint',
    name: 'Content sprint',
    tagline: 'Five pieces of content on one topic, five different angles.',
    audience: 'Marketers, course creators, founders shipping inbound.',
    whatYouGet: [
      'One LinkedIn post (long-form, 800 words).',
      'One Twitter / X thread (12 to 18 tweets).',
      'One technical blog post (1500 to 1800 words).',
      'One contrarian take post (600 words).',
      'One short-form (Reel/Short) script (45 seconds).',
    ],
    agents: ['researcher', 'designer', 'outreach'],
    prompt: `Topic: [topic]. Audience: [audience]. Write 5 pieces of content from 5 angles: long-form LinkedIn, Twitter thread, technical blog post, contrarian take, short-form Reel script. Voice: builder, direct, no AI vocabulary, no em-dashes. Save each as separate md.`,
    expectedOutput: `5 markdown files plus 3 hero images for the long-form pieces.`,
    cost: { time: '15 to 22 minutes', price: '$0.50 - $0.90 BYOK' },
    keywords: ['content sprint ai', 'multi-angle content', 'content automation'],
  },
  {
    slug: 'customer-deep-dive',
    name: 'Customer deep dive',
    tagline: 'Research one named lead. Draft the perfect first touch.',
    audience: 'Sales, customer success, founders chasing big logos.',
    whatYouGet: [
      'Public dossier on the contact (recent posts, role, projects).',
      'Company-level context: priorities, recent funding, news.',
      'A 4-line cold email referencing one specific signal.',
      'A LinkedIn DM under 300 chars.',
      'A "why now" rationale you can paste into your CRM.',
    ],
    agents: ['researcher', 'outreach'],
    prompt: `Contact: [name] at [company]. My company: [your company] does [one-line offer]. Build a public dossier on the contact and the company. Draft a 4-line cold email that references one specific signal from the dossier. Add a LinkedIn DM under 300 chars. End with a 1-paragraph "why now."`,
    expectedOutput: `dossier.md (1 page), email.md, dm.md, rationale.md.`,
    cost: { time: '4 to 6 minutes', price: '$0.10 - $0.18 BYOK' },
    keywords: ['account research ai', 'cold email research', 'sales deep dive'],
  },
  {
    slug: 'launch-day',
    name: 'Launch day kit',
    tagline: 'Show HN, launch tweets, hero copy, in parallel.',
    audience: 'Founders shipping a product or feature.',
    whatYouGet: [
      'Show HN post (4 paragraphs, builder voice, no fluff).',
      '5 launch tweets / X threads with media suggestions.',
      'Homepage hero copy (3 variants).',
      'Producthunt description and gallery captions.',
      'A 1-paragraph "tone audit" flagging anything that reads AI-shaped.',
    ],
    agents: ['outreach', 'researcher', 'planner', 'designer'],
    prompt: `Today is launch day for [product]. Wedge: [one-line]. Audience: [who]. Draft Show HN post, 5 launch tweets, 3 homepage hero variants, Producthunt description and gallery captions. Voice: builder, direct, no AI vocabulary, no em-dashes.`,
    expectedOutput: `5 markdown files plus a tone-audit memo flagging AI tells.`,
    cost: { time: '8 to 12 minutes', price: '$0.30 - $0.55 BYOK' },
    keywords: ['launch kit ai', 'show hn template', 'product launch automation'],
  },
  {
    slug: 'candidate-screener',
    name: 'Candidate screener',
    tagline: '150 GitHub profiles → 30 booked interviews.',
    audience: 'Recruiters, founder hiring, hiring managers.',
    whatYouGet: [
      'Filtered candidate list (skills, recent commits, location).',
      'Per-candidate enrichment with LinkedIn match.',
      '150 personalized first touches.',
      'Reply triage scoring after the campaign.',
    ],
    agents: ['browser', 'researcher', 'outreach', 'ops'],
    prompt: `Find 150 candidates for [role] with [filters: stack, location, seniority]. Enrich each with LinkedIn match. Draft 150 personalized first touches referencing one specific commit or post per candidate. Voice: respectful, builder, no AI vocabulary.`,
    expectedOutput: `candidates.csv (150 rows) + 150 emails + reply-triage.md after the campaign.`,
    cost: { time: '20 to 30 minutes', price: '$0.80 - $1.40 BYOK' },
    keywords: ['ai recruiting', 'candidate sourcing automation', 'github recruiter'],
  },
  {
    slug: 'cold-outreach-batch',
    name: 'Cold outreach batch',
    tagline: '50 to 200 personalized first touches in one pass.',
    audience: 'Sales, founders, ops shipping cold campaigns.',
    whatYouGet: [
      'Researcher enriches each lead with public signal.',
      'Outreach drafts a personalized first touch per lead.',
      'Builds a 3-touch sequence with 3-day, 5-day delays.',
      'Hands off the batch to your sender (Lemlist, Instantly, etc).',
    ],
    agents: ['researcher', 'outreach'],
    prompt: `Send a 3-touch sequence to [N] [audience] leads. My company: [your company] does [one-line offer]. Personalize each first touch with one specific signal from research. Voice: builder, direct, no AI vocabulary, no em-dashes. Save sequences as csv ready for [your sender].`,
    expectedOutput: `sequences.csv with N rows × 3 touches per row.`,
    cost: { time: '12 to 25 minutes', price: '$0.40 - $1.20 BYOK' },
    keywords: ['cold email automation', 'outbound sequencing ai', 'personalized outreach'],
  },
  {
    slug: 'customer-support-triage',
    name: 'Customer support triage',
    tagline: '200 unresolved tickets sorted into P0/P1/P2/P3.',
    audience: 'Support leads, ops, customer success.',
    whatYouGet: [
      'Bucketed list: P0 (action now), P1 (this week), P2 (this month), P3 (backlog).',
      'Reasoning per ticket with proposed assignee.',
      'Reopen suggestions for prematurely closed tickets.',
      'Pattern memo flagging recurring issues that need product fix.',
    ],
    agents: ['ops', 'analyst'],
    prompt: `Triage [N] open tickets from [source: csv path / postgres / api]. Sort into P0/P1/P2/P3 with reasoning per ticket. Suggest assignee per priority. Flag recurring patterns that suggest a product issue.`,
    expectedOutput: `triage.csv + patterns.md.`,
    cost: { time: '5 to 10 minutes', price: '$0.20 - $0.40 BYOK' },
    keywords: ['support triage ai', 'ticket sorting automation', 'cs ai'],
  },
  {
    slug: 'expense-categorizer',
    name: 'Expense categorizer',
    tagline: 'Tag 500 transactions to the right ledger account.',
    audience: 'Founders, ops, finance.',
    whatYouGet: [
      'Categorized csv with 90%+ confidence per row.',
      'A "review" pile of low-confidence rows for human eyes.',
      'Vendor-normalization (Stripe, Stripe Inc, STRIPE → Stripe).',
      'Monthly summary by category with budget variance flag.',
    ],
    agents: ['ops', 'analyst'],
    prompt: `Categorize [path/to/transactions.csv] into [ledger account list]. Normalize vendor names. Flag low-confidence rows for review. Output categorized.csv + summary.md by month.`,
    expectedOutput: `categorized.csv + review.csv + summary.md.`,
    cost: { time: '6 to 12 minutes', price: '$0.20 - $0.45 BYOK' },
    keywords: ['expense categorization ai', 'finance ops automation', 'ledger ai'],
  },
  {
    slug: 'podcast-transcript-to-clips',
    name: 'Podcast transcript to clips',
    tagline: 'Turn one 60-min episode into 8 short-form clips.',
    audience: 'Podcasters, content marketers, course creators.',
    whatYouGet: [
      '8 to 12 short-form clip suggestions with timestamps and titles.',
      'Per-clip caption draft for Reels / Shorts / TikTok.',
      'Per-clip "hook score" (1 to 10) so you ship the strongest first.',
      'Show-notes outline with chapter timestamps.',
    ],
    agents: ['researcher', 'designer'],
    prompt: `Transcript: [paste]. Episode title: [title]. Find 8 to 12 highest-leverage 30-90 second clips. For each, write a Reel/Short caption and rate the hook strength (1-10). Output show-notes.md with chapter timestamps.`,
    expectedOutput: `clips.md with timestamps + show-notes.md.`,
    cost: { time: '6 to 10 minutes', price: '$0.20 - $0.45 BYOK' },
    keywords: ['podcast clip ai', 'short form repurposing', 'content atomization'],
  },
  {
    slug: 'scrape-and-summarize',
    name: 'Scrape and summarize',
    tagline: 'Pull data from a SaaS UI you do not have an API for.',
    audience: 'Ops, analysts, founders fighting SaaS UIs.',
    whatYouGet: [
      'Browser navigates the target with your saved login.',
      'Extracts the visible data into a structured csv or json.',
      'Captures screenshots at each navigation step for audit.',
      'Returns a clean markdown summary with the key numbers.',
    ],
    agents: ['browser', 'analyst'],
    prompt: `Target: [url]. Login: [yes; creds in memory key]. Extract: [what columns or fields]. Output as csv. Add a 1-paragraph summary of the highest-signal numbers.`,
    expectedOutput: `extract.csv + summary.md + screenshots/ (per-step audit).`,
    cost: { time: '4 to 9 minutes', price: '$0.15 - $0.35 BYOK' },
    keywords: ['saas scraper ai', 'browser agent', 'no-api extraction'],
  },
  {
    slug: 'weekly-competitor-monitor',
    name: 'Weekly competitor monitor',
    tagline: 'A standing brief on what your top 5 competitors shipped this week.',
    audience: 'Product managers, founders, competitive intel teams.',
    whatYouGet: [
      'Per-competitor section: shipped, hinted, silent.',
      'Pricing-page diff alert if any tier or price changed.',
      'Hiring signal (if they posted aggressive roles).',
      'A 1-paragraph "what changed in the category" synthesis.',
    ],
    agents: ['researcher', 'analyst', 'browser'],
    prompt: `Competitors: [list of 5]. For each, summarize what they shipped, hinted, or stayed silent on this week. Diff their pricing page vs last week. Flag aggressive hiring. Synthesize a 1-paragraph category-level take.`,
    expectedOutput: `weekly-brief.md (one section per competitor + synthesis).`,
    cost: { time: '15 to 22 minutes', price: '$0.55 - $0.95 BYOK' },
    keywords: ['competitive monitoring ai', 'weekly competitor brief', 'product intelligence ai'],
  },
];

export function getRecipeProfile(slug: string): RecipeProfile | null {
  return RECIPE_PROFILES.find((r) => r.slug === slug) ?? null;
}

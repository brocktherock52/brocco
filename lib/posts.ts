// Blog post seeds, high-intent SEO targets. These render as full pages
// today; long-form copy gets filled in iteratively. Each entry is a
// real, indexable URL with H1 + meta description + outline.

export interface PostSeed {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  keywords: string[];
  outline: { h2: string; bullets: string[] }[];
  intro: string;
  // Full long-form body. When present, the post renders real prose (each
  // section = an h2 + paragraphs + optional bullets + an optional internal
  // link CTA) instead of the outline skeleton. Added 2026-06-02 so blog posts
  // are real, indexable, ranking content rather than "copy in progress" stubs.
  body?: PostSection[];
  // Internal link target for the post's CTA (e.g. '/real-estate', '/begin').
  cta?: { label: string; href: string; note?: string };
}

export interface PostSection {
  h2: string;
  paragraphs: string[];
  bullets?: string[];
}

export const POSTS: PostSeed[] = [
  {
    slug: 'ai-for-wholesaling-real-estate',
    title: 'AI for wholesaling real estate: why one AI team beats five separate tools',
    description:
      'Most wholesalers stitch together a list tool, a skip tracer, a comps tool, a dialer, and a contract app. Here is why a single AI team that does all five in one run is the 2026 unlock.',
    date: '2026-06-02',
    readingMinutes: 7,
    keywords: ['ai for real estate wholesaling', 'ai wholesaling', 'wholesaling software', 'ai real estate tools', 'wholesale automation'],
    intro:
      'The average wholesaler pays for five or six tools that do not talk to each other: one to pull lists, one to skip trace, one for comps, one to dial, one to store contracts. Every deal is a relay race between tabs. AI collapses that relay into a single handoff.',
    cta: {
      label: 'Start 7-day trial',
      href: '/begin',
      note: '7-day dashboard preview. Card required. Live tools require a paid subscription.',
    },
    body: [
      {
        h2: 'The tab tax is the real cost',
        paragraphs: [
          'Add up your wholesaling stack and the subscriptions are only half the bill. The other half is the tab tax: the hours you spend exporting a list from one tool, cleaning it, uploading it to the skip tracer, downloading that, pasting addresses into the comps tool, then retyping the numbers into a contract. Nothing is hard. It is just death by a thousand exports.',
          'That glue work is exactly what an AI team removes. You describe the job once, and the agents pass the data between themselves instead of making you the integration layer.',
        ],
      },
      {
        h2: 'What "one AI team" actually does in a single run',
        paragraphs: [
          'Instead of five tools you operate in sequence, you get specialists that work in parallel from one prompt and converge on a finished deliverable.',
        ],
        bullets: [
          'Pulls and scores motivated-seller leads for your county and price band.',
          'Skip traces the owners and structures the contact sheet.',
          'Runs comps, an ARV range, and your maximum allowable offer.',
          'Drafts the seller outreach and the follow-up cadence.',
          'Drafts the assignable contract and builds a matched cash-buyer list.',
        ],
      },
      {
        h2: 'Why breadth beats best-of-breed here',
        paragraphs: [
          'The usual objection is that a dedicated tool does each step better. Sometimes true. But wholesaling is a volume game, and the bottleneck is almost never the quality of one step, it is the friction between steps and the leads that die waiting in that friction. A team that does every step at 90% with zero handoff cost beats five tools at 100% that you have to personally carry the baton between.',
          'It also changes your economics. With bring-your-own-key pricing you pay model cost directly, so running the full pipeline on a fresh list costs pennies instead of stacking five subscriptions and per-record fees.',
        ],
      },
      {
        h2: 'Where you stay in the loop',
        paragraphs: [
          'AI doing the work does not mean AI making the calls. You approve the list, you make the offer, you talk to the seller. The team handles the unglamorous research, writing, and paperwork that was eating your week. The judgment stays yours; the busywork goes away.',
        ],
      },
    ],
    outline: [
      { h2: 'The tab tax', bullets: ['five tools', 'no integration', 'leads die in the friction'] },
      { h2: 'One run', bullets: ['pull', 'skip', 'comps', 'outreach', 'contract', 'buyers'] },
    ],
  },
  {
    slug: 'how-to-find-cash-buyers-for-wholesaling',
    title: 'How to find cash buyers for your wholesale deal (build a buyers list before you lock the contract)',
    description:
      'The fastest way to blow a wholesale deal is to lock it with no buyer. Here is how to build a real cash-buyer list and write the dispo blast, fast, with AI.',
    date: '2026-06-01',
    readingMinutes: 7,
    keywords: ['how to find cash buyers for wholesaling', 'cash buyers list', 'wholesale dispo', 'sell wholesale contract', 'cash buyer finder'],
    intro:
      'New wholesalers obsess over finding deals and panic about dispo. Veterans flip it: they build the buyers list first, so the moment a deal is under contract the phone calls write themselves. Here is how to build that list without a year of networking.',
    cta: {
      label: 'Start 7-day trial',
      href: '/begin',
      note: '7-day dashboard preview. Card required. Live tools require a paid subscription.',
    },
    body: [
      {
        h2: 'Build the list before you need it',
        paragraphs: [
          'The biggest dispo mistake is sequencing: people lock a contract, then start hunting for buyers with the clock running. By then you are negotiating from weakness. Build a standing cash-buyer list for your market first, keep it warm, and a new deal becomes a few targeted messages instead of a cold scramble.',
        ],
      },
      {
        h2: 'Where the cash buyers actually are',
        paragraphs: [
          'You do not need to know them personally. Cash buyers leave a paper trail you can pull: recent cash purchases, repeat LLC buyers, and absentee owners who keep acquiring in your zip codes are all in public records and listing data.',
        ],
        bullets: [
          'Recent cash / non-financed purchases in your target area (the clearest signal).',
          'LLCs that have bought more than once in the last 12-24 months.',
          'Landlords and flippers already active in your zip codes.',
          'Buyers matching a specific buy box: asset type, price band, condition.',
        ],
      },
      {
        h2: 'Match buyers to the specific deal',
        paragraphs: [
          'A generic blast to 5,000 names converts worse than a tight list of 12 buyers whose buy box matches the exact property. The win is matching: for this property, in this neighborhood, at this price and condition, who has bought something like it before. That shortlist is who you call first.',
          'This is the part AI is good at: cross-referencing the deal against buyer history and handing you a ranked shortlist plus channel-ready copy, instead of you eyeballing spreadsheets.',
        ],
      },
      {
        h2: 'Write the dispo blast that moves it',
        paragraphs: [
          'Once you have the deal one-sheet (numbers, terms, photos) and the matched list, the blast is a fill-in-the-blanks job: a tight summary, the spread, and a clear first-come next step, sent to your groups, email list, and SMS. Speed matters more than polish; the goal is to lock a buyer before the contract gets cold.',
        ],
      },
    ],
    outline: [
      { h2: 'List first', bullets: ['build before you lock', 'negotiate from strength'] },
      { h2: 'Find + match + blast', bullets: ['cash purchases', 'repeat LLCs', 'match the buy box', 'send fast'] },
    ],
  },
  {
    slug: 'how-to-find-motivated-seller-leads-with-ai',
    title: 'How to find motivated seller leads with AI (2026 playbook)',
    description:
      'A step-by-step playbook for pulling, scoring, and contacting motivated-seller leads with AI, so you stop buying stale lists and chasing dead numbers.',
    date: '2026-06-02',
    readingMinutes: 8,
    keywords: [
      'motivated seller leads',
      'motivated seller leads ai',
      'how to find motivated seller leads',
      'real estate wholesaling leads',
      'distressed property leads',
    ],
    intro:
      'Every wholesaler hits the same wall: the deal is in the data, but pulling it, cleaning it, skip tracing it, and actually contacting people eats the whole week. Here is how to hand that entire pipeline to an AI team and wake up to a ranked call list instead of a to-do list.',
    cta: {
      label: 'Start 7-day trial',
      href: '/begin',
      note: '7-day dashboard preview. Card required. Live tools require a paid subscription.',
    },
    body: [
      {
        h2: 'What "motivated seller" actually means in the data',
        paragraphs: [
          'A motivated seller is just an owner whose situation makes selling at a discount rational: they are behind on taxes, the property is vacant, they inherited it and live three states away, they are mid-foreclosure, or they have owned free-and-clear for 20 years and are tired. None of that is hidden. It is sitting in public records, county tax rolls, and listing data. The problem was never access. The problem is that stitching those signals together by hand, per county, every week, is a full-time job.',
          'That is exactly the kind of repetitive, multi-source data work AI agents are good at. You describe the buy box once; the team pulls the records, cross-checks the signals, scores each lead by likely motivation, and hands back a clean list. You stay in the seat that matters: deciding who to call and making the offer.',
        ],
      },
      {
        h2: 'The five signals worth scoring',
        paragraphs: [
          'Not every lead is equal, and the fastest way to waste a week is to dial a list in random order. Score each property against the signals that actually predict a discount, then sort by the total. The highest scorers are your Monday morning.',
        ],
        bullets: [
          'Tax-delinquent: behind on property taxes is the single strongest distress signal.',
          'Absentee owner: the mailing address does not match the property address.',
          'Vacancy: USPS vacancy flags, long days-on-market, or utility/code cues.',
          'Equity: long ownership tenure or a low/paid-off mortgage means room to deal.',
          'Pre-foreclosure / code violations: a clock is ticking, which creates urgency.',
        ],
      },
      {
        h2: 'The AI workflow, end to end',
        paragraphs: [
          'Here is the pipeline brocco runs for a single prompt like "pull tax-delinquent and absentee leads in Wayne County under 150k and build me a ranked call list." Each step is a specialist agent, and they work in parallel, not one slow chat at a time.',
          'The output is not a transcript. It is a CSV you can drop straight into your dialer, plus a one-page "who to call first" summary. From there it is your voice and your offer.',
        ],
        bullets: [
          'Browser pulls the county records and listing sources for your area and price band.',
          'Researcher cross-checks each address against absentee-owner and distress data.',
          'Analyst scores and ranks every lead by likely motivation, and dedupes the list.',
          'Outreach drafts the first touch: a call opener, two SMS, a letter, and a voicemail.',
          'Ops sets a follow-up cadence so no lead goes cold from neglect.',
        ],
      },
      {
        h2: 'Why this beats buying a list',
        paragraphs: [
          'Bought lists are stale by the time they hit your inbox, shared with every other wholesaler in your market, and priced per record whether the lead is good or not. Worse, they hand you names with no prioritization, so you dial in the dark and burn through the good ones early without knowing it.',
          'Running your own pull means the data is fresh, scored to your buy box, and yours alone. With BYOK pricing the cost per pull is pennies, not hundreds of dollars, so you can run it weekly and let the freshest distress signals float to the top every time.',
        ],
      },
      {
        h2: 'Following up is where the money is',
        paragraphs: [
          'Most leads never convert on the first touch. The average deal takes several contacts, and the wholesalers who win are simply the ones who follow up when everyone else quit. The catch is that manual follow-up across hundreds of leads is exactly the task that falls off your plate first.',
          'This is the other half of the system: a follow-up engine that re-engages aged leads on a schedule, with a different angle per segment (no-answer, soft-no, price-gap, ghosted), so the leads you already paid for keep working without you remembering to touch them.',
        ],
      },
      {
        h2: 'Start with one county this week',
        paragraphs: [
          'You do not need a CRM migration or a VA team to start. Pick one county, define your price band and buy box in a sentence, and run a single pull. Read the top of the ranked list, make ten calls, and judge it on whether the conversations are better than your current list. That is the only metric that matters.',
        ],
      },
    ],
    outline: [
      { h2: 'What motivated seller means in the data', bullets: ['tax-delinquent', 'absentee', 'vacancy', 'equity', 'pre-foreclosure'] },
      { h2: 'The AI workflow', bullets: ['pull', 'skip trace', 'score', 'outreach', 'follow-up'] },
    ],
  },
  {
    slug: 'agentic-ai-dashboard',
    title: 'What an agentic AI dashboard actually looks like in 2026',
    description:
      'A walkthrough of multi-agent dashboards, tool registries, and audit logs. Real screenshots from production agents.',
    date: '2026-05-05',
    readingMinutes: 7,
    keywords: ['agentic AI dashboard', 'multi-agent dashboard', 'AI agents 2026'],
    intro:
      'The most common question we get is "why do I need a dashboard at all?" Here is the honest answer: you do not, until you run more than two agents in parallel and want to know what they did.',
    outline: [
      {
        h2: 'The single-pane fallacy',
        bullets: [
          'Cursor, Devin, and Claude Desktop all default to one pane',
          'Why one pane fails the second you broadcast a goal',
          'The shape of a real multi-agent dashboard',
        ],
      },
      {
        h2: 'What goes in the audit log',
        bullets: [
          'JSONL events: prompt, tool_call, tool_result, text, done',
          'Why CSV exports lose the structure',
          'How brocco renders the same JSONL into a live timeline',
        ],
      },
      {
        h2: 'Tool registries vs walled gardens',
        bullets: [
          'Zapier-style: pre-built integrations, no custom logic',
          'Brocco-style: 13 built-in tools + a Python factory you can wire in 30 lines',
        ],
      },
    ],
  },
  {
    slug: 'mcp-server-tools-claude-desktop',
    title: 'Building MCP server tools for Claude Desktop (with examples)',
    description:
      'How brocco exposes its 9 agents as Model Context Protocol tools inside Claude Desktop. Config, code, and gotchas.',
    date: '2026-05-04',
    readingMinutes: 9,
    keywords: ['MCP server', 'Claude Desktop tools', 'Model Context Protocol'],
    intro:
      'MCP is the wire protocol Anthropic shipped so any agent runtime can register itself as a tool inside Claude Desktop. Here is exactly how brocco does it.',
    outline: [
      { h2: 'What MCP gives you', bullets: ['Tool definitions', 'Streaming results', 'No vendor lock-in'] },
      { h2: 'A minimal MCP server in 40 lines', bullets: ['Python', 'Type signatures', 'Returning structured output'] },
      { h2: 'Wiring it into Claude Desktop config', bullets: ['claude_desktop_config.json', 'Env vars', 'Restart and verify'] },
      { h2: 'How brocco maps 9 agents to MCP', bullets: ['One tool per agent', 'Streaming SSE → MCP chunks', 'BYOK passthrough'] },
    ],
  },
  {
    slug: 'byok-claude-explained',
    title: 'BYOK explained: bring your own Anthropic key, keep your data',
    description:
      'Why BYOK matters, how it actually works in brocco, and the security posture we ship by default.',
    date: '2026-05-03',
    readingMinutes: 6,
    keywords: ['BYOK Claude', 'bring your own key', 'Anthropic ZDR'],
    intro:
      'BYOK ("bring your own key") sounds like a pricing trick. It is actually a security posture. Here is the difference, and what brocco ships by default.',
    outline: [
      { h2: 'The three BYOK postures', bullets: ['Server proxy', 'Client direct', 'Hosted with ZDR'] },
      { h2: 'How brocco does it', bullets: ['Dashboard preview before paid activation', 'Paid tools require your API key when hosted AI is unavailable; provider usage is billed separately', 'Saved conversations and tool requests are handled as described in the privacy policy; provider retention follows the provider\'s terms'] },
      { h2: 'Check where your data goes', bullets: ['Provider retention depends on your provider agreement; BYOK alone does not guarantee zero retention', 'Brocco stores saved conversations and project content as described in the privacy policy'] },
    ],
  },
  {
    slug: 'broadcast-pattern-multi-agent',
    title: 'The broadcast pattern: one prompt to N agents, in parallel',
    description:
      'Why broadcast mode is the killer feature most agent platforms missed, with three example workflows.',
    date: '2026-05-02',
    readingMinutes: 5,
    keywords: ['multi-agent broadcast', 'parallel agents', 'agent fan-out'],
    intro:
      'When you stop thinking of agents as one-at-a-time and start thinking of them as a team you broadcast to, every workflow gets shorter. Three examples.',
    outline: [
      { h2: 'Workflow 1: launch sprint', bullets: ['researcher + planner + outreach + designer + analyst, parallel', '3 hours of work in one prompt'] },
      { h2: 'Workflow 2: customer deep dive', bullets: ['researcher + outreach to one named lead', 'Output: brief + cold email pair'] },
      { h2: 'Workflow 3: content sprint', bullets: ['Five posts on one topic, five different angles, in parallel'] },
    ],
  },
  {
    slug: 'ai-audit-log-jsonl',
    title: 'JSONL audit logs for AI agents (and why your security team will love you)',
    description:
      'Why JSONL beats SQL + CSV + UI-only logs for agent runs, with a working example you can grep.',
    date: '2026-05-01',
    readingMinutes: 5,
    keywords: ['AI audit log', 'agent run JSONL', 'compliance AI'],
    intro:
      'Every brocco run appends one JSONL file. You can grep it, diff it, and hand it to your security team. Here is why that beats every alternative.',
    outline: [
      { h2: 'Why JSONL', bullets: ['One event per line', 'Append-only', 'Greppable', 'Diffable across runs'] },
      { h2: 'Schema', bullets: ['ts, agent, step, type, payload', 'Tool calls + results inline'] },
      { h2: 'How to ship it to your SIEM', bullets: ['Vector', 'Datadog', 'Splunk forwarder'] },
    ],
  },
];

export function getPost(slug: string): PostSeed | null {
  return POSTS.find((p) => p.slug === slug) ?? null;
}

// Vertical landing pages — /for/<slug>. Each entry is a use-case
// landing for a specific role or industry.

export interface VerticalSeed {
  slug: string;
  audience: string;
  hero: string;
  lead: string;
  pains: string[];
  dayWith: { time: string; action: string }[];
  recipes: string[];
  agents: string[];
  cta: string;
  keywords: string[];
}

export const VERTICALS: VerticalSeed[] = [
  {
    slug: 'founders',
    audience: 'founders',
    hero: 'You are the entire team until you are not.',
    lead: 'Brocco runs the work an early-stage founder can not afford to hire for. Research, outreach, ops, content, design, all from one prompt.',
    pains: [
      'You context-switch between 8 tabs every hour.',
      'Cold outreach takes a Tuesday you do not have.',
      'You hand-roll the same launch checklist every two weeks.',
      'Hiring an EA is months away; you need leverage today.',
    ],
    dayWith: [
      { time: '8:30am', action: 'Researcher pulls competitor changelogs while you finish coffee.' },
      { time: '10:00am', action: 'Outreach drafts 12 cold emails grounded in last week\'s research.' },
      { time: '1:00pm', action: 'Designer wireframes the new pricing page and hands off to coder.' },
      { time: '4:00pm', action: 'Analyst summarizes the week\'s metrics into a 1-page memo.' },
      { time: '6:00pm', action: 'Supervisor synthesizes everything into Friday\'s investor update.' },
    ],
    recipes: ['launch-day', 'market-research', 'cold-outreach-batch', 'content-sprint'],
    agents: ['supervisor', 'researcher', 'outreach', 'analyst'],
    cta: 'Ship more without hiring.',
    keywords: ['ai for founders', 'solo founder ai', 'startup ai agent'],
  },
  {
    slug: 'agencies',
    audience: 'agencies',
    hero: 'Bill more hours. Work fewer.',
    lead: 'Agencies use brocco to spin up specialist agents per client without spinning up specialists per client. One license covers the team.',
    pains: [
      'Every client wants a custom workflow.',
      'Your senior team is bottlenecked on research and outreach.',
      'You can not justify hiring a researcher per account.',
      'Margins compress every time you swap tools.',
    ],
    dayWith: [
      { time: 'Mon', action: 'Researcher builds 8 client-specific competitor decks in parallel.' },
      { time: 'Tue', action: 'Outreach drafts 200 personalized cold emails across 4 client accounts.' },
      { time: 'Wed', action: 'Designer ships 6 landing-page wireframes from the client briefs.' },
      { time: 'Thu', action: 'Analyst writes 4 weekly metrics memos for the strategy review.' },
      { time: 'Fri', action: 'Supervisor packages everything for the Friday client send.' },
    ],
    recipes: ['market-research', 'cold-outreach-batch', 'content-sprint', 'launch-day'],
    agents: ['researcher', 'outreach', 'designer', 'analyst', 'supervisor'],
    cta: 'Run the agency without burning out the team.',
    keywords: ['ai for agencies', 'agency automation', 'client research ai'],
  },
  {
    slug: 'ops-leads',
    audience: 'ops leads',
    hero: 'The work that runs the business.',
    lead: 'Brocco does the silent ops work — CRM hygiene, ticket triage, reminder scheduling, deduping — so your humans can do the work humans should do.',
    pains: [
      'CRM is 30% duplicate records and growing.',
      'Tickets pile up because nobody triages by priority.',
      'You need a weekly hygiene report nobody wants to write.',
      'Reminders fall through Slack DMs and never get scheduled.',
    ],
    dayWith: [
      { time: '8:00am', action: 'Ops dedupes overnight CRM additions and merges 17 duplicate clusters.' },
      { time: '10:00am', action: 'Triages 87 incoming tickets into P0/P1/P2/P3 with proposed assignees.' },
      { time: '1:00pm', action: 'Schedules onboarding follow-ups for the 23 new signups.' },
      { time: '4:00pm', action: 'Generates the weekly hygiene report flagging 12 records that drifted.' },
    ],
    recipes: ['customer-support-triage', 'expense-categorizer', 'cold-outreach-batch'],
    agents: ['ops', 'analyst', 'supervisor'],
    cta: 'Shift the silent ops load to brocco.',
    keywords: ['ai ops', 'crm cleanup ai', 'operations automation'],
  },
  {
    slug: 'sales-ops',
    audience: 'sales ops',
    hero: 'Pipeline hygiene and inbox triage on autopilot.',
    lead: 'Brocco enriches leads, drafts outbound, triages replies, and keeps the CRM honest. Sales ops becomes a one-person team again.',
    pains: [
      'Lead enrichment is a manual hellscape.',
      'Reps refuse to log activity, so the CRM lies to leadership.',
      'Reply triage means scrolling 200 emails on Sunday.',
      'Quarterly hygiene takes a full week off the calendar.',
    ],
    dayWith: [
      { time: '7:00am', action: 'Researcher enriches 80 new leads with role + recent activity.' },
      { time: '9:30am', action: 'Outreach drafts personalized first touches for AE review.' },
      { time: '12:00pm', action: 'Ops syncs CRM to source-of-truth and flags 14 stale records.' },
      { time: '3:00pm', action: 'Outreach triages 200 replies into hot/warm/dead with notes.' },
    ],
    recipes: ['cold-outreach-batch', 'customer-deep-dive', 'candidate-screener'],
    agents: ['researcher', 'outreach', 'ops', 'analyst'],
    cta: 'Run sales ops with one license.',
    keywords: ['ai sales ops', 'lead enrichment ai', 'reply triage ai'],
  },
  {
    slug: 'recruiters',
    audience: 'recruiters',
    hero: 'Sourcing, screening, and outreach without the tab tax.',
    lead: 'Brocco pulls candidates, screens fit, drafts personalized outreach, and triages responses. Six recruiter tools in one license.',
    pains: [
      'Candidate sourcing means 3 SaaS tools and a spreadsheet.',
      'Screening 200 applicants by hand burns Tuesdays.',
      'Personalized outreach scales to 12 candidates a week.',
      'Reply triage gets ignored after the first wave.',
    ],
    dayWith: [
      { time: '7:30am', action: 'Browser pulls 150 GitHub profiles matching senior backend criteria.' },
      { time: '10:00am', action: 'Researcher cross-references with LinkedIn for current role + tenure.' },
      { time: '12:30pm', action: 'Outreach drafts 150 personalized first touches; 30 minutes review.' },
      { time: '3:00pm', action: 'Triage incoming replies; book the 22 interested candidates.' },
    ],
    recipes: ['candidate-screener', 'cold-outreach-batch', 'customer-deep-dive'],
    agents: ['researcher', 'outreach', 'browser', 'ops'],
    cta: 'Source 10x more candidates with the same hours.',
    keywords: ['ai recruiter', 'candidate sourcing ai', 'recruiter automation'],
  },
  {
    slug: 'course-creators',
    audience: 'course creators',
    hero: 'Research the topic, draft the lessons, ship the launch.',
    lead: 'Brocco helps course creators research depth, draft modules, generate companion assets, and run the launch. One pipeline, no agency.',
    pains: [
      'Research depth takes weeks before you can outline.',
      'Module drafting eats the calendar you saved for filming.',
      'Companion assets (worksheets, checklists, examples) get cut for time.',
      'Launch comms become an afterthought, sales suffer.',
    ],
    dayWith: [
      { time: 'Week 1', action: 'Researcher delivers a 40-page depth brief on the topic with 80+ sources.' },
      { time: 'Week 2', action: 'Designer outlines 8 modules with learning objectives and exercises.' },
      { time: 'Week 3', action: 'Coder drafts companion assets — quizzes, code samples, worksheets.' },
      { time: 'Week 4', action: 'Outreach builds the launch sequence; supervisor coordinates send.' },
    ],
    recipes: ['content-sprint', 'launch-day', 'market-research'],
    agents: ['researcher', 'designer', 'outreach', 'supervisor'],
    cta: 'Ship the course in 4 weeks, not 4 months.',
    keywords: ['ai for course creators', 'course launch automation', 'curriculum ai'],
  },
  {
    slug: 'marketers',
    audience: 'marketers',
    hero: 'Content, campaigns, comms — at the cadence the algorithm rewards.',
    lead: 'Brocco runs your content sprints, builds your campaign collateral, and drafts the comms. Six marketing roles, one license.',
    pains: [
      'Content cadence is impossible at agency rates.',
      'Campaign collateral is 80% repurposed and 20% missing.',
      'Comms slip behind the launch by a week.',
      'Analytics never feed back into next week\'s plan.',
    ],
    dayWith: [
      { time: 'Mon', action: 'Researcher pulls competitor and audience signal from the last 7 days.' },
      { time: 'Tue', action: 'Outreach drafts 5 newsletter editions plus the social variants.' },
      { time: 'Wed', action: 'Designer builds 3 campaign visual directions with copy variants.' },
      { time: 'Thu', action: 'Analyst writes the weekly performance memo with next-week recommendations.' },
    ],
    recipes: ['content-sprint', 'launch-day', 'weekly-competitor-monitor'],
    agents: ['researcher', 'outreach', 'designer', 'analyst'],
    cta: 'Hit the content cadence without scaling the team.',
    keywords: ['ai for marketing', 'content automation', 'marketing agent'],
  },
  {
    slug: 'customer-success',
    audience: 'customer success',
    hero: 'Reduce churn before it shows up in the dashboard.',
    lead: 'Brocco watches usage signals, drafts proactive touches, and surfaces accounts that need attention. CS scales without scaling headcount.',
    pains: [
      'CS is reactive — by the time tickets fire, churn risk is high.',
      'Proactive outreach is impossible at 1:200 ratios.',
      'QBR prep takes the whole week before each meeting.',
      'Renewal forecasting lives in a fragile spreadsheet.',
    ],
    dayWith: [
      { time: '7:00am', action: 'Analyst flags 12 accounts whose usage dropped this week.' },
      { time: '9:30am', action: 'Outreach drafts proactive touches grounded in each account\'s drop-off.' },
      { time: '1:00pm', action: 'Researcher pulls public news on each top-50 account for QBR fodder.' },
      { time: '3:30pm', action: 'Ops triages 47 support tickets and assigns to the right CSM.' },
    ],
    recipes: ['customer-support-triage', 'customer-deep-dive', 'weekly-competitor-monitor'],
    agents: ['analyst', 'outreach', 'researcher', 'ops'],
    cta: 'Prevent churn before it becomes a renewal problem.',
    keywords: ['ai customer success', 'churn prevention ai', 'cs automation'],
  },
  {
    slug: 'wholesalers',
    audience: 'real-estate wholesalers',
    hero: 'Find the deal. Pitch the buyer. Close the spread.',
    lead: 'Brocco runs the unglamorous wholesale stack: county records, motivated-seller signal, buyer matching, contract drafting. One license replaces three.',
    pains: [
      'Pulling motivated-seller leads is a Tuesday.',
      'Buyer matching is an inbox of 200 spreadsheets.',
      'Contract drafting eats the weekend.',
      'Most leads never get followed up because volume kills priority.',
    ],
    dayWith: [
      { time: '7:00am', action: 'Browser pulls overnight county records for tax-delinquent properties.' },
      { time: '9:00am', action: 'Researcher cross-checks each address against absentee-owner data.' },
      { time: '11:00am', action: 'Outreach drafts personalized seller letters and SMS templates.' },
      { time: '2:00pm', action: 'Researcher builds a buyer-match list per property based on the buyer DB.' },
      { time: '4:00pm', action: 'Coder drafts the assignable contract with property-specific blanks.' },
    ],
    recipes: ['scrape-and-summarize', 'cold-outreach-batch', 'customer-deep-dive'],
    agents: ['browser', 'researcher', 'outreach', 'coder', 'ops'],
    cta: 'Run the wholesale pipeline like a fund.',
    keywords: ['real estate wholesale ai', 'wholesaling automation', 'motivated seller leads ai'],
  },
];

export function getVertical(slug: string): VerticalSeed | null {
  return VERTICALS.find((v) => v.slug === slug) ?? null;
}

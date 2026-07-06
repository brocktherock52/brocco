/**
 * Real-estate "alternative to X" comparison pages (/alternatives/[slug]).
 *
 * From the 2026-06-02 traffic research: bottom-of-funnel comparison/alternative
 * pages are the single fastest path to signups for a zero-authority site (they
 * convert 7-23% vs 2-4% generic and are the content AI search engines cite). The
 * RE comparison SERP is operator-blogs, not SEO giants, so this is a wedge.
 *
 * Honesty policy (also better for SEO + trust): competitor strengths are stated
 * plainly and each page has a "when [competitor] is the better choice" section.
 * Competitor pricing is described qualitatively (it changes and varies by plan),
 * brocco's is concrete. brocco's one differentiator competitors can't copy: a
 * parallel AI team that returns a finished DELIVERABLE (skip-trace + comps + LOI
 * + buyer list), not just data, on BYOK pricing.
 */

export interface AltRow {
  feature: string;
  brocco: string;
  them: string;
}

export interface Alternative {
  slug: string;
  competitor: string;
  /** One-line on what the competitor is, stated fairly. */
  competitorBlurb: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  h1Lead: string; // bold first clause
  h1Rest: string; // serif-italic remainder
  sub: string;
  rows: AltRow[];
  /** Honest: when the competitor is the better pick. */
  whenThemBetter: string[];
  faqs: { q: string; a: string }[];
}

const BROCCO_DELIVERABLE =
  'A parallel AI team that returns a finished deliverable (ranked lead list, comps + ARV, drafted LOI, cash-buyer list), not just raw data.';

export const ALTERNATIVES: Alternative[] = [
  {
    slug: 'propstream',
    competitor: 'PropStream',
    competitorBlurb:
      'PropStream is a property-data and lead-list platform (now also owning BatchLeads/BatchDialer) used to pull lists, comps, and owner info.',
    metaTitle: 'PropStream Alternative for Wholesalers (2026) | brocco',
    metaDescription:
      'Looking for a PropStream alternative? brocco replaces a stack of single-feature tools with one AI deal team that pulls leads, runs comps, drafts the LOI, and builds your buyer list. BYOK pricing, 100 free runs.',
    keywords: ['propstream alternative', 'propstream alternatives', 'cheaper than propstream', 'propstream vs', 'ai property data tool'],
    h1Lead: 'A PropStream alternative that finishes the deal,',
    h1Rest: 'not just the lookup.',
    sub: 'PropStream gives you the data. brocco gives you the data and the work on top of it: a ranked lead list, the comps and ARV, the drafted LOI, and a matched cash-buyer list, from one prompt. Bring your own key and run it on your own market.',
    rows: [
      { feature: 'Pull motivated-seller / distressed lists', brocco: 'Yes, pulled and scored by motivation', them: 'Yes, filters + lists' },
      { feature: 'Comps + ARV', brocco: 'Yes, with the reasoning, not just a number', them: 'Comps tool, manual interpretation' },
      { feature: 'Skip tracing', brocco: 'Yes, in the same run', them: 'Add-on / per-record' },
      { feature: 'Writes the outreach (call/SMS/letter)', brocco: 'Yes, drafted and ready to send', them: 'No, you write it' },
      { feature: 'Drafts the LOI / assignable contract', brocco: 'Yes', them: 'No' },
      { feature: 'Builds a cash-buyer match list', brocco: 'Yes', them: 'Partial / manual' },
      { feature: 'Runs the whole pipeline in one step', brocco: 'Yes, agents work in parallel', them: 'No, you operate each tool' },
      { feature: 'Pricing model', brocco: 'Free tier + $49/mo, BYOK (no per-record markup)', them: 'Monthly subscription, add-ons per feature' },
    ],
    whenThemBetter: [
      'You want a mature, decade-old nationwide property database with deep filtering and are comfortable doing the analysis and outreach yourself.',
      'You rely on PropStream-specific features (e.g. its mobile list-building or the BatchDialer power dialer) as your core workflow.',
      'You prefer a fixed-feature SaaS over describing jobs in plain language to an AI team.',
    ],
    faqs: [
      {
        q: 'Is brocco a true PropStream alternative?',
        a: 'For the wholesaler workflow, yes. PropStream is strongest as a data and list source. brocco covers the same lead pulling and comps, then goes further: it skip traces, writes the outreach, drafts the LOI, and builds a buyer list in the same run. If you mainly need raw nationwide data with manual analysis, PropStream is still excellent; if you want the finished deal work, brocco does more of it.',
      },
      {
        q: 'Is brocco cheaper than PropStream?',
        a: 'brocco has a free tier (100 runs a month, no card) and a $49/mo Solo plan, and it uses bring-your-own-key pricing so you pay model cost directly with no per-record markup. PropStream is a monthly subscription with add-ons. Your real cost depends on volume, but BYOK removes the per-lead surcharge that data tools charge.',
      },
      {
        q: 'Does brocco have its own property database?',
        a: 'brocco pulls from public records and listing sources at run time on your inputs rather than reselling a static database. You bring your own model key, and your lists and contacts stay yours.',
      },
    ],
  },
  {
    slug: 'dealmachine',
    competitor: 'DealMachine',
    competitorBlurb:
      'DealMachine is a driving-for-dollars app: you spot distressed houses, save them, skip trace, and send mail/SMS from your phone.',
    metaTitle: 'DealMachine Alternative: AI vs Driving for Dollars (2026) | brocco',
    metaDescription:
      'A DealMachine alternative for 2026: instead of driving neighborhoods to find one house at a time, brocco pulls and scores motivated-seller lists, skip traces, and writes the outreach for you. 100 free runs, BYOK.',
    keywords: ['dealmachine alternative', 'dealmachine alternatives', 'driving for dollars alternative', 'ai for wholesaling', 'dealmachine vs'],
    h1Lead: 'A DealMachine alternative that pulls the leads,',
    h1Rest: "so you're not driving for them.",
    sub: 'DealMachine is built around driving for dollars, one house at a time. brocco starts from the data: it pulls and scores tax-delinquent, absentee, and distressed lists across a whole county, skip traces them, and drafts the outreach, before you have turned the key.',
    rows: [
      { feature: 'Finds leads by', brocco: 'Pulling + scoring county-wide lists', them: 'Driving + spotting houses' },
      { feature: 'Coverage per session', brocco: 'A whole county / price band at once', them: 'The streets you drive' },
      { feature: 'Skip tracing', brocco: 'Yes, in the same run', them: 'Yes (per-lookup credits)' },
      { feature: 'Comps + ARV + max offer', brocco: 'Yes', them: 'No' },
      { feature: 'Writes the outreach', brocco: 'Call/SMS/letter drafted', them: 'Mail/SMS templates, you send' },
      { feature: 'Drafts the LOI / contract', brocco: 'Yes', them: 'No' },
      { feature: 'Cash-buyer match list', brocco: 'Yes', them: 'No' },
      { feature: 'Pricing model', brocco: 'Free tier + $49/mo, BYOK', them: 'Subscription + skip-trace/mail credits' },
    ],
    whenThemBetter: [
      'You genuinely enjoy driving for dollars and want the best mobile app for tagging houses on the go.',
      'Your market rewards on-the-ground discovery (heavy visual distress signals) more than records-based lists.',
      'You want a turnkey direct-mail send built into the same app.',
    ],
    faqs: [
      {
        q: 'Can AI replace driving for dollars?',
        a: 'It replaces the part driving for dollars is a proxy for: finding owners likely to sell at a discount. brocco pulls those owners directly from tax-delinquent, absentee, vacancy, and pre-foreclosure data across an entire county and scores them, which is far more coverage than you can drive. Driving still helps for visual condition signals; many investors do both and let brocco handle the volume.',
      },
      {
        q: 'Does brocco skip trace like DealMachine?',
        a: 'Yes, skip tracing is part of a run, and with bring-your-own-key pricing you avoid stacking per-lookup credit costs on top of a subscription.',
      },
    ],
  },
  {
    slug: 'batchleads',
    competitor: 'BatchLeads',
    competitorBlurb:
      'BatchLeads (now part of PropStream) is a list-building, skip-tracing, and SMS/dialer platform for real-estate investors.',
    metaTitle: 'BatchLeads Alternative for Wholesalers (2026) | brocco',
    metaDescription:
      'A BatchLeads alternative that does more than lists and dialing: brocco pulls and scores motivated-seller leads, skip traces, runs comps, and drafts the LOI in one AI run. 100 free runs, BYOK.',
    keywords: ['batchleads alternative', 'batchleads alternatives', 'batchdialer alternative', 'skip tracing tool alternative', 'ai list building real estate'],
    h1Lead: 'A BatchLeads alternative that scores the list',
    h1Rest: 'and writes the first call.',
    sub: 'BatchLeads is strong at building lists, skip tracing, and dialing. brocco does the list and the skip trace, then ranks the leads by motivation and drafts the outreach, the comps, and the contract, so the list arrives already worked.',
    rows: [
      { feature: 'List building', brocco: 'Yes, scored by motivation', them: 'Yes, filter-based' },
      { feature: 'Skip tracing', brocco: 'Yes, in-run', them: 'Yes, per-record' },
      { feature: 'SMS / dialer', brocco: 'Drafts the messages + cadence (use your dialer)', them: 'Built-in SMS + dialer' },
      { feature: 'Comps + ARV + MAO', brocco: 'Yes', them: 'Limited' },
      { feature: 'Drafts the LOI / contract', brocco: 'Yes', them: 'No' },
      { feature: 'Cash-buyer match list', brocco: 'Yes', them: 'No' },
      { feature: 'Pricing model', brocco: 'Free tier + $49/mo, BYOK', them: 'Subscription + per-record / messaging credits' },
    ],
    whenThemBetter: [
      'You want an all-in-one built-in dialer and SMS platform and prefer to send from the same tool.',
      'High-volume SMS blasting is your primary channel and you want native deliverability tooling.',
      'You are already inside the PropStream/BatchLeads ecosystem and want to stay there.',
    ],
    faqs: [
      {
        q: 'Does brocco send SMS like BatchLeads?',
        a: 'brocco drafts the SMS, call opener, letter, and the follow-up cadence, and you send from your own dialer/SMS tool. That keeps your sending compliant and under your control while brocco does the writing and prioritization.',
      },
      {
        q: 'BatchLeads is now part of PropStream, does that matter?',
        a: 'It mostly means consolidation and bundled pricing. The brocco difference is the same either way: instead of operating separate list, skip-trace, and dialer features, you describe the job and an AI team returns a finished, scored, ready-to-work output.',
      },
    ],
  },
  {
    slug: 'resimpli',
    competitor: 'REsimpli',
    competitorBlurb:
      'REsimpli is an all-in-one real-estate investor CRM with lead management, marketing, driving for dollars, and list pulling.',
    metaTitle: 'REsimpli Alternative for Wholesalers (2026) | brocco',
    metaDescription:
      'A REsimpli alternative focused on the work, not just the CRM: brocco pulls and scores leads, skip traces, runs comps, drafts the LOI, and builds your buyer list with an AI team. 100 free runs, BYOK.',
    keywords: ['resimpli alternative', 'resimpli alternatives', 'real estate investor crm alternative', 'ai wholesaling crm', 'resimpli vs'],
    h1Lead: 'A REsimpli alternative that does the deal work,',
    h1Rest: 'not only the CRM.',
    sub: 'REsimpli organizes your pipeline. brocco does the labor inside it: pulling and scoring leads, skip tracing, comps and ARV, drafting the LOI, and matching cash buyers. Pair it with any CRM, or let it hand you finished work to drop in.',
    rows: [
      { feature: 'Lead pulling + scoring', brocco: 'Yes, scored by motivation', them: 'List pulling add-on' },
      { feature: 'Skip tracing', brocco: 'Yes, in-run', them: 'Yes, per-record' },
      { feature: 'Comps + ARV + MAO', brocco: 'Yes, with reasoning', them: 'Basic' },
      { feature: 'Writes outreach + follow-up', brocco: 'Drafted + cadence', them: 'Templates + automation' },
      { feature: 'Drafts the LOI / contract', brocco: 'Yes', them: 'Document storage, not drafting' },
      { feature: 'Full CRM / pipeline boards', brocco: 'No (use your CRM)', them: 'Yes, full CRM' },
      { feature: 'Pricing model', brocco: 'Free tier + $49/mo, BYOK', them: 'Tiered subscription' },
    ],
    whenThemBetter: [
      'You need a full CRM as your system of record with pipeline boards, KPIs, and team management.',
      'You want lead management, marketing automation, and accounting in one subscription.',
      'Your bottleneck is organization and tracking, not generating and working the leads.',
    ],
    faqs: [
      {
        q: 'Is brocco a CRM like REsimpli?',
        a: 'No, and that is deliberate. REsimpli is a system of record. brocco is the worker: it generates and works the leads (pull, skip, comps, LOI, buyers) and hands you finished output you can drop into any CRM, including REsimpli. Many investors keep their CRM and add brocco for the labor.',
      },
      {
        q: 'Can I use brocco with my existing CRM?',
        a: 'Yes. brocco produces files (CSV lead lists, comp sheets, drafted contracts, dispo copy) you import into whatever CRM you already use, so you are not forced to migrate.',
      },
    ],
  },
];

export function getAlternative(slug: string): Alternative | null {
  return ALTERNATIVES.find((a) => a.slug === slug) ?? null;
}

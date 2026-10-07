/**
 * Ad warm-landers (consultant note 2026-06-02).
 *
 * These power /go/[slug]: stripped-down, no-navigation landing pages whose only
 * clickable action is the CTA to /begin. The consultant's point was that a
 * page with top navigation leaks high-intent paid traffic, and that a single
 * "pre-warming" page that hits a specific buyer's pain hard converts far better.
 *
 * The flow per page is the consultant's sell sequence:
 *   1. headline  -> the benefit / pain removal (NOT a feature)
 *   2. pains[]   -> agitate the specific pain this buyer feels
 *   3. how[]     -> objection handling: "ok, prove it / how does it work"
 *   4. proof[]   -> trust + risk reversal
 *   5. one CTA   -> /begin
 *
 * Adding a new ad/persona variant is a DATA edit here, not a new page, so the
 * "AI makes hundreds of these for different targetings" idea is a config loop.
 */

export interface Lander {
  slug: string;
  /** Small kicker above the headline. */
  eyebrow: string;
  /** Benefit-first headline. First sentence renders bold, the rest serif-italic. */
  headline: string;
  /** One-line benefit expansion under the headline. */
  sub: string;
  /** The specific pains this buyer feels all day. Keep visceral, first-person. */
  pains: string[];
  /** Objection handling: how it actually works, in plain steps. */
  how: { title: string; body: string }[];
  /** Trust + risk reversal chips. */
  proof: string[];
  /** Big button label. */
  ctaLabel: string;
  /** On-brand croc image for the hero. */
  image: string;
}

export const LANDERS: Lander[] = [
  {
    slug: 'wholesalers',
    eyebrow: 'AI for real-estate wholesalers',
    headline: 'Never chase another lead. Your AI team does it for you.',
    sub: 'Wake up to deals in the pipeline instead of a to-do list. brocco pulls the lists, skip traces, sends the offers, and revives dead leads, around the clock, while you live your life.',
    pains: [
      'You spend all day pulling lists, skip tracing, and sending offers by hand.',
      'You see leads in your sleep, and the good ones go cold before you can call.',
      'Buyer matching is an inbox full of spreadsheets you never get to.',
      'Contract drafting eats the weekend you wanted back.',
    ],
    how: [
      {
        title: 'Say the job once',
        body: 'On a paid plan, connect your model key and any required data credentials. Then describe your county, price band, and buy box in one sentence.',
      },
      {
        title: 'The team runs it for you',
        body: 'Specialist AI agents pull records, skip trace, write the outreach, run the comps, match buyers, and draft the contract, all in parallel, on a schedule.',
      },
      {
        title: 'You get finished deals',
        body: 'A ranked call list, a comp sheet, a dispo blast, an assignable contract, ready to send. You stay in the approval seat.',
      },
    ],
    proof: [
      '7-day dashboard preview',
      'Card required',
      'Live tools on paid plans',
      'Cancel before billing starts',
    ],
    ctaLabel: 'Start 7-day trial',
    image: '/assets/real-estate/croc-building-house.png',
  },
  {
    slug: 'agents',
    eyebrow: 'AI for real-estate agents',
    headline: 'List more. Chase less. Let the AI do the unbillable hours.',
    sub: 'Listing copy, CMAs, farm-area research, and follow-up, handled for you, so you spend your hours in front of clients instead of behind a screen.',
    pains: [
      'Writing listing descriptions and CMAs eats your evenings.',
      'Your farm area needs constant research you never have time for.',
      'Leads go cold because follow-up is manual and you are busy.',
      'Open-house and listing collateral is a scramble every single time.',
    ],
    how: [
      {
        title: 'Say the job once',
        body: 'Point it at the new listing or your pipeline in one sentence. It already knows the realtor workflow.',
      },
      {
        title: 'The team runs it for you',
        body: 'Agents build the CMA, write the listing description and social posts, and draft a personalized follow-up for every lead, in parallel.',
      },
      {
        title: 'You stay in front of clients',
        body: 'You get ready-to-send copy and a one-page market update, not another tab to babysit.',
      },
    ],
    proof: [
      '7-day dashboard preview',
      'Card required',
      'Your data stays yours',
      'Cancel before billing starts',
    ],
    ctaLabel: 'Start 7-day trial',
    image: '/assets/real-estate/croc-agent.png',
  },
  {
    slug: 'investors',
    eyebrow: 'AI for real-estate investors',
    headline: 'Close the deals other investors walk past. On autopilot.',
    sub: 'Find the seller, run the numbers, structure the offer, and follow up forever, whether you flip, hold, or do creative finance. The hard part becomes a prompt.',
    pains: [
      'Finding sellers who fit your strategy is a needle in a haystack.',
      'Pricing a deal by hand means hours of comp-hunting per property.',
      'Modeling subject-to or seller-finance terms is slow and error-prone.',
      'Most leads never get followed up, so you leave money on the table.',
    ],
    how: [
      {
        title: 'Say the job once',
        body: 'Describe the strategy and the market in plain language. No spreadsheets, no formulas to memorize.',
      },
      {
        title: 'The team runs it for you',
        body: 'Agents screen the leads, model the deal two ways, write the seller-facing pitch, and draft the paperwork, in parallel.',
      },
      {
        title: 'You get a deal you can sign',
        body: 'A defensible offer, a term sheet, and a follow-up engine that revives the leads you already paid for.',
      },
    ],
    proof: [
      '7-day dashboard preview',
      'Card required',
      'Live tools on paid plans',
      'Cancel before billing starts',
    ],
    ctaLabel: 'Start 7-day trial',
    image: '/assets/real-estate/croc-creative-finance.png',
  },
];

export function getLander(slug: string): Lander | null {
  return LANDERS.find((l) => l.slug === slug) ?? null;
}

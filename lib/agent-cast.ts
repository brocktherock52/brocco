// AgentCast data: brocco-croc character vignettes per agent.
// Each entry binds an agent slug to a costume + scene caption.
//
// v5 imagePaths point at AI-generated emoji-sticker PNGs (Gemini 3.1
// Flash Image via inference.sh nano-banana-2, seeded with the real
// brocco-mark-transparent.png so every croc reads as the same
// character in a different role, sitting and working at its station).
// Outputs live in /assets/cast-v6/.

export interface AgentCastMember {
  slug: string;
  name: string;
  costume: string;
  scene: string;
  imagePath: string | null;
  videoPath: string | null;
  posterPath?: string | null;
  accent: string;
  /** Optional explicit click target. Defaults to /agents/<slug>. */
  href?: string;
}

export const AGENT_CAST: AgentCastMember[] = [
  {
    slug: 'researcher',
    name: 'researcher',
    costume: 'wire-frame glasses, paper in hand, desk lamp glow',
    scene: 'behind a small wooden desk, books and folders piled high, sticky notes orbiting like thought bubbles',
    imagePath: '/assets/cast-v6/researcher.png',
    videoPath: null,
    accent: '#67E8F9',
  },
  {
    slug: 'planner',
    name: 'planner',
    costume: 'sleeves up, marker in hand, half-eaten sandwich',
    scene: 'standing at a giant whiteboard mapping a 7-phase launch with arrows and timelines',
    imagePath: '/assets/cast-v6/planner.png',
    videoPath: null,
    accent: '#FB7185',
  },
  {
    slug: 'outreach',
    name: 'outreach',
    costume: 'thin headset, casual blazer, mug of coffee',
    scene: 'hunched over a laptop sending personalized cold emails, color-coded reply piles fanned out',
    imagePath: '/assets/cast-v6/outreach.png',
    videoPath: null,
    accent: '#FBBF24',
  },
  {
    slug: 'designer',
    name: 'designer',
    costume: 'paint-flecked apron, oversized headphones, stylus pen',
    scene: 'sketching a moodboard on a tablet, color swatches and reference prints pinned around',
    imagePath: '/assets/cast-v6/designer.png',
    videoPath: null,
    accent: '#F472B6',
  },
  {
    slug: 'analyst',
    name: 'analyst',
    costume: 'rolled sleeves, calculator pin, tie loosened',
    scene: 'dual monitors with charts, hand on a coffee, scribbling on a printed report',
    imagePath: '/assets/cast-v6/analyst.png',
    videoPath: null,
    accent: '#A78BFA',
  },
  {
    slug: 'coder',
    name: 'coder',
    costume: 'oversized hipster glasses, faded hoodie, mechanical keyboard',
    scene: 'hunched over a glowing laptop, energy drink cans, sticky notes covered in sketches',
    imagePath: '/assets/cast-v6/coder.png',
    videoPath: null,
    accent: '#4ADE80',
  },
  {
    slug: 'ops',
    name: 'ops',
    costume: 'navy suit, thin cyan tie, sleeves rolled',
    scene: 'at the copy machine feeding documents into a shredder, paper confetti drifting',
    imagePath: '/assets/cast-v6/ops.png',
    videoPath: null,
    accent: '#22D3EE',
  },
  {
    slug: 'supervisor',
    name: 'supervisor',
    costume: 'cardigan over a button-up, conductor baton, half-glasses',
    scene: 'standing in front of 5 streaming pane mockups, conducting the broadcast like a small orchestra',
    imagePath: '/assets/cast-v6/supervisor.png',
    videoPath: null,
    accent: '#22C55E',
  },
  {
    slug: 'browser',
    name: 'browser',
    costume: 'fedora and a pinstripe vest, briar pipe with a curl of smoke',
    scene: 'reclined in a leather wing-back chair, leather case file on the lap, banker\'s lamp glowing green',
    imagePath: '/assets/cast-v6/browser.png',
    videoPath: null,
    accent: '#67E8F9',
  },
  // EXTENDED TEAM — visual cast only for now. Routing through the
  // runtime selector happens through the custom-agent wizard archetype
  // map until each gets a dedicated stream.
  {
    slug: 'marketer',
    name: 'marketer',
    costume: 'backwards cap, phone on a ring-light, engagement charts',
    scene: 'measuring reach across paid + organic, juggling six campaigns at once',
    imagePath: '/assets/cast-v6/marketer.png',
    videoPath: null,
    accent: '#F472B6',
    href: '/app/agents/new',
  },
  {
    slug: 'copywriter',
    name: 'copywriter',
    costume: 'tortoiseshell reading glasses, feather quill, crumpled drafts',
    scene: 'rewriting your hero copy until it cuts. 30% shorter than yesterday',
    imagePath: '/assets/cast-v6/copywriter.png',
    videoPath: null,
    accent: '#FBBF24',
  },
  {
    slug: 'qa',
    name: 'qa',
    costume: 'high-vis safety vest, clipboard checklist, magnifying glass',
    scene: 'auditing every output for the dumbest mistake first. then the second dumbest',
    imagePath: '/assets/cast-v6/qa.png',
    videoPath: null,
    accent: '#4ADE80',
  },
  {
    slug: 'data_eng',
    name: 'data_eng',
    costume: 'over-ear noise-cancelers, ethernet cable in claw, server rack glow',
    scene: 'piping clean data from your warehouse to whichever agent needs it next',
    imagePath: '/assets/cast-v6/data_eng.png',
    videoPath: null,
    accent: '#22D3EE',
  },
  {
    slug: 'recruiter',
    name: 'recruiter',
    costume: 'navy cardigan, tablet of candidate cards, HIRE mug',
    scene: 'sourcing 10, screening on hard criteria, drafting personalized outreach',
    imagePath: '/assets/cast-v6/recruiter.png',
    videoPath: null,
    accent: '#A78BFA',
  },
  {
    slug: 'cs',
    name: 'customer success',
    costume: 'service headset, big warm smile, floating five-star badges',
    scene: 'spotting churn signals 14 days early, drafting save-plays that close',
    imagePath: '/assets/cast-v6/cs.png',
    videoPath: null,
    accent: '#22C55E',
  },
  {
    slug: 'finance',
    name: 'finance',
    costume: 'green visor, vintage calculator, ledger book, stack of coins',
    scene: 'modeling unit economics for tomorrow before you ask. and the day after',
    imagePath: '/assets/cast-v6/finance.png',
    videoPath: null,
    accent: '#FB7185',
  },
  {
    slug: 'social',
    name: 'social',
    costume: 'pink puffer, smartphone on a ring-light, hearts and play-icons',
    scene: 'turning every brief into nine-second cuts your audience watches end-to-end',
    imagePath: '/assets/cast-v6/social.png',
    videoPath: null,
    accent: '#F472B6',
  },
  {
    slug: 'founder',
    name: 'founder',
    costume: 'black turtleneck, dashboard floating, rocket-ship doodle',
    scene: 'thinking three moves ahead while the team ships the current one',
    imagePath: '/assets/cast-v6/founder.png',
    videoPath: null,
    accent: '#67E8F9',
  },
];

export function getCastMember(slug: string): AgentCastMember | null {
  return AGENT_CAST.find((c) => c.slug === slug) ?? null;
}

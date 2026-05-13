// AgentCast data: brocco-croc character vignettes per agent.
// Each entry binds an agent slug to a costume + scene caption.
//
// v7 imagePaths point at AI-generated emoji-sticker PNGs (Google
// Nano Banana Pro / nano_banana_2 via Higgsfield, seeded with the real
// brocco-mark-transparent.png so every croc reads as the same
// character in a different role, sitting and working at its station).
// Outputs live in /assets/cast-v7/ with TRUE transparent backgrounds
// (alpha channel), so the site no longer needs CSS chroma-key filters.
//
// videoPath points at Higgsfield Seedance 2.0 idle-loop mp4s (4 sec,
// 3:4, 720p) seeded from cast-v6 PNGs. Outputs in /assets/cast-v7-video/.
// When videoPath is non-null, AgentCard plays the looping mp4 instead
// of the static image. posterPath is the first-frame jpg fallback.

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
    imagePath: '/assets/cast-v7/researcher.png',
    videoPath: '/assets/cast-v7-video/researcher.mp4',
    posterPath: '/assets/cast-v7-video/researcher.jpg',
    accent: '#67E8F9',
  },
  {
    slug: 'planner',
    name: 'planner',
    costume: 'sleeves up, marker in hand, half-eaten sandwich',
    scene: 'standing at a giant whiteboard mapping a 7-phase launch with arrows and timelines',
    imagePath: '/assets/cast-v7/planner.png',
    videoPath: '/assets/cast-v7-video/planner.mp4',
    posterPath: '/assets/cast-v7-video/planner.jpg',
    accent: '#FB7185',
  },
  {
    slug: 'outreach',
    name: 'outreach',
    costume: 'thin headset, casual blazer, mug of coffee',
    scene: 'hunched over a laptop sending personalized cold emails, color-coded reply piles fanned out',
    imagePath: '/assets/cast-v7/outreach.png',
    videoPath: '/assets/cast-v7-video/outreach.mp4',
    posterPath: '/assets/cast-v7-video/outreach.jpg',
    accent: '#FBBF24',
  },
  {
    slug: 'designer',
    name: 'designer',
    costume: 'paint-flecked apron, oversized headphones, stylus pen',
    scene: 'sketching a moodboard on a tablet, color swatches and reference prints pinned around',
    imagePath: '/assets/cast-v7/designer.png',
    videoPath: '/assets/cast-v7-video/designer.mp4',
    posterPath: '/assets/cast-v7-video/designer.jpg',
    accent: '#F472B6',
  },
  {
    slug: 'analyst',
    name: 'analyst',
    costume: 'rolled sleeves, calculator pin, tie loosened',
    scene: 'dual monitors with charts, hand on a coffee, scribbling on a printed report',
    imagePath: '/assets/cast-v7/analyst.png',
    videoPath: '/assets/cast-v7-video/analyst.mp4',
    posterPath: '/assets/cast-v7-video/analyst.jpg',
    accent: '#A78BFA',
  },
  {
    slug: 'coder',
    name: 'coder',
    costume: 'oversized hipster glasses, faded hoodie, mechanical keyboard',
    scene: 'hunched over a glowing laptop, energy drink cans, sticky notes covered in sketches',
    imagePath: '/assets/cast-v7/coder.png',
    videoPath: '/assets/cast-v7-video/coder.mp4',
    posterPath: '/assets/cast-v7-video/coder.jpg',
    accent: '#4ADE80',
  },
  {
    slug: 'ops',
    name: 'ops',
    costume: 'navy suit, thin cyan tie, sleeves rolled',
    scene: 'at the copy machine feeding documents into a shredder, paper confetti drifting',
    imagePath: '/assets/cast-v7/ops.png',
    videoPath: '/assets/cast-v7-video/ops.mp4',
    posterPath: '/assets/cast-v7-video/ops.jpg',
    accent: '#22D3EE',
  },
  {
    slug: 'supervisor',
    name: 'supervisor',
    costume: 'cardigan over a button-up, conductor baton, half-glasses',
    scene: 'standing in front of 5 streaming pane mockups, conducting the broadcast like a small orchestra',
    imagePath: '/assets/cast-v7/supervisor.png',
    videoPath: '/assets/cast-v7-video/supervisor.mp4',
    posterPath: '/assets/cast-v7-video/supervisor.jpg',
    accent: '#22C55E',
  },
  {
    slug: 'browser',
    name: 'browser',
    costume: 'fedora and a pinstripe vest, briar pipe with a curl of smoke',
    scene: 'reclined in a leather wing-back chair, leather case file on the lap, banker\'s lamp glowing green',
    imagePath: '/assets/cast-v7/browser.png',
    videoPath: '/assets/cast-v7-video/browser.mp4',
    posterPath: '/assets/cast-v7-video/browser.jpg',
    accent: '#67E8F9',
  },
  // EXTENDED TEAM. Visual cast only for now. Routing through the
  // runtime selector happens through the custom-agent wizard archetype
  // map until each gets a dedicated stream.
  {
    slug: 'marketer',
    name: 'marketer',
    costume: 'backwards cap, phone on a ring-light, engagement charts',
    scene: 'measuring reach across paid + organic, juggling six campaigns at once',
    imagePath: '/assets/cast-v7/marketer.png',
    videoPath: '/assets/cast-v7-video/marketer.mp4',
    posterPath: '/assets/cast-v7-video/marketer.jpg',
    accent: '#F472B6',
    href: '/app/agents/new',
  },
  {
    slug: 'copywriter',
    name: 'copywriter',
    costume: 'tortoiseshell reading glasses, feather quill, crumpled drafts',
    scene: 'rewriting your hero copy until it cuts. 30% shorter than yesterday',
    imagePath: '/assets/cast-v7/copywriter.png',
    videoPath: '/assets/cast-v7-video/copywriter.mp4',
    posterPath: '/assets/cast-v7-video/copywriter.jpg',
    accent: '#FBBF24',
  },
  {
    slug: 'qa',
    name: 'qa',
    costume: 'high-vis safety vest, clipboard checklist, magnifying glass',
    scene: 'auditing every output for the dumbest mistake first. then the second dumbest',
    imagePath: '/assets/cast-v7/qa.png',
    videoPath: '/assets/cast-v7-video/qa.mp4',
    posterPath: '/assets/cast-v7-video/qa.jpg',
    accent: '#4ADE80',
  },
  {
    slug: 'data_eng',
    name: 'data_eng',
    costume: 'over-ear noise-cancelers, ethernet cable in claw, server rack glow',
    scene: 'piping clean data from your warehouse to whichever agent needs it next',
    imagePath: '/assets/cast-v7/data_eng.png',
    videoPath: '/assets/cast-v7-video/data_eng.mp4',
    posterPath: '/assets/cast-v7-video/data_eng.jpg',
    accent: '#22D3EE',
  },
  {
    slug: 'recruiter',
    name: 'recruiter',
    costume: 'navy cardigan, tablet of candidate cards, HIRE mug',
    scene: 'sourcing 10, screening on hard criteria, drafting personalized outreach',
    imagePath: '/assets/cast-v7/recruiter.png',
    videoPath: '/assets/cast-v7-video/recruiter.mp4',
    posterPath: '/assets/cast-v7-video/recruiter.jpg',
    accent: '#A78BFA',
  },
  {
    slug: 'cs',
    name: 'customer success',
    costume: 'service headset, big warm smile, floating five-star badges',
    scene: 'spotting churn signals 14 days early, drafting save-plays that close',
    imagePath: '/assets/cast-v7/cs.png',
    videoPath: '/assets/cast-v7-video/cs.mp4',
    posterPath: '/assets/cast-v7-video/cs.jpg',
    accent: '#22C55E',
  },
  {
    slug: 'finance',
    name: 'finance',
    costume: 'green visor, vintage calculator, ledger book, stack of coins',
    scene: 'modeling unit economics for tomorrow before you ask. and the day after',
    imagePath: '/assets/cast-v7/finance.png',
    videoPath: '/assets/cast-v7-video/finance.mp4',
    posterPath: '/assets/cast-v7-video/finance.jpg',
    accent: '#FB7185',
  },
  {
    slug: 'social',
    name: 'social',
    costume: 'pink puffer, smartphone on a ring-light, hearts and play-icons',
    scene: 'turning every brief into nine-second cuts your audience watches end-to-end',
    imagePath: '/assets/cast-v7/social.png',
    videoPath: '/assets/cast-v7-video/social.mp4',
    posterPath: '/assets/cast-v7-video/social.jpg',
    accent: '#F472B6',
  },
  {
    slug: 'founder',
    name: 'founder',
    costume: 'black turtleneck, dashboard floating, rocket-ship doodle',
    scene: 'thinking three moves ahead while the team ships the current one',
    imagePath: '/assets/cast-v7/founder.png',
    videoPath: '/assets/cast-v7-video/founder.mp4',
    posterPath: '/assets/cast-v7-video/founder.jpg',
    accent: '#67E8F9',
  },
];

export function getCastMember(slug: string): AgentCastMember | null {
  return AGENT_CAST.find((c) => c.slug === slug) ?? null;
}

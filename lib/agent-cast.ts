// AgentCast data: brocco-croc character vignettes per agent.
// Each entry binds an agent slug to a costume + scene caption.
// Image paths intentionally set to null so the CastPlaceholder renders
// the per-agent costume composition (brocco-mark + accessories + scene
// props) instead of a raster photo. To swap in AI-generated character
// images, regenerate via docs/internal/MEDIA_TOOLCHAIN.md and set
// imagePath to /assets/cast/<slug>-v4.jpg.

export interface AgentCastMember {
  slug: string;
  name: string;
  costume: string;
  scene: string;
  imagePath: string | null;
  videoPath: string | null;
  posterPath?: string | null;
  accent: string;
}

export const AGENT_CAST: AgentCastMember[] = [
  {
    slug: 'researcher',
    name: 'researcher',
    costume: 'wire-frame glasses, paper in hand, desk lamp glow',
    scene: 'behind a small wooden desk, books and folders piled high, sticky notes orbiting like thought bubbles',
    imagePath: null,
    videoPath: null,
    accent: '#67E8F9',
  },
  {
    slug: 'planner',
    name: 'planner',
    costume: 'sleeves up, marker in hand, half-eaten sandwich',
    scene: 'standing at a giant whiteboard mapping a 7-phase launch with arrows and timelines',
    imagePath: null,
    videoPath: null,
    accent: '#FB7185',
  },
  {
    slug: 'outreach',
    name: 'outreach',
    costume: 'thin headset, casual blazer, mug of coffee',
    scene: 'hunched over a laptop sending personalized cold emails, color-coded reply piles fanned out',
    imagePath: null,
    videoPath: null,
    accent: '#FBBF24',
  },
  {
    slug: 'designer',
    name: 'designer',
    costume: 'paint-flecked apron, oversized headphones, stylus pen',
    scene: 'sketching a moodboard on a tablet, color swatches and reference prints pinned around',
    imagePath: null,
    videoPath: null,
    accent: '#F472B6',
  },
  {
    slug: 'analyst',
    name: 'analyst',
    costume: 'rolled sleeves, calculator pin, tie loosened',
    scene: 'dual monitors with charts, hand on a coffee, scribbling on a printed report',
    imagePath: null,
    videoPath: null,
    accent: '#A78BFA',
  },
  {
    slug: 'coder',
    name: 'coder',
    costume: 'oversized hipster glasses, faded hoodie, mechanical keyboard',
    scene: 'hunched over a glowing laptop, energy drink cans, sticky notes covered in sketches',
    imagePath: null,
    videoPath: null,
    accent: '#4ADE80',
  },
  {
    slug: 'ops',
    name: 'ops',
    costume: 'navy suit, thin cyan tie, sleeves rolled',
    scene: 'at the copy machine feeding documents into a shredder, paper confetti drifting',
    imagePath: null,
    videoPath: null,
    accent: '#22D3EE',
  },
  {
    slug: 'supervisor',
    name: 'supervisor',
    costume: 'cardigan over a button-up, conductor baton, half-glasses',
    scene: 'standing in front of 5 streaming pane mockups, conducting the broadcast like a small orchestra',
    imagePath: null,
    videoPath: null,
    accent: '#22C55E',
  },
  {
    slug: 'browser',
    name: 'browser',
    costume: 'fedora and a pinstripe vest, briar pipe with a curl of smoke',
    scene: 'reclined in a leather wing-back chair, leather case file on the lap, banker\'s lamp glowing green',
    imagePath: null,
    videoPath: null,
    accent: '#67E8F9',
  },
];

export function getCastMember(slug: string): AgentCastMember | null {
  return AGENT_CAST.find((c) => c.slug === slug) ?? null;
}

// Capabilities: the real work the brocco agent team can do for you.
// Each lane is backed by a production pipeline we have already built and run.
// Copy is intentionally free of any private playbooks, keys, or client PII.

export type CapabilityDemo = 'site' | 'content' | 'outreach' | 'market' | 'research' | 'none';

export type Capability = {
  slug: string;
  name: string;
  /** short emoji used on hub cards, matches the /tools visual language */
  icon: string;
  /** one-line pitch */
  tagline: string;
  /** the lane / category label */
  lane: string;
  /** longer hero subhead on the detail page */
  hero: string;
  /** concrete things the team does in this lane */
  what: string[];
  /** how it runs, in order */
  steps: { title: string; body: string }[];
  /** real tooling under the hood (industry-standard, no secrets) */
  stack: string[];
  /** outcomes the customer gets */
  outcomes: string[];
  /** which interactive demo to mount, if any */
  demo: CapabilityDemo;
  /** primary call to action label */
  cta: string;
  /** members of the cast that lead this lane */
  team: string[];
  /** accent gradient for the hub card hover glow */
  accent: string;
};

export const capabilities: Capability[] = [
  {
    slug: 'website-builder',
    name: 'Website & Storefront Builder',
    icon: '🌐',
    tagline: 'describe a business. the team ships a real site.',
    lane: 'build',
    hero:
      'Tell brocco what you sell and who it is for. The team plans the pages, writes the copy, designs the layout, and hands you a deploy-ready site or storefront.',
    what: [
      'Full marketing sites: hero, features, pricing, FAQ, contact.',
      'Storefronts and booking landers wired for conversion.',
      'Brand voice, copy, and SEO metadata written for you.',
      'Mobile-first, accessible, and fast by default.',
    ],
    steps: [
      { title: 'brief', body: 'You describe the business in plain language. One sentence is enough to start.' },
      { title: 'plan', body: 'A strategist agent maps the page structure and the conversion path.' },
      { title: 'build', body: 'Design and copy agents work in parallel to produce the pages.' },
      { title: 'ship', body: 'You get a preview, then a one-click deploy to your domain.' },
    ],
    stack: ['Next.js', 'Tailwind', 'Vercel', 'Stripe', 'generated copy + SEO'],
    outcomes: [
      'From idea to live site in minutes, not weeks.',
      'Conversion-oriented structure baked in.',
      'Yours to edit, export, and own.',
    ],
    demo: 'site',
    cta: 'try the builder',
    team: ['strategist', 'designer', 'copywriter', 'engineer'],
    accent: 'from-cyan/10 to-transparent',
  },
  {
    slug: 'content-studio',
    name: 'Content & Video Studio',
    icon: '🎬',
    tagline: 'scripts, images, voiceover, and short-form video on autopilot.',
    lane: 'create',
    hero:
      'brocco turns a topic into a full content package: hooks, scripts, images, voiceover, and edited short-form video, on a posting cadence you set.',
    what: [
      'Hooks and scripts tuned for retention.',
      'Generated images and product shots.',
      'Voiceover and music beds.',
      'Edited short-form video with captions, ready to post.',
    ],
    steps: [
      { title: 'topic', body: 'Give a theme, product, or angle. The team proposes a content slate.' },
      { title: 'write', body: 'Hook, script, and caption agents draft and cross-check each other.' },
      { title: 'produce', body: 'Image, voice, and video agents render the assets in parallel.' },
      { title: 'schedule', body: 'Pieces queue to your channels on a cadence you control.' },
    ],
    stack: ['Higgsfield', 'Kling', 'ElevenLabs', 'Seedance', 'Ayrshare scheduling'],
    outcomes: [
      'A repeatable content engine, not a one-off.',
      'Days of production compressed into a single run.',
      'Consistent posting without a creative team.',
    ],
    demo: 'content',
    cta: 'plan a content run',
    team: ['hook writer', 'scriptwriter', 'art director', 'editor'],
    accent: 'from-brand/10 to-transparent',
  },
  {
    slug: 'outreach-engine',
    name: 'Outreach & Lead Engine',
    icon: '📣',
    tagline: 'find the right people, write the message, follow up.',
    lane: 'grow',
    hero:
      'brocco builds and runs an outreach machine: it sources leads, segments them, drafts personalized messages, and manages multi-touch follow-up. Sending stays under your control.',
    what: [
      'Lead sourcing and list building.',
      'Segmentation and enrichment.',
      'Personalized email and SMS drafts.',
      'Multi-touch follow-up sequencing and reply triage.',
    ],
    steps: [
      { title: 'target', body: 'Define the audience. The team builds and enriches the list.' },
      { title: 'draft', body: 'Copy agents write per-segment messages in your voice.' },
      { title: 'review', body: 'You approve. Nothing sends without your sign-off.' },
      { title: 'follow up', body: 'Sequenced touches and reply classification keep the pipeline warm.' },
    ],
    stack: ['Smartlead', 'Twilio', 'Hunter', 'n8n', 'reply classifier'],
    outcomes: [
      'A full pipeline instead of scattered cold messages.',
      'Personalization at volume.',
      'You stay in the approval loop for every send.',
    ],
    demo: 'outreach',
    cta: 'preview a campaign',
    team: ['researcher', 'copywriter', 'sequencer', 'triage'],
    accent: 'from-cyan/10 to-brand/5',
  },
  {
    slug: 'market-intel',
    name: 'Market & Research Intel',
    icon: '📈',
    tagline: 'live dashboards and decision-ready research.',
    lane: 'decide',
    hero:
      'brocco watches markets and signals, runs simulations, and turns the noise into read-only dashboards and briefs you can act on. Research and monitoring only, no trades placed on your behalf.',
    what: [
      'Signal monitoring across markets and social platforms.',
      'Strategy backtesting and simulation in shadow mode.',
      'Virality and trend scoring.',
      'Read-only dashboards and daily briefs.',
    ],
    steps: [
      { title: 'connect', body: 'Point the team at the markets, feeds, or accounts you care about.' },
      { title: 'model', body: 'Strategy agents simulate and score scenarios in shadow mode.' },
      { title: 'surface', body: 'Findings render as dashboards and a plain-language brief.' },
      { title: 'decide', body: 'You make the call. brocco never executes trades for you.' },
    ],
    stack: ['backtesting engine', 'Apify', 'ML scoring', 'shadow-mode sim'],
    outcomes: [
      'Signal instead of noise.',
      'Decisions backed by simulation, not vibes.',
      'Always read-only and compliant by design.',
    ],
    demo: 'market',
    cta: 'view a sample dashboard',
    team: ['analyst', 'quant', 'scout', 'reporter'],
    accent: 'from-brand/10 to-cyan/5',
  },
  {
    slug: 'deep-research',
    name: 'Deep Research',
    icon: '🔬',
    tagline: 'multi-source, fact-checked reports with citations.',
    lane: 'decide',
    hero:
      'Ask a hard question. brocco fans out across sources, fetches and reads them, adversarially verifies claims, and synthesizes a cited report you can trust.',
    what: [
      'Broad multi-source web sweeps.',
      'Source fetching and close reading.',
      'Adversarial verification of every key claim.',
      'Synthesized, cited report.',
    ],
    steps: [
      { title: 'scope', body: 'The team narrows the question so the answer is actually useful.' },
      { title: 'gather', body: 'Many readers search in parallel across angles.' },
      { title: 'verify', body: 'Skeptic agents try to refute each claim before it survives.' },
      { title: 'synthesize', body: 'You get a clean, cited brief with the uncertainty flagged.' },
    ],
    stack: ['parallel web search', 'source fetch', 'adversarial verify', 'citation synthesis'],
    outcomes: [
      'Fewer hallucinations, more citations.',
      'Hours of reading done in one run.',
      'Confidence levels made explicit.',
    ],
    demo: 'research',
    cta: 'run a research brief',
    team: ['lead researcher', 'readers', 'skeptics', 'editor'],
    accent: 'from-cyan/10 to-transparent',
  },
  {
    slug: 'automation',
    name: 'Automation & Ops',
    icon: '⚙️',
    tagline: 'always-on agents that run your recurring work.',
    lane: 'run',
    hero:
      'brocco can run on a schedule: daily briefings, data pulls, content refills, and pipeline upkeep happen without you in the loop, with a human checkpoint wherever you want one.',
    what: [
      'Scheduled and event-driven agent runs.',
      'Daily briefings and digests.',
      'Self-refilling content and data pipelines.',
      'Human approval gates where it matters.',
    ],
    steps: [
      { title: 'define', body: 'Describe the recurring job and its cadence.' },
      { title: 'wire', body: 'The team builds the workflow and the checkpoints.' },
      { title: 'run', body: 'It executes on schedule and reports back.' },
      { title: 'adjust', body: 'Tune the cadence or the rules any time.' },
    ],
    stack: ['cron / scheduled agents', 'n8n', 'webhooks', 'approval gates'],
    outcomes: [
      'Recurring work runs itself.',
      'You get reports, not chores.',
      'Control stays with you via approval gates.',
    ],
    demo: 'none',
    cta: 'talk to the team',
    team: ['orchestrator', 'workers', 'reporter'],
    accent: 'from-brand/10 to-transparent',
  },
];

export const capabilityLanes = ['build', 'create', 'grow', 'decide', 'run'] as const;

export function getCapability(slug: string): Capability | undefined {
  return capabilities.find((c) => c.slug === slug);
}

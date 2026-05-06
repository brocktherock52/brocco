# brocco · design craft research sweep · 2026-05-06

> Cross-discipline research dossier produced before the next round of
> brocco.ai upgrades. Covers web dev, visual aesthetics, motion
> dynamics, framer techniques, image/video gen tooling, and reference
> sites. Use this as the working brief for the v4 push.

---

## 1. visual aesthetics — what 2026 looks like

The dominant aesthetic for serious agentic AI products is **dark
glassmorphism + gradient mesh + bold typography**. Sources converge on
the same five moves:

1. **Dark mode is default**, not a toggle. New designs ship dark, light
   is the secondary surface.
2. **Glassmorphism evolved**. 2026 is frosted panels, translucent
   surfaces, diffused shadows, layered depth used as a functional
   layer (not a sticker). Pair with dark mode + gradient backdrops.
3. **Gradient mesh**. Vibrant orbs of color (deep purples, neon blues,
   hot pinks) floating behind the UI. Radial + linear blends layered
   for full-screen depth without heavy animation.
4. **Bold typography-led layouts**. Big display type does the work
   illustration used to. Editorial italic accents + mono for technical
   surfaces.
5. **Linear-style "calm interface" hierarchy**. Not every element
   carries equal weight; central task elements stay in focus, support
   elements recede.

Sources:
- [Dark Glassmorphism 2026 (Medium)](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f)
- [Web Design Trends 2026 (Figma)](https://www.figma.com/resource-library/web-design-trends/)
- [Vercel Blueprint Grid guide](https://www.setproduct.com/blog/complete-guide-to-blueprint-grid-design)
- [Linear's calmer interface (Linear blog)](https://linear.app/now/behind-the-latest-design-refresh)
- [LogRocket: linear design](https://blog.logrocket.com/ux-design/linear-design/)

**brocco status:** ✅ Already on the right side of all five. Dark UI,
glass cards, gradient glows in `BreathingBg`, big editorial display
type with serif italic accents, Linear-style calm hierarchy.
**Gap:** consider a single 3D / WebGL hero element for the next
iteration (see §6).

---

## 2. motion dynamics — what advanced framer looks like

Motion v12 (formerly Framer Motion) is the production standard. The
2026 advanced playbook:

1. **Variants for orchestration**. Named JS objects (`hidden`,
   `show`) cascade through the component tree — set them once on a
   parent, every child with matching variants animates in sync.
2. **`stagger` function**. `transition: { delayChildren: stagger(0.1) }`
   staggers children from first to last. Reverse, custom-from
   midpoints, and per-axis variants supported.
3. **Layout animations + `layoutId`**. Set `layoutId` on a component
   and Motion auto-animates the morph between its old and new
   positions across mounts/unmounts. Shared-element transitions
   without manual choreography.
4. **`AnimatePresence` for exit animations**. Wrap conditional
   children to get true exit transitions, including for route
   changes.
5. **Scroll-linked animations**. `useScroll` + `useTransform` map
   scroll progress 0..1 to any motion value (rotate, scale, opacity,
   translate). The 2026 idiom is a 2-3 layer parallax stack — bg / mid
   / fg — with each layer at a different speed.
6. **Spring physics on cursor interactions**. `useMotionValue` ->
   `useSpring` smooths cursor-driven transforms so they feel
   physical, not robotic. Stiffness 60-80, damping 18-22 is the sweet
   spot for "premium" feel.
7. **Orchestration props**: `delay`, `delayChildren`, `staggerChildren`,
   `when: 'beforeChildren' | 'afterChildren'`. The `when` prop is
   under-used and powerful — it lets parents fully resolve before
   their children kick off (or vice versa).
8. **Reduced motion**. Wrap with `useReducedMotion()` and serve a
   no-motion fallback. Required for accessibility audits.

Sources:
- [Motion layout animations](https://www.framer.com/motion/layout-animations/)
- [Motion.dev React layout](https://motion.dev/docs/react-layout-animations)
- [Maxime Heckel: advanced patterns](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/)
- [Framer Motion complete guide 2026](https://inhaq.com/blog/framer-motion-complete-guide-react-nextjs-developers)
- [egghead: variants for orchestration](https://egghead.io/lessons/react-link-complex-animations-together-with-variants-from-framer-motion)

**brocco status:**
- ✅ Variants (AnimatedGrid stagger), useScroll/useTransform (HeroAnimated, ScrollHero), spring physics (cursor tilt), AnimatePresence (Nav mega-dropdown, SupportChat).
- ❌ No `layoutId` shared-element transitions yet. Highest-leverage v4 add: when you click an agent card on `/agents`, the avatar morphs from grid position into the profile page's hero via `layoutId="agent-{slug}"`.
- ❌ No `useReducedMotion` honor. Add this for accessibility before launch.

---

## 3. animated illustration — character motion

The user's vision (mascot in different costumes, walking around the
office) requires character animation. Three production paths in 2026:

1. **Lottie / dotLottie** — After Effects → JSON → tiny payload, plays
   anywhere. Best for repeatable looping character animations
   (idle bob, blink, type-on-keyboard). LottieFiles + Lottie Creator
   are the toolchain.
2. **Rive** — interactive state machines. Animations respond to
   inputs (mouse position, scroll, custom variables). Better than
   Lottie when the character should react to user input.
3. **Generated video clips (Higgsfield / Veo / Sora / Grok)** — short
   muted MP4 loops. Highest fidelity. Heaviest payload. Best for
   "hero showpiece" not "9 cards in a grid."

The 2026 award-winning sites pair these: **Lando Norris site**
(Awwwards Site of the Year 2025) uses Rive for character motion +
WebGL for 3D objects + Webflow as the host. That's the production-
grade stack for character-driven storytelling.

Sources:
- [LottieFiles](https://lottiefiles.com/) · [Lottie Creator](https://lottiefiles.com/lottie-creator)
- [Rive runtime docs](https://rive.app/)
- [Awwwards: Best Animation](https://www.awwwards.com/websites/animation/)
- [Lando Norris site (case)](https://futurists.in/10-best-award-winning-websites-of-2026/)

**Recommended path for brocco:**
- Tier 1 (cheapest, best ROI): Generate static Nano Banana 2 stills
  for each cast member. Use them as `imagePath` in `lib/agent-cast.ts`.
- Tier 2 (mid): Generate 4-6s muted MP4 loops for the 3 most
  prominent cast members (researcher, coder, supervisor) via
  Higgsfield or Veo. Drop into `videoPath`. The card auto-switches.
- Tier 3 (hero): Commission a Rive file for ONE animated mascot
  for the hero. Drives the "wait, this is real" moment.

---

## 4. image generation — Nano Banana 2 prompt structure

Confirmed best-practice for **Nano Banana 2 / Gemini 3 Flash Image**:

| Element | What to include |
|---|---|
| Subject | Specific. ("a friendly broccoli-crocodile" not just "a creature") |
| Costume | Specific items, not adjectives ("wire-frame glasses, navy suit, thin cyan tie") |
| Scene | Spatial: where the subject sits/stands, what's around |
| Lighting | Explicit: "soft warm key from camera-left, cyan rim from behind, violet bounce from the lower right" |
| Style ref | Named style ("Pixar / Cartoon Saloon / Mograph", "premium animated-feature") |
| Background | Color + accent pattern + grid |
| Composition | Aspect ratio + camera angle |
| Negative | "no on-image text", "no extra characters" |

**Critical**: write prompts as one fluent paragraph of natural
language. Comma-separated keyword spam underperforms. Specify
**lighting** explicitly — it's the single highest-leverage field.

Per the user's note: future generations should match the **all-white
brand mark** as visual reference. That means:
- Reference the existing `public/assets/brocco-mark-transparent.png`
  in the prompt as "based on the white cartoon crocodile reference"
- All cast illustrations should keep the **white body** of the
  brand mark, with costumes overlaid (suit, fedora, glasses)
- Background remains the dark navy + cyan/violet glow

Sources:
- [Cloud blog: ultimate Nano Banana guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)
- [Google blog: Nano Banana Pro tips](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/)
- [Atlabs: Nano Banana Pro guide 2026](https://www.atlabs.ai/blog/the-ultimate-nano-banana-pro-prompting-guide-mastering-gemini-3-pro-image)
- [Lucidpic prompts directory](https://lucidpic.com/prompts/nano-banana)

---

## 5. video generation — Higgsfield / Veo / Sora / Grok

Each tool reads prompts differently. Don't write one mega-prompt for
all of them.

**Higgsfield** (best for character animation with consistent
identity):
- Image / Identity / Motion — separate prompts per concern
- Camera moves go in the **Motion** prompt only
- Identity changes (face/age/costume) go in **Identity** only
- Short directive prompts beat long descriptive ones

**Veo 3.1** (best for cinematic 16:9 with audio):
- Native sound generation supported
- Strong physics and continuity within a clip
- Cinematic camera language works ("dolly in", "rack focus")

**Sora 2** (best for character coherence over longer clips):
- Cameo system for re-using a specific character across clips
- Up to 25s with native audio

**Grok Imagine** (best for fast iteration):
- Quick turnaround
- Less consistent character identity than Sora/Higgsfield
- Native to X / Grok ecosystem

**Recommended for brocco's cast:** Higgsfield. Generate a static
"identity" image first, then animate with motion prompts like
"camera holds steady, character types on keyboard, head bobs
slightly, cyan eye blinks every 4 seconds, 6-second loop, muted."

Sources:
- [Higgsfield Sora 2 prompt guide](https://higgsfield.ai/sora-2-prompt-guide)
- [Higgsfield prompt format guide](https://blog.segmind.com/higgsfield-ai-prompt-guide-video-creation/)
- [Higgsfield AI video](https://higgsfield.ai/ai-video)
- [Veo Prompt Database](https://ulazai.com/directory/)
- [Grok Imagine 1.0 analysis](https://junaid474.github.io/techblog/blog/grok-and-GrokImagine.html)

---

## 6. site references — what to study for v4

Studied during this sweep, ranked by relevance to brocco:

| Site | Why study it |
|---|---|
| **inference.sh** | Closest aesthetic sibling. Lowercase brand, mega-dropdown nav, agents grid, terminal hero. brocco already mirrors much of this. |
| **linear.app** | Calm hierarchy, type system, gradient discipline, motion-as-restraint. The reference for "premium without busy." |
| **vercel.com** | Terminal hero, Geist type, blueprint grid background, dev-first voice. |
| **lando-norris.com** | Awwwards Site of the Year 2025. Rive + WebGL + Webflow stack for character storytelling. Pattern reference for hero-driven narrative. |
| **clay.com / humata.ai** | Premium dark + structured data UI. Inspiration for `/app` dashboard. |
| **t3.gg / cursor.sh** | Builder voice, technical brand, opinionated copy. Reference for tone. |

---

## 7. deliverable checklist — v4 priorities ranked

Ordered by leverage (most return per session of work):

1. **Generate the cast images** (9 stills + optional 3 video loops).
   This is the only asset gap; the infrastructure is shipped. Use the
   §4 prompt structure with the brand mark as visual reference.
2. **Add `layoutId` shared-element transitions** between `/agents`
   grid card → profile page hero. (~1 hour with Motion variants.)
3. **Add `useReducedMotion()` accessibility honor** site-wide. (~30
   min; required for legitimate launch.)
4. **One WebGL/Rive hero element** for the showpiece. Either a 3D
   broccoli-croc that follows mouse (Spline) or a Rive-rigged
   mascot. Replaces the still mascot center of HeroAnimated.
5. **Tighten copy for builder voice** across `/agents`, `/recipes`,
   `/for/*`. Strip remaining em-dashes (none should ship to prod),
   strip AI vocabulary (delve / leverage / robust / journey /
   seamless).
6. **Cmd+K palette** spanning agents/tools/recipes/for-pages.
   Production must-have for an agentic dashboard.
7. **Public mirror scrub** — the public github.com/brocktherock52/brocco
   was force-pushed and contains internal handoffs. Filter
   sessions/, session_logs/, HANDOFF_NEXT_SESSION.md before next
   public sync.

---

## 8. close

The site is in solid shape: motion dynamics are layered, the
aesthetic palette is correct for 2026, the architecture is data-
driven, and 70+ routes are live. The remaining gap is **character
asset generation** and a couple of advanced motion patterns
(`layoutId`, reduced-motion). Tackle those next session.

End of dossier.

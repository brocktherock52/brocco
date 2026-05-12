# Brocco Design System

Status: **v0.1 — extracted from existing code, not yet rationalized.** This document is the canonical visual reference. When an implementer makes a UI change that contradicts it, either update this doc with reasoning OR change the implementation to match. Don't ship visual changes that contradict the system silently.

Source of truth for tokens: `tailwind.config.ts`. This document describes intent.

---

## ⚠️ Known issue: AI-slop palette risk

The current brand palette uses **violet `#7C3AED` + cyan `#22D3EE`** — exactly the "dark glassmorphism + neon purple/blue gradient" aesthetic that defined every AI-agent startup landing page shipped in 2025-2026. We're saturated into this look.

The design review (2026-05-11) recommended switching to an editorial / warm-tone palette to differentiate. The codebase has not been rebranded.

**Two paths forward:**

- **Path A (recommended by design review):** Switch the brand color to coral `#FF6B5B` or warm amber `#F5A623`, drop the cyan secondary, keep the editorial serif typography. Anti-slop posture. Estimated change: one config file (`tailwind.config.ts`) + a sweep of components that hardcode the old colors. Visible everywhere.
- **Path B (current state):** Keep violet + cyan. Compensate with strong editorial typography, sparse use of the palette, and one (not three) atmospheric layers. Less differentiation, no rebrand work.

The founder has not yet made this call. Both are defensible. New components added to the codebase should NOT hardcode hex values — reference the Tailwind tokens so a future rebrand is a one-line change.

---

## Color tokens

Defined in `tailwind.config.ts → theme.extend.colors`.

| Token | Hex | Purpose |
|---|---|---|
| `bg-0` | `#0A0A0F` | Page background (deep) |
| `bg-1` | `#0E0E16` | Section background |
| `bg-2` | `#13131D` | Card/panel surface |
| `bg-3` | `#1A1A26` | Elevated surface (hover, modal) |
| `ink` | `#E9EEF1` | Primary text |
| `ink-dim` | `#A8B0BC` | Secondary text |
| `ink-faint` | `#6B7280` | Tertiary / metadata |
| `border` | `rgba(255,255,255,0.08)` | Default border |
| `border-strong` | `rgba(255,255,255,0.14)` | Emphasized border |
| **`brand`** | `#7C3AED` | **Primary brand (violet) — slop-risk** |
| `brand-glow` | `#A78BFA` | Brand light/glow |
| `brand-deep` | `#4C1D95` | Brand dark/shadow |
| **`cyan`** | `#22D3EE` | **Secondary accent (cyan) — slop-risk** |
| `cyan-glow` | `#67E8F9` | Cyan light |
| `accent-gold` | `#FBBF24` | Highlight / warning |
| `accent-rose` | `#FB7185` | Destructive / urgent |
| `accent-green` | `#22C55E` | Success / live indicator |

**Accessibility:** all body text uses `ink` (`#E9EEF1`) on a `bg-0`/`bg-1` background. Contrast ratio is well above WCAG AA (4.5:1) — verified at ~16:1.

**Banned in new code:** Don't introduce additional brand colors. Use `accent-gold` / `accent-rose` / `accent-green` for utility colors, or open a PR to discuss a new token.

---

## Typography

Defined in `tailwind.config.ts → theme.extend.fontFamily`.

| Family | Stack | Purpose |
|---|---|---|
| `sans` | Inter, ui-sans-serif, system-ui, ... | Body, UI, navigation |
| `serif` | Newsreader, ui-serif, Georgia, ... | Editorial display, italic accents in hero |
| `mono` | JetBrains Mono, ui-monospace, SFMono-Regular, ... | Code blocks, agent streaming output, cost tickers, timestamps |

**Display sizes** (Tailwind `text-display-{lg,xl,2xl}`):

| Size | Clamp | Use |
|---|---|---|
| `display-2xl` | `clamp(3rem, 7vw, 5.75rem)` | Hero headline |
| `display-xl` | `clamp(2.5rem, 5.5vw, 4.5rem)` | Page hero |
| `display-lg` | `clamp(2rem, 4vw, 3.25rem)` | Section heading |

**Standard sizes**: use Tailwind's default `text-{sm,base,lg,xl,2xl,3xl,4xl}` scale. Body text minimum is `text-base` (16px) — never smaller.

**Banned in new code:**
- `font-family: system-ui` or `font-family: -apple-system` as the PRIMARY display font for any user-visible surface. Always go through the `sans` / `serif` / `mono` tokens. (System fonts are fine as the final fallback, which is how the current stack is configured.)
- Hardcoded font-size values. Use the Tailwind scale.

**Future**: serve Inter + Newsreader + JetBrains Mono as self-hosted webfonts via `next/font` to avoid the "system fallback while webfont loads" flash. Currently relies on the browser to fetch from Google/system. (TODO.)

---

## Spacing

Tailwind defaults. Explicit allowed subset for production components:

`1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32`

**Banned in new code:** off-scale magic numbers (`px-[13px]`, `mt-[27px]`, etc.). If a design requires a value not in the scale, either round to the nearest scale value OR extend `theme.extend.spacing` with a named token and a reason.

---

## Border radius

| Use | Value |
|---|---|
| Sharp / terminal-like (streaming panes, code blocks, mono surfaces) | `rounded-md` (6px) |
| Medium (cards, modals, buttons) | `rounded-xl` (12px) |
| Pill (CTA buttons, badges) | `rounded-full` |

**Banned in new code:** uniform `rounded-2xl` or `rounded-3xl` (16-24px) on every element. The "everything is a bubble" pattern is an AI-slop signal. Sharp surfaces should LOOK sharp.

---

## Motion

Framer Motion 11 (Motion v12). Library is `framer-motion@^11.11.17` in `package.json`.

**Durations** (informal — codify into Tailwind theme.extend.transitionDuration if used widely):

| Purpose | Duration |
|---|---|
| Hover / tap feedback | 150ms |
| Entrance animations | 280ms |
| Page transitions, hero choreography | 600ms |

**Easing**: `cubic-bezier(0.22, 1, 0.36, 1)` (the "ease-out-quint" common in 2026 product design).

**Reduced motion**: **Required.** Every motion-using component MUST wrap in `useReducedMotion()` and serve a static fallback. Without this, the site fails accessibility audits.

Existing animation keyframes (defined in `tailwind.config.ts`):

- `fade-up` (0.6s ease-out) — entrance for content blocks
- `pulse-slow` (3s) — low-frequency pulse for "live" indicators
- `shine` (2.5s) — sweep effect for premium elements
- `float` (6s) — gentle vertical drift for atmospheric elements

---

## Component vocabulary

### Canonical components (use these)

| Component | Path | Purpose |
|---|---|---|
| Hero (post v4.6 merge) | `components/hero-bento.tsx` | Homepage hero with bento layout |
| Atmosphere | `components/breathing-bg.tsx` | The ONE allowed atmospheric layer (slow gradient drift) |
| Nav | `components/nav.tsx` | Site nav. Post v3.0 PR 1: 3 items + Install button + Open app CTA |
| Streaming pane | `components/dashboard/stream-pane.tsx` | Agent live output rendering |
| Pricing | `components/pricing.tsx` | Single-screen pricing |
| Footer | `components/footer.tsx` | Footer with grouped links |
| Install button | `components/install-button.tsx` | PWA install trigger |
| Command palette | `components/command-palette.tsx` | Cmd+K |
| Logo | `components/logo.tsx` | Wordmark |

### Components flagged for review or removal

| Component | Path | Issue |
|---|---|---|
| Old hero | `components/hero.tsx` | Pre-v4.6. Should be moved to `legacy/` or deleted once bento merges. |
| Animated hero | `components/hero-animated.tsx` | Same as above. |
| Terminal hero | `components/hero-terminal.tsx` | Same. |
| Particle field | `components/particle-field.tsx` | Atmospheric overload — flagged by design review as AI-slop signal. Recommend removal. |
| Background decoration | `components/bg-decor.tsx` | Likely overlap with `breathing-bg.tsx`. Audit and consolidate. |
| Animated grid | `components/animated-grid.tsx` | Atmospheric overload. Recommend removal if not load-bearing. |
| AgentsGrid | `components/agents-grid.tsx` | v3.0 spec marked for deletion. If kept, demote to footer. |
| HowItWorks | `components/how-it-works.tsx` | v3.0 spec marked for deletion ("show, don't tell"). |

These have NOT been deleted in this changeset. Removal requires a sweep to confirm they aren't imported elsewhere. File as a TODO under "design debt cleanup."

### Dashboard primitives

| Component | Path | Purpose |
|---|---|---|
| App shell | `components/dashboard/app-shell.tsx` | `/app` layout wrapper |
| Agent card | `components/dashboard/agent-card.tsx` | Per-agent visual card |
| BYOK modal | `components/dashboard/byok-modal.tsx` | Anthropic key entry (localStorage) |
| Stream pane | `components/dashboard/stream-pane.tsx` | Live token streaming |
| Onboarding | `components/dashboard/onboarding.tsx` | First-visit 4-step tour |
| JSONL log | `components/dashboard/jsonl-log.tsx` | Audit log viewer |

---

## Accessibility minimums

- **Contrast:** body text ≥ 4.5:1, large display text ≥ 3:1 (WCAG AA).
- **Focus rings:** 2px solid (use `outline-2 outline-offset-2 outline-brand` or equivalent). Visible on every interactive element. Do NOT use `outline-none` without immediately restoring focus indication via another style.
- **Touch targets:** 44px minimum for buttons on mobile, 48px preferred for primary CTAs.
- **Reduced motion:** `useReducedMotion()` guard on every motion-using component. Static fallback path must exist.
- **Keyboard nav:** Tab order matches visual order. Every interactive element reachable via Tab. Skip-to-main link on long pages.
- **Screen readers:**
  - Streaming panes use `aria-live="polite"` (one region per pane) so partial output is announced.
  - The hero cost ticker uses `aria-live="polite"` and announces on completion only (per-token would be deafening).
  - Decorative images use `alt=""`. Informative images use a real `alt`.
- **Visited links:** must differ in color from unvisited (Krug's billboard rule). Don't override `:visited` with the same color as `:link`.

---

## Anti-slop rules (non-negotiable for new components)

The design review enumerated 10 patterns that flag a UI as AI-generated. Brocco must avoid them all. Repeated here so they're enforceable at PR review:

1. **No purple/violet/indigo gradient backgrounds** *(see "Known issue" above — current state is in violation; new components should not extend the pattern)*
2. **No 3-column feature grid** (icon-in-circle + bold title + 2-line description × 3, symmetric)
3. **No icons inside colored circles** as section decoration
4. **No centered-everything** (`text-align: center` on every heading, description, and card)
5. **No uniform bubbly border-radius** on every element (see "Border radius" — sharp is intentional)
6. **No decorative blobs, floating circles, wavy SVG dividers** beyond the ONE breathing-bg atmospheric layer
7. **No emoji as design elements** (rockets in headings, emoji as bullet points)
8. **No colored left-border on cards** (`border-left: 3px solid <accent>`)
9. **No generic hero copy** ("Welcome to [X]", "Unlock the power of...", "Your all-in-one solution for...")
10. **No cookie-cutter section rhythm** (hero → 3 features → testimonials → pricing → CTA, every section same height)
11. **No `system-ui` / `-apple-system` as the PRIMARY font.** Use the Tailwind `sans` / `serif` / `mono` tokens.

---

## How to extend this document

Open a PR. In the PR description, explain:
1. What you're adding (a new token, a new component canonical, a new rule)
2. Why the existing system doesn't cover it
3. What you propose

If the proposal is approved, update this document AS PART OF the PR that introduces the change. Tokens land here at the same commit they land in `tailwind.config.ts`.

Stale `DESIGN.md` is worse than no `DESIGN.md`. The first time an implementer follows this doc and finds it lying, the trust is gone.

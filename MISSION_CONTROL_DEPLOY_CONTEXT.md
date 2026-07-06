# DEPLOY CONTEXT for the brocco.dev session - READ BEFORE DEPLOYING

Another Claude session built "Mission Control" and integrated it into THIS repo. You are
deploying brocco.dev. Here is everything you need so the deploy is correct and safe.

## TL;DR
- DEPLOY this (it ships automatically with your normal brocco deploy): `public/mission-control/`
- It is plain static files in `public/`, so it does NOT affect the Next build. No new deps, no env vars, no API routes required.
- After deploy, verify these two URLs load and contain NO real/private data:
  - `https://brocco.dev/mission-control`       (landing + pricing page)
  - `https://brocco.dev/mission-control/app`    (live demo)
- DO NOT deploy anything from `admin/command-center/` (that is Brock's PRIVATE local cockpit with his real data). It is a separate local app and must never go public.

## What is in public/mission-control/ (safe, intended public surface)
- `index.html` - marketing landing + pricing. No private data.
- `app/` - a fully playable demo of the cockpit. Uses FICTIONAL sample data (company
  "Apex Operator", 9 made-up ventures). The app forces static mode in the demo (it checks
  `body.demo` and never calls `/api/*`), and the local-only controls (open folder / run
  script / edit / log / Data) are hidden via CSS. Safe.
- `assets/key-art.png` - hero + OG image (nano-banana generated, no text).

## HARD NO-DEPLOY LIST (private / sensitive - keep OUT of any public build)
- `admin/command-center/` - Brock's real 294-venture cockpit. Contains `store.json` /
  `data.js` / `revenue.js` with real venture intel + security flags. NEVER publish.
- `admin/command-center/reports/REORG_PLAN.md` and `admin/SECURITY/*` - enumerate secret file paths.
- Any `.env*`, `*.secrets`, `notion-config.json`, the quarantined secrets (already moved out of
  OneDrive to `C:\Users\gigix\bdp-quarantine\`). Do not re-add or push secrets. Before any
  `git push --all/--tags`, confirm local brocco branches are scrubbed of the old Stripe webhook
  secret (see `docs/internal/HANDOFF_2026-05-27.md`).

## CTAs / wiring (fine to ship as-is, improve later)
- Landing CTAs: "Try the live demo" -> `./app/` (works now). "Get the $29 starter" / "Start free"
  / plan buttons -> `#` placeholders. Wire them to the Gumroad URL + your signup flow when ready
  (the $29 product zip + listing are in `admin/command-center/launch/`).

## Optional next phase (your lane, not required for this deploy)
A per-user, auth-gated cockpit at `/app/mission-control` backed by `/api/mc/{state,venture,
revenue,meeting,import}` keyed to the better-auth user. Schema + contract:
`admin/command-center/reports/INTEGRATION_HANDOFF.md` + `admin/command-center/mc-schema.example.json`.
Reuse `public/mission-control/app/{app.js,theme.css}`. Never serve Brock's real data.

## Ownership / coordination
- Mission Control session owns `admin/command-center/` + the `public/mission-control/` files.
  It will NOT touch your routing/auth/billing/deploy.
- You own brocco routing, auth, billing, and the deploy. If you need changes to the cockpit,
  add a bullet under "Requests" in `docs/internal/MISSION_CONTROL_HANDOFF.md` and that session
  will action it.

## Post-deploy checklist
- [ ] `brocco.dev/mission-control` returns 200 and shows the landing.
- [ ] `brocco.dev/mission-control/app` returns 200, shows "Apex Operator" demo, no console errors.
- [ ] View-source / network on `/mission-control/app`: confirm only the demo data files load
      (data.js shows "Apex Operator"), and there is NO request to Brock's real data.
- [ ] No secret/.env files in the deployed output.

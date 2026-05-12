# Contributing to Brocco

Thanks for considering a contribution. Brocco is solo-maintained, so please file an issue before opening a non-trivial PR — it saves both of us time.

## Filing an issue

Use the GitHub Issues tab at [github.com/brocktherock52/brocco/issues](https://github.com/brocktherock52/brocco/issues). Include:

- What you were trying to do
- What happened (with the `X-Brocco-Request-Id` from response headers if you hit the API)
- What you expected
- Repro steps (curl command preferred for API issues; URL + screenshot for UI issues)
- Your environment: browser/OS for UI bugs, Node version + npm version for build bugs

For security vulnerabilities, DO NOT open a public issue. Email brockpivec@gmail.com directly.

## Setting up locally

```bash
git clone https://github.com/brocktherock52/brocco
cd brocco
npm install
ANTHROPIC_API_KEY=sk-ant-... npm run dev
```

See [`docs/self-host.md`](docs/self-host.md) for the full environment variable list.

## Running tests

```bash
npm run test          # vitest, one-shot
npm run test:watch    # vitest, watch mode
npm run typecheck     # tsc --noEmit
npm run lint          # next lint
```

PRs without passing tests + typecheck will not be merged. CI runs these on every push.

## Writing a PR

1. Fork the repo, branch off `main`.
2. Make your change. Keep the diff focused — one logical change per PR.
3. If you're adding a new feature, write a test for it. If you're fixing a bug, write a regression test first that fails, then make it pass.
4. Update `CHANGELOG.md` under the `[Unreleased]` section.
5. Push to your fork and open a PR against `main`.

## Code style

- TypeScript strict mode is on. No `any` unless commented why.
- Edge runtime everywhere in `app/api/` — no Node-only APIs (`fs`, `Buffer`, etc).
- Prefer named exports over default exports.
- Error handling: every error caught should either retry, surface a structured error envelope (see `lib/errors.ts`), or re-throw with added context. Don't swallow errors silently.
- Tailwind classes are sorted by [Tailwind Prettier plugin](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) order.

## Design changes

UI changes (new components, color/typography/spacing tweaks) should reference [`DESIGN.md`](DESIGN.md). If your change violates the documented system, either update `DESIGN.md` first (with reasoning) or change the design to match. Don't ship visual changes that contradict the system docs silently.

## What gets accepted

In order of likelihood:

1. **Bug fixes with regression tests.** Almost always merged.
2. **Documentation improvements.** Always merged unless the docs are about to change.
3. **New integrations** (OAuth providers, new tools, new agent profiles). File an issue first to confirm scope.
4. **New features.** Open an issue. Brocco is opinionated; features that don't align with the BYOK + broadcast + zero-retention thesis are unlikely to land.
5. **Refactors with no behavior change.** Discouraged unless they unlock a specific roadmap item. The maintainer is solo and code review is the bottleneck.

## What does NOT get accepted

- PRs that add tracking, telemetry, or third-party scripts beyond the existing (consent-gated) PostHog + Vercel Analytics.
- PRs that weaken BYOK security posture (logging keys, sending prompts/outputs to third parties, removing CSP).
- PRs that bundle multiple unrelated changes.
- PRs without passing tests.

## License

By contributing, you agree your contributions will be licensed under the same MIT license that covers the repository.

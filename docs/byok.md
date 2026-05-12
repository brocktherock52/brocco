# BYOK — Bring Your Own Key

Brocco's default mode is BYOK. You paste your Anthropic API key into the `/app` dashboard once, it stays in your browser's `localStorage`, and every Claude call streams from your browser directly to Anthropic.

**We never see your key, your prompts, or your outputs.**

## Why BYOK

You likely already pay for Anthropic. Routing tokens through a third party just to use a multi-agent UI is wasteful and creates a trust problem. BYOK inverts the model: Brocco is a UI layer; Anthropic is the runtime.

The tradeoff: cost transparency is great, but you manage your own quota and your own bills. Brocco's Pricing tiers ($49/$199 monthly) exist for users who want hosted mode (we manage the key) or paid features like scheduled runs, audit logs, and team workspaces. The free BYOK demo is unlimited within your Anthropic quota.

## How BYOK works under the hood

1. You paste your key into the BYOK modal in `/app`.
2. It's stored in `window.localStorage` under the key `brocco_anthropic_key`.
3. On run, the browser builds a streaming `fetch` to `https://api.anthropic.com/v1/messages` with your key in the `x-api-key` header and the `anthropic-dangerous-direct-browser-access: true` flag.
4. Anthropic streams response tokens back to your browser.
5. The UI parses the SSE stream and renders per-token deltas in the agent panes.

The key never touches Brocco's servers. We have no record of it. If you clear `localStorage` (or use a private window), the key is gone.

## Security considerations

Direct-browser-access has a real attack surface: any script running on `brocco.dev` could read your key. We mitigate this with:

- **Strict CSP** that locks down which third-party scripts can run on `/app`. Only Vercel Analytics + (optionally) PostHog can load. No advertising, no tracking pixels on `/app`.
- **No third-party scripts in the runtime path** of the BYOK flow. The BYOK modal and the streaming client are first-party code.
- **Zero data retention claim** is verifiable: our server logs do not contain prompts, outputs, or keys. (Our Stripe webhook logs subscription events. That's it.)

If you're security-paranoid, you should also:

- Run Brocco self-hosted (clone the repo, deploy to your own Vercel) and audit the code yourself.
- Use a project-scoped Anthropic key (Anthropic Console → Settings → API Keys → create a project key) so the blast radius is bounded to that project.
- Set a monthly spend cap on the Anthropic key.

## Revoking your key

There are three layers:

1. **Brocco-side:** open the BYOK modal in `/app`, click **Remove key**. This clears `localStorage`.
2. **Browser-side:** clear site data for `brocco.dev` in your browser settings.
3. **Anthropic-side:** go to the Anthropic Console → API Keys → revoke. The key stops working everywhere immediately.

We strongly recommend doing (3) if you suspect your key has leaked, since (1) and (2) only affect Brocco's storage.

## Hosted mode (paid plans)

If you don't want to manage keys, the paid tiers include hosted mode: you pay $49/$199 monthly and we route through our own Anthropic account. The same `/app` UI; we just use our key instead of yours. Useful for teams, scheduled runs, and "I don't want to think about this" users.

Hosted mode does NOT change our data retention posture. We never log prompts or outputs in either mode.

## Roadmap

- **Server-side BYOK passthrough** (planned). Today, BYOK is browser-direct. A future option will let the server proxy your key from `Authorization: Bearer` header without storing it, useful for backend integrations that can't run JavaScript.
- **Scoped keys.** Today you bring one key. Future: per-recipe / per-workspace key isolation so a leaked key in one workspace doesn't compromise others.

If you have a specific BYOK use case we're missing, [file an issue](https://github.com/brocktherock52/brocco/issues).

# Subscription access and hosted runs

The seven-day, card-required trial includes dashboard preview. Tools require a current active subscription and a paid invoice. A trial's zero-dollar signup invoice never grants tool access. Server checks do not trust the session's cached `plan` field or browser storage.

## Before deploying

Vercel runs `migrations/build-vercel.mjs` before building the app. This applies the additive migration using the deployment's protected `DATABASE_URL`, then runs the Next.js production build. If the migration fails, the build fails before promotion. For a separately configured database, run it from the app root:

```sh
node migrations/apply-billing.mjs
```

The runner reads the configured `DATABASE_URL` without printing it. It creates `billing_customers` and `hosted_usage`, with indexes and constraints, in one transaction. It does not alter or remove existing tables. It is safe to rerun. Missing tables cause billing/hosted verification to fail closed.

Configure `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, the plan's `STRIPE_PRICE_*` values, and the app's existing authentication/database settings. Hosted AI additionally requires `ANTHROPIC_API_KEY`; web search requires `TAVILY_API_KEY`. Without the hosted key, pricing and payment screens disclose that live tools require the customer's own API key, billed separately by their provider. Trial setup reads the configured Stripe prices rather than a hardcoded checkout amount. The server pins Stripe API version `2025-04-30.basil`.

The Stripe webhook must deliver checkout completion, invoice payment success/failure, and subscription lifecycle events. Runtime access reads current Stripe state, so late or duplicate events cannot restore canceled access. Customer ownership is persisted independently of mutable billing emails. Webhook updates keep the legacy display-only plan field consistent.

## API contract

- `GET /api/billing/access`: returns `BillingAccess` from `lib/billing-types.ts`. Amounts are minor currency units, `trialEndsAt` is Unix milliseconds. Historical subscribers can still open their dashboard to manage payment; tools remain locked.
- `GET /api/billing/plans`: configured Stripe prices and availability, with `trialDays: 7`. Plan interval is `monthly` or `annual` here; access price interval is `month` or `year`.
- `POST /api/checkout`: authenticated `{tier, interval}`. Creates a preview trial, reuses an equivalent open checkout, or returns the existing subscription. A new plan choice expires the user's unfinished checkout for the previous plan. It never accepts a caller-supplied customer/email as ownership.
- `POST /api/billing/activate`: `{confirm: true, subscriptionId, requestId, price: {amount, currency, interval}}`. The UI must explain the immediate payment and lost remaining trial, display the price, and receive explicit consent. Generate a UUID per deliberate payment attempt and retain it across uncertain network retries. Stale price returns `409` and current access for renewed consent.
- `POST /api/portal`: authenticated JSON request. Customer ownership is resolved on the server; caller-supplied customer IDs are ignored.

Activation ends the **existing** trial with a deterministic per-trial idempotency key and `default_incomplete`, then finalizes its invoice without automatic collection. It compares the actual invoice amount/currency with the customer's explicit confirmation before attempting payment of that same invoice. A different or unknown total returns `409` and requires review on Stripe's hosted invoice page; no payment is attempted. It never creates a second subscription. Only a fresh Stripe check can unlock tools. `200` returns paid access; `202` returns still-locked access while payment is pending. An unpaid invoice may supply `paymentUrl`, a Stripe hosted invoice page for 3DS authentication or card recovery. An interrupted invoice-finalization attempt can be resumed without ending the trial twice.

`/api/v1/run` and `/api/proxy` enforce paid access on the server. The browser BYOK dispatcher independently checks the same access before using a user-supplied key. Hosted runs stream real agent output; they do not substitute simulator results. Hosted attachments currently return an explicit unsupported-input error; BYOK attachments remain supported.

## Hosted resource limits

Each hosted agent invocation reserves one run atomically before contacting the provider. Limits per UTC calendar month/day are Solo 2,000/100, Team 10,000/500, and Wholesaler 1,000/50. Parallel agents each count once. Provider failures after reservation consume the attempt. A run is limited to six tool steps, 2,048 output tokens per model step, and a 60-second wall-clock limit. Subscription access is still required when using BYOK; provider spending then belongs to the user's key and does not consume hosted allowance.

## Validation

Run `npm run test` and `npm run typecheck`, followed by the production build and conversion-flow browser tests. The billing tests mock Stripe and verify unpaid denial, invoice recovery, idempotency, stale prices, ownership, wrong-plan checkout replacement, webhook retry, and hosted streaming. They do not create live subscriptions or charge cards. A Stripe test-mode checkout and 3DS trial-to-paid payment are still needed to verify the external account configuration end to end.

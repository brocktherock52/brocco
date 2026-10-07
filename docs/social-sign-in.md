# Google and Apple account sign-in

`/signup` and `/login` share the real Better Auth account flow. Signup defaults to `/start` for plan selection and the card-required trial; login defaults to `/app`. Both email and social sign-in preserve a safe local `callbackURL`, including the selected plan. Account creation itself does not grant paid access.

The server derives button availability from its credentials on each page request. Missing providers are visibly unavailable; email sign-in remains available. Secrets are never sent to the browser. Adding credentials requires a new Vercel deployment (or restarting local development), with no UI feature flag.

## Google

Create a Web Application OAuth client in Google Cloud and configure the consent screen for the intended audience. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the deployment environment. Register these exact authorized redirect URIs as appropriate:

- Production: `https://brocco.dev/api/auth/callback/google`
- Development: `http://localhost:3000/api/auth/callback/google`

The production origin must match `NEXT_PUBLIC_BASE_URL` (or `BETTER_AUTH_URL`). The existing Gmail/Calendar integration uses separate `GOOGLE_OAUTH_*` credentials and a different callback. Account sign-in requests only the default identity scopes. See [Better Auth's Google setup](https://better-auth.com/docs/authentication/google).

## Apple

In an active Apple Developer account, enable Sign in with Apple on an App ID, create a linked Service ID for the website, and register `brocco.dev` with return URL `https://brocco.dev/api/auth/callback/apple`. Create a Sign in with Apple key. Set these server environment variables:

| Variable | Value |
| --- | --- |
| `APPLE_CLIENT_ID` | Website Service ID |
| `APPLE_TEAM_ID` | Developer team ID |
| `APPLE_KEY_ID` | Signing key ID |
| `APPLE_PRIVATE_KEY` | Downloaded `.p8` contents; literal newlines or escaped `\n` are accepted |

The server signs a fresh one-hour ES256 client-secret JWT when Better Auth resolves the provider. This avoids a six-month manually generated secret expiring unnoticed. As an alternative, set `APPLE_CLIENT_SECRET` to an Apple client-secret JWT and rotate it before expiration; expired or malformed JWTs disable the button. A complete private-key configuration takes precedence.

Apple requires a public HTTPS domain. The Apple button stays unavailable on localhost, HTTP, or IP-based origins, even with credentials. Use a registered HTTPS development domain to test Apple. The auth configuration trusts Apple's callback origin. Better Auth 1.6.11 converts Apple's form POST to a same-origin GET before checking OAuth state, so session/state cookies retain `SameSite=Lax`; CSRF/state checks remain enabled. See [Better Auth's Apple setup](https://better-auth.com/docs/authentication/apple).

## Validation

Run `npm run test -- __tests__/auth-config.test.ts` and `npm run typecheck`. The tests verify provider availability, Apple JWT signatures and rotation, and callback rejection/preservation. No live credentials or user data are used.

After configuring each provider, perform a real signup and returning login on its registered origin, confirm the same account/session persists, confirm the selected plan survives the redirect, and cancel once at the provider to check the recoverable error. Also verify the email fallback. Provider redirects alone do not validate the full OAuth exchange.

On 2026-10-07, a names-only check of the linked `brocco-site` production environment and the workspace vault found no Google or Apple sign-in credentials. Full live social sign-in remains dependent on provider account configuration; the code does not fabricate or bypass it.

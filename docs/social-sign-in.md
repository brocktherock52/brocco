# Google and Apple account sign-in

`/signup` and `/login` share the real Better Auth account flow. Signup defaults to `/start` for plan selection and the card-required trial; login defaults to `/app`. Both email and social sign-in preserve a safe local `callbackURL`, including the selected plan. Account creation itself does not grant paid access.

The server derives button availability from its credentials on each page request. Missing providers are visibly unavailable; email sign-in remains available. Secrets are never sent to the browser. Adding credentials requires a new Vercel deployment (or restarting local development), with no UI feature flag.

## Google

Create a dedicated Web Application OAuth client in Google Cloud and configure the consent screen for an External audience for the public app. Use the display name `Brocco` and a production client name such as `Brocco Web Production`. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the deployment environment. Register these exact authorized redirect URIs in separate production and development projects:

- Production: `https://brocco.dev/api/auth/callback/google`
- Development: `http://localhost:3000/api/auth/callback/google`

The production origin must match `NEXT_PUBLIC_BASE_URL` (or `BETTER_AUTH_URL`). Use `brocco.dev` as the authorized domain, `https://brocco.dev` as the homepage, `https://brocco.dev/privacy` as the privacy policy, and `https://brocco.dev/terms` as the terms URL. This server redirect flow does not require a JavaScript origin; if one is configured, use only `https://brocco.dev` for production. Keep localhost and preview deployments out of the production client.

Use an authorized, monitored support/contact email. Verify domain ownership with the Google project owner/editor account, then verify and publish the Brocco branding. Identity scopes do not need sensitive-scope review, but displaying the app name/logo in public consent requires brand verification. Capture the client secret securely when creating the client. See [Google's production requirements](https://developers.google.com/identity/verification/authentication-policy-compliance) and [brand verification](https://developers.google.com/identity/verification/authentication-verification).

The existing Gmail/Calendar integration uses separate `GOOGLE_OAUTH_*` credentials and a different callback. Account sign-in requests only `openid`, `email`, and `profile`; it does not request mailbox or calendar access. See [Better Auth's Google setup](https://better-auth.com/docs/authentication/google).

## Apple

Apple's [official environment setup](https://developer.apple.com/documentation/signinwithapple/configuring-your-environment-for-sign-in-with-apple) requires an existing App Store app using Sign in with Apple for web authentication. Confirm a qualifying Brocco app and active Developer team access before treating Apple setup as complete; creating an otherwise unused App ID alone does not establish this prerequisite.

Enable Sign in with Apple on the app's primary App ID, create a linked Services ID for the website, and register `brocco.dev` with return URL `https://brocco.dev/api/auth/callback/apple`. A Brocco-only Services ID such as `dev.brocco.web` is suitable if available; use the actual registered value below. Create a Sign in with Apple key associated with the primary App ID. Set these server environment variables:

| Variable | Value |
| --- | --- |
| `APPLE_CLIENT_ID` | Website Service ID |
| `APPLE_TEAM_ID` | Developer team ID |
| `APPLE_KEY_ID` | Signing key ID |
| `APPLE_PRIVATE_KEY` | Downloaded `.p8` contents; literal newlines or escaped `\n` are accepted |

The server signs a fresh one-hour ES256 client-secret JWT when Better Auth resolves the provider. This avoids a six-month manually generated secret expiring unnoticed. As an alternative, set `APPLE_CLIENT_SECRET` to an Apple client-secret JWT and rotate it before expiration; expired or malformed JWTs disable the button. A complete private-key configuration takes precedence.

Apple requires a public HTTPS domain. The Apple button stays unavailable on localhost, HTTP, or IP-based origins, even with credentials. Use a registered HTTPS development domain to test Apple. The auth configuration trusts Apple's callback origin. Better Auth 1.6.11 converts Apple's form POST to a same-origin GET before checking OAuth state, so session/state cookies retain `SameSite=Lax`; CSRF/state checks remain enabled. See [Better Auth's Apple setup](https://better-auth.com/docs/authentication/apple).

Register the actual sign-in email sender/domain with Apple's [private email relay service](https://developer.apple.com/help/account/capabilities/configure-private-email-relay-service/) and configure the matching SPF/DKIM authentication. Test a Hide My Email address. Unregistered sources can bounce; Resend's fallback sender does not replace configuring the production sending domain. Website sign-in uses only the default `name` and `email` scopes.

## Validation

Run `npm run test -- __tests__/auth-config.test.ts` and `npm run typecheck`. The tests verify provider availability, Apple JWT signatures and rotation, and callback rejection/preservation. No live credentials or user data are used.

After configuring each provider, perform a real signup and returning login on its registered origin, confirm the same account/session persists, confirm the selected plan survives the redirect, and cancel once at the provider to check the recoverable error. Also verify the email fallback. Provider redirects alone do not validate the full OAuth exchange.

On 2026-10-07, configured Google in the dedicated `brocco-account-signin` project with the `Brocco Web Production` web client, the exact production origin/callback above, Brocco's homepage/privacy/terms URLs, and the `brocco.dev` authorized domain. The External app is in production with only OpenID, email, and profile scopes. Google credentials are sensitive production variables in Vercel; temporary local copies were deleted. The rebuilt deployment was promoted to `https://brocco.dev`, where the Google button is enabled. A full real-user consent/callback/session test remains outstanding, and brand verification has not been claimed.

Apple credentials are still absent. The signed-in account remains unenrolled in the Developer Program; enrollment and the qualifying app setup are prerequisites. The Apple button remains unavailable and email sign-in remains enabled.

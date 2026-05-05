# brocco.ai custom domain — DNS + Vercel setup

Goal: point `brocco.ai` (apex) and `www.brocco.ai` at the existing Vercel project `brocktherock52s-projects/brocco-site`.

---

## 1. Buy the domain (if not already)

Use the registrar of your choice. Cheapest options for `.ai`:
- Cloudflare Registrar (~$70/yr, no markup, comes with great DNS)
- Namecheap (~$80/yr, simple control panel)
- Google Domains has wound down — skip.

If `brocco.ai` is already registered to someone else, fall back to:
- `bro.cc` (cute, very short)
- `getbrocco.com`
- `usebrocco.com`
- `brocco.app`

For the rest of this guide we assume `brocco.ai` is yours.

---

## 2. Add the domain in Vercel

```powershell
# from arms/brocco_site/
vercel domains add brocco.ai
vercel domains add www.brocco.ai
```

That registers the apex + www to the Vercel team. Vercel will display the
DNS records you need to set at your registrar.

Alternative GUI path: Vercel dashboard → `brocco-site` project → Settings →
Domains → Add → enter `brocco.ai` and `www.brocco.ai`.

---

## 3. DNS records at the registrar

You will see one of two prompts depending on whether your registrar
supports ALIAS/ANAME at the apex.

### Option A — Cloudflare / DNSimple / Route53 (apex ALIAS supported)

| Type   | Name | Value                | TTL  | Proxy |
|--------|------|----------------------|------|-------|
| ALIAS  | @    | cname.vercel-dns.com | Auto | OFF   |
| CNAME  | www  | cname.vercel-dns.com | Auto | OFF   |

On Cloudflare specifically: turn the orange-cloud Proxy **OFF** for both
records. Vercel handles its own TLS; double-proxying breaks Edge functions
and cache headers.

### Option B — Namecheap / GoDaddy (no apex ALIAS)

Use the A-record fallback Vercel publishes:

| Type  | Name | Value         | TTL  |
|-------|------|---------------|------|
| A     | @    | 76.76.21.21   | Auto |
| CNAME | www  | cname.vercel-dns.com | Auto |

(The IP above is Vercel's anycast frontend. Confirm the current value when
Vercel prompts you in step 2.)

---

## 4. Tell Vercel what's primary

Decision: `brocco.ai` should be canonical. `www.brocco.ai` should redirect
to it. Do this in the Vercel dashboard:

- Open `brocco-site` → Settings → Domains
- On `www.brocco.ai`, click Edit → "Redirect to brocco.ai" → Permanent (308)

Or via CLI:

```powershell
vercel domains buy brocco.ai     # only if you want to buy through Vercel
# the redirect rule is dashboard-only; CLI does not expose it
```

---

## 5. Update site env + metadata after switchover

Once the domain resolves, update the Vercel env so the OG image, sitemap,
and Stripe callbacks use the new origin:

```powershell
vercel env rm APP_URL production
echo "https://brocco.ai" | vercel env add APP_URL production
vercel env rm NEXT_PUBLIC_SITE_URL production
echo "https://brocco.ai" | vercel env add NEXT_PUBLIC_SITE_URL production
vercel deploy --prod --yes
```

In code, the canonical site URL is set in `app/layout.tsx`:

```ts
const SITE_URL = 'https://brocco-site.vercel.app';
```

After domain switchover, change this to `'https://brocco.ai'` in a single
PR. The metadata `metadataBase`, sitemap, and OG fetch all use this
constant, so one change cascades.

---

## 6. Stripe webhook endpoint

The Stripe webhook is currently registered against
`https://brocco-site.vercel.app/api/stripe-webhook`. Update it:

1. Stripe Dashboard → Developers → Webhooks → click the `we_*` endpoint.
2. Edit URL → `https://brocco.ai/api/stripe-webhook`.
3. Save. The signing secret stays the same (`STRIPE_WEBHOOK_SECRET`).

Stripe will continue accepting both URLs for ~24h via DNS, so there is no
gap if you switch the URL after the DNS resolves.

---

## 7. Verification checklist

```powershell
# Apex resolves
nslookup brocco.ai
# Expect: cname.vercel-dns.com OR 76.76.21.21

# www resolves and 308s to apex
curl -sI https://www.brocco.ai/ | findstr /R "^HTTP location"
# Expect: HTTP/1.1 308 Permanent Redirect → location: https://brocco.ai/

# Apex serves a 200 and the new logo
curl -sI https://brocco.ai/ | findstr "HTTP"
curl -sI https://brocco.ai/icon.png | findstr "HTTP"

# OG renders with the new domain
curl -sI https://brocco.ai/opengraph-image | findstr "HTTP"

# Stripe checkout returns a brocco.ai success URL
curl -sX POST https://brocco.ai/api/checkout -H "content-type: application/json" -d "{\"tier\":\"solo\",\"interval\":\"monthly\"}"
# Expect: { "url": "https://checkout.stripe.com/..." }
```

---

## 8. Post-switch follow-ups

- Update `marketing/meta-ugc-ads.md`: replace `brocco-site.vercel.app` with `brocco.ai` in all UTM params and landing URLs.
- Update Twitter / X handles: link to `https://brocco.ai` instead of the Vercel preview.
- Email signature, Calendly, Whop, Linktree: same.
- Add `301` redirects at `brocco-site.vercel.app/*` → `brocco.ai/*` once DNS is stable. Vercel does this automatically when both domains live on the same project.

---

## Rollback plan

If anything breaks, the Vercel preview alias `brocco-site.vercel.app` keeps working forever. To temporarily route traffic back:

1. Vercel dashboard → Domains → set `brocco.ai` to "Inactive" (or remove).
2. Tell users to hit `brocco-site.vercel.app` until you re-enable.
3. Rerun this guide once the issue is fixed.

DNS TTL on most registrars is 5-15 minutes once you set Auto, so rollback is fast.

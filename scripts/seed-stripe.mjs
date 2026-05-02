/* One-time bootstrap: create brocco.ai Stripe Products + Prices.
   Run once locally with: node scripts/seed-stripe.mjs

   Requires STRIPE_API_KEY in env. Uses the Stripe REST API directly
   (no SDK install required). Outputs the price IDs to paste into
   `vercel env add STRIPE_PRICE_*_*`.
*/

import { request } from 'node:https';

const KEY = process.env.STRIPE_API_KEY;
if (!KEY) {
  console.error('Set STRIPE_API_KEY in env first (sk_test_... for testing).');
  process.exit(1);
}

function call(path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? new URLSearchParams(body).toString() : '';
    const req = request({
      hostname: 'api.stripe.com',
      path: `/v1${path}`,
      method: body ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => chunks += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(chunks);
          if (res.statusCode >= 400) reject(new Error(`stripe ${res.statusCode}: ${json?.error?.message || chunks}`));
          else resolve(json);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Creating Solo product...');
  const solo = await call('/products', {
    name: 'Brocco Solo',
    description: 'Multi-agent AI dashboard for solo founders.',
  });
  console.log('  product:', solo.id);

  console.log('Creating Team product...');
  const team = await call('/products', {
    name: 'Brocco Team',
    description: 'Brocco for ops teams. SSO, audit logs, shared agents.',
  });
  console.log('  product:', team.id);

  const prices = [
    ['Solo monthly $49', solo.id, 4900,  'month', 'solo_monthly'],
    ['Solo annual $490', solo.id, 49000, 'year',  'solo_annual'],
    ['Team monthly $199', team.id, 19900, 'month', 'team_monthly'],
    ['Team annual $1990', team.id, 199000,'year',  'team_annual'],
  ];

  const ids = {};
  for (const [name, product, amount, interval, lookup] of prices) {
    console.log(`Creating price: ${name}...`);
    const p = await call('/prices', {
      product, currency: 'usd', unit_amount: String(amount),
      'recurring[interval]': interval, lookup_key: lookup,
    });
    console.log('  price:', p.id);
    ids[lookup] = p.id;
  }

  console.log('\n--- Add these to Vercel env ---');
  console.log(`vercel env add STRIPE_PRICE_SOLO_MONTHLY production    # ${ids.solo_monthly}`);
  console.log(`vercel env add STRIPE_PRICE_SOLO_ANNUAL production     # ${ids.solo_annual}`);
  console.log(`vercel env add STRIPE_PRICE_TEAM_MONTHLY production    # ${ids.team_monthly}`);
  console.log(`vercel env add STRIPE_PRICE_TEAM_ANNUAL production     # ${ids.team_annual}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

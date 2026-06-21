# Stripe Setup — Subscriptions & Artist Payouts

Kalunez uses Stripe for listener subscriptions and Stripe Connect for artist tip payouts.

## Architecture

```
Listeners                    Artists
   │                           │
   ▼                           ▼
Pricing / Pro page      Artist Dashboard
   │                           │
   ▼                           ▼
createCheckoutSession   createConnectAccount
   │                           │
   ▼                           ▼
Stripe Checkout         Stripe Connect Express
   │                           │
   ▼                           ▼
handleStripeWebhook     Tips via createTipCheckout
   │                     (90% artist / 10% platform)
   ▼
Subscription + User tier updated
```

---

## Step 1: Create Stripe Account

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Complete business verification
3. Enable **Connect** under Settings → Connect settings → Express accounts

---

## Step 2: Create Products & Prices

In Stripe Dashboard → **Products**, create:

| Product | Price | Billing | Metadata |
|---------|-------|---------|----------|
| Kalunez Pro | $9.99 | Monthly | `tier: pro` |
| Kalunez Premium | 69 NOK | Monthly | `tier: premium` |
| Kalunez Premium + Podcast | 89 NOK | Monthly | `tier: premium_podcast` |
| Kalunez Premium Yearly | 699 NOK | Yearly | `tier: premium` |
| Kalunez Premium + Podcast Yearly | 899 NOK | Yearly | `tier: premium_podcast` |

Copy each **Price ID** (starts with `price_`).

> The `tier` metadata on each Price is used by the webhook to set the user's subscription tier.

---

## Step 3: Base44 Secrets

Add to Base44 Dashboard → Secrets:

```
STRIPE_API_KEY=sk_live_...          # or sk_test_ for testing
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ALLOWED_PRICES=price_xxx,price_yyy,price_zzz,...
STRIPE_PLATFORM_FEE_PERCENT=10
BASE44_APP_URL=https://your-app.base44.app
```

---

## Step 4: Frontend Environment

Add to `.env.local`:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PRICE_PRO_MONTHLY=price_...
VITE_STRIPE_PRICE_PREMIUM_MONTHLY=price_...
VITE_STRIPE_PRICE_PREMIUM_PODCAST_MONTHLY=price_...
VITE_STRIPE_PRICE_PREMIUM_YEARLY=price_...
VITE_STRIPE_PRICE_PREMIUM_PODCAST_YEARLY=price_...
```

Only plans with configured price IDs appear on the Pricing page.

---

## Step 5: Webhook

1. Stripe Dashboard → **Developers → Webhooks**
2. Add endpoint: your Base44 function URL for `handleStripeWebhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `account.updated`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

## Step 6: Deploy Backend Functions

Deploy these to Base44:

| Function | Purpose |
|----------|---------|
| `createCheckoutSession` | Subscription checkout |
| `createTipCheckout` | Tip payments via Connect |
| `createConnectAccount` | Artist onboarding |
| `getArtistAccount` | Account status + earnings |
| `handleStripeWebhook` | Process all Stripe events |

---

## Artist Connect Flow

1. Artist opens **Artist Dashboard**
2. Enters public artist name → **Connect Stripe Account**
3. Redirected to Stripe Express onboarding
4. After completion, fans can tip via **Tip Artist** button
5. Tips split: **90% to artist**, **10% platform fee**
6. Artist manages payouts in Stripe Express Dashboard

---

## Testing

Use Stripe test mode:

```
STRIPE_API_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Test cards: `4242 4242 4242 4242` (any future date, any CVC)

For Connect testing, use [Stripe Connect test accounts](https://stripe.com/docs/connect/testing).

---

## Database Entities

| Entity | Purpose |
|--------|---------|
| `Subscription` | User subscription records |
| `ArtistAccount` | Connect account + earnings |
| `Tip` | Individual tip transactions |

---

## Troubleshooting

**"Request failed with status code 500"** — The real error is hidden until frontend + function are updated. Common causes:

1. **`STRIPE_API_KEY` missing in Base44** — Add `sk_test_...` under Secrets (not `pk_test_`).
2. **Test/live mismatch** — In Stripe, turn **Test mode** on. Use `pk_test_`, `sk_test_`, and a `price_` from the same test account.
3. **`STRIPE_ALLOWED_PRICES`** — Must include the exact `price_...` from Vercel `VITE_STRIPE_PRICE_PRO_MONTHLY` (comma-separated, no spaces unless trimmed).
4. **Function not deployed** — Code in GitHub ≠ live on Base44. Open Base44 → **Functions** → `createCheckoutSession` → paste from `base44/functions/createCheckoutSession/entry.ts` → **Save / Publish**.
5. **`Subscription` entity missing** — Base44 → **Entities** → ensure `Subscription` exists (import from `base44/entities/Subscription.jsonc`).

After redeploying Vercel + updating the Base44 function, try Subscribe again — you should see a **specific** error message instead of generic 500.

**"Invalid price ID"** — Add the price to `STRIPE_ALLOWED_PRICES` in Base44 secrets.

**"Artist has not set up payouts"** — Artist must complete Connect onboarding first.

**Subscription tier not updating** — Ensure Price has `tier` metadata and webhook is receiving events.

**Tips not recording** — Check `checkout.session.completed` webhook and `account.updated` for Connect.

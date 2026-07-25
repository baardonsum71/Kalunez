# Payments — RevenueCat + Stripe Connect Payouts

Kalunez uses **RevenueCat** for everything the buyer pays (subscriptions and artist tips), and **Stripe Connect** purely as a payout rail for sending the platform's own funds to artists. The buyer never interacts with Stripe directly — this keeps Kalunez compliant with Apple's in-app purchase rules for a future native iOS app.

## Architecture

```
Listeners                          Artists
   │                                  │
   ▼                                  ▼
Pricing / Subscription page    Artist Dashboard
   │                                  │
   ▼                                  ▼
RevenueCat purchase()          createConnectAccount
   │                           (Stripe Connect Express —
   ▼                            payout account only)
handleRevenueCatWebhook               │
   │                                  ▼
Subscriptions + profiles.tier   payoutArtistEarnings
                                (Stripe Transfer,
                                 server-initiated)
```

Tips flow: a fan buys a "tip credit" product via RevenueCat (Apple IAP / Google Play / Web Billing). The webhook credits the artist's `pending_earnings_cents`. The platform periodically calls `payoutArtistEarnings`, which transfers that balance to the artist's Stripe Connect account — this is the same pattern Twitch (Bits) and Cameo use to stay App Store compliant while still splitting revenue with creators.

---

## Step 1 — RevenueCat

See [docs/REVENUECAT_SETUP.md](REVENUECAT_SETUP.md) for full setup: entitlements, products, offerings, Web Billing, and the webhook.

## Step 2 — Stripe (payout rail only)

1. Create a Stripe account at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Enable **Connect** → Settings → Connect settings → Express accounts
3. Copy your **secret key** (`sk_live_...` or `sk_test_...`) into the Supabase Edge Function secret `STRIPE_API_KEY` (see `docs/SUPABASE_SETUP.md`)

No Stripe Checkout, Prices, or webhook is needed anymore — Stripe is only used for `stripe.accounts.create`, `stripe.accountLinks.create`, and `stripe.transfers.create`.

## Step 3 — Deploy Edge Functions

```
supabase functions deploy createConnectAccount
supabase functions deploy getArtistAccount
supabase functions deploy payoutArtistEarnings
supabase functions deploy handleRevenueCatWebhook
```

## Subscription management & cancellation

The `/subscription` page (`src/pages/ProSubscription.jsx`) shows a **Manage / Cancel Subscription** button for active subscribers. It calls `getManagementUrl()` in `src/lib/revenuecat.js`, which reads `customerInfo.managementURL` from the RevenueCat SDK and opens it in a new tab:

- **Web (Stripe Billing)** → your configured Stripe Customer Portal, where the user can cancel, change plan, or update payment method
- **iOS** → App Store subscription management
- **Android** → Play Store subscription management

If `managementURL` is `null` (Stripe Customer Portal not configured yet — see `docs/REVENUECAT_SETUP.md` step 5), the button shows an error instead of a broken link.

## Artist payout flow

1. Artist opens **Artist Dashboard** → **Set Up Payout Account**
2. Enters public artist name → redirected to Stripe Express onboarding
3. After completion, fans can tip via the **Tip Artist** button (RevenueCat purchase)
4. Tips split: **90% to artist** (credited as `pending_earnings_cents`), **10% platform fee**
5. Platform runs `payoutArtistEarnings` (manually or on a schedule) to transfer pending earnings to the artist's Stripe Express account
6. Artist views payout history in their Stripe Express Dashboard (`getArtistAccount` with `type: 'dashboard'`)

## Testing

- RevenueCat has a sandbox mode for Web Billing and IAP — see their docs for test purchases.
- Use Stripe test mode (`sk_test_...`) for Connect onboarding and transfers during development.

## Database tables

| Table | Purpose |
|-------|---------|
| `subscriptions` | User subscription records, synced from RevenueCat webhook |
| `artist_accounts` | Stripe Connect payout account + earnings balances |
| `tips` | Individual tip transactions, synced from RevenueCat webhook |

## Troubleshooting

**Subscription tier not updating** — Confirm the RevenueCat webhook is configured and `REVENUECAT_WEBHOOK_AUTH` matches on both sides. Check the product identifier is in `PRODUCT_TIER_MAP` in `supabase/functions/handleRevenueCatWebhook/index.ts`.

**Tips not recording** — Ensure the tip product identifier starts with `tip_credit` and the purchase sets the `artistName` attribute before purchasing (see `src/lib/revenuecat.js`).

**"Artist has not set up payouts"** — Artist must complete Stripe Connect onboarding first (`charges_enabled` and `payouts_enabled` both `true`).

**Payout fails** — Check the artist's `stripe_connect_account_id` and that `pending_earnings_cents > 0`.

# RevenueCat Setup — Kalunez

RevenueCat replaces Stripe Checkout for anything the buyer pays for directly (subscriptions and event tickets). Stripe is still used server-side, but only to pay artists out — see `docs/PAYMENTS.md`.

## 1. Create account & project

1. Sign up at [app.revenuecat.com](https://app.revenuecat.com).
2. **New Project** → `Kalunez`.

## 2. Create Entitlements

**Project → Entitlements → +**, create:

- `pro`
- `premium`
- `premium_podcast`

## 3. Create Products

For each plan in `src/lib/revenuecat.js` (`pro_monthly_subscription`, `premium_monthly_subscription`, `premium_podcast_monthly`, `premium_yearly`, `premium_podcast_yearly`), plus ticket consumables:

- Event tickets (consumables, fixed prices):
  `event_ticket_49`, `_99`, `_149`, `_199`, `_299`

**Project → Products → +** — attach each subscription product to its matching entitlement. Ticket products are **consumables**, not attached to an entitlement. Add all packages to the default Offering with identifiers matching the product IDs exactly.

## 4. Create an Offering

**Project → Offerings → default** → attach all subscription products as packages (`pro_monthly_subscription`, `premium_monthly_subscription`, etc). The frontend fetches this via `getOfferings()`.

## 5. Enable Web Billing

**Project → Web Billing → Enable** → connect a Stripe account (RevenueCat uses Stripe as the payment processor under the hood, fully abstracted — your app code never touches the Stripe API for purchases).

**Required for the in-app "Manage / Cancel Subscription" button:** under Web Billing settings, configure your **Stripe Customer Portal URL** (or use RevenueCat's hosted Web Billing Customer Portal if you're on RevenueCat Billing instead of Stripe Billing). Without this, `customerInfo.managementURL` will be `null` and the cancel button will show an error instead of opening a portal.

## 6. Get your Public API Keys (three different ones)

RevenueCat shows **separate** public keys per platform. Mixing them causes:

> `Invalid API key. Use your Web Billing API key.`

| Env var | Prefix | Where you copy it |
|---------|--------|-------------------|
| `VITE_REVENUECAT_PUBLIC_KEY` | `rcb_…` | **Web Billing** app → Public API key |
| `VITE_REVENUECAT_IOS_PUBLIC_KEY` | `appl_…` | **iOS** app → Public API key |
| `VITE_REVENUECAT_ANDROID_PUBLIC_KEY` | `goog_…` | **Android** app → Public API key |

In `.env.local` keep **all three on separate lines**. Never put `appl_` into `VITE_REVENUECAT_PUBLIC_KEY`.

- Safari / kalunez.com → uses `rcb_`
- TestFlight / Xcode iOS app → uses `appl_` (must rebuild after changing `.env.local`)

## 7. Configure the webhook

**Project → Integrations → Webhooks → +**

- URL: `https://<your-project-ref>.functions.supabase.co/handleRevenueCatWebhook`
- Authorization header: generate a random secret, set it here **and** as the `REVENUECAT_WEBHOOK_AUTH` Supabase Edge Function secret.
- Events: select all (or at minimum `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`, `NON_RENEWING_PURCHASE`, `BILLING_ISSUE`).

## 8. Connect App Store + Google Play

In the same RevenueCat project → **Apps**:

| Platform | Public key env var | Docs |
|----------|--------------------|------|
| Web Billing | `VITE_REVENUECAT_PUBLIC_KEY` (`rcb_...`) | this file |
| iOS / Capacitor | `VITE_REVENUECAT_IOS_PUBLIC_KEY` (`appl_...`) | `docs/CAPACITOR_IOS.md` |
| Android / Capacitor | `VITE_REVENUECAT_ANDROID_PUBLIC_KEY` (`goog_...`) | `docs/CAPACITOR_ANDROID.md` |

Attach the same Products / Offering package IDs on every store (`pro_monthly`, `event_ticket_49`, etc.).

---

Once Web + store apps are linked, fill the matching keys in `.env.local` / Vercel. Pricing, tips, and ticketed events work end-to-end.

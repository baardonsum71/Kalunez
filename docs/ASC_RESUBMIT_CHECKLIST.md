# App Store resubmit checklist — Kalunez (build 17+)

## This rejection

| Guideline | Issue | Fix |
|-----------|--------|-----|
| **4** | Crowded UI / hard to complete tasks (also mentioned iPad) | Simplified nav, home, pricing; iPhone only |
| **5.1.2(i)** | Cookies / tracking without ATT | No cookie banner, no PostHog, no cookie settings on native |

## Before Archive

1. [ ] `git pull origin cursor/fix-asc-iap-native-1c89`
2. [ ] `.env.local` has `VITE_REVENUECAT_IOS_PUBLIC_KEY=appl_...`
3. [ ] `npm run build && npx cap sync ios`
4. [ ] Xcode Build = **17**
5. [ ] Confirm **iPhone only** (not iPad) in Xcode destinations

## Privacy (5.1.2) — verify on device

1. [ ] Open app → **no** cookie banner
2. [ ] Settings → **no** Cookie preferences / Cookies link
3. [ ] No ATT permission prompt (we do not track)

## IAP smoke test (iPhone)

1. [ ] Pricing → Get Started on **Premium Monthly**
2. [ ] StoreKit sheet appears

## Screenshots

Upload current UI screenshots for 6.5" iPhone (Home, Discover, Pricing, Live).

## Resolution Center

Paste from [ASC_RESOLUTION_CENTER_REPLY.md](./ASC_RESOLUTION_CENTER_REPLY.md).

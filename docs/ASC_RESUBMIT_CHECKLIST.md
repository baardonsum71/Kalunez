# App Store resubmit checklist — Kalunez (build 18+)

## This rejection (iPad Air 11-inch)

| Guideline | Issue | Fix |
|-----------|--------|-----|
| **4** | Crowded UI on iPad | iPhone-only + phone-width column on large screens; simpler Pricing |
| **2.1(b)** | IAP bugs / poor purchase UX | Correct `appl_` key in native build; preflight + timeout; Resolution Center steps |

## Before Archive (Mac)

1. [ ] `git pull origin cursor/fix-asc-iap-native-1c89`
2. [ ] `.env.local` has all three keys (`rcb_`, `appl_`, `goog_`) — **never** put `appl_` in `PUBLIC_KEY`
3. [ ] `npm run build && npx cap sync ios`
4. [ ] Xcode Build = **18**
5. [ ] General → Supported Destinations = **iPhone** only

## Mandatory IAP smoke test (TestFlight on iPhone)

1. [ ] Pricing → **Get Started** on **Premium Monthly**
2. [ ] StoreKit sheet appears (not “Invalid API key” / hang)
3. Do **not** resubmit until this works

## Screenshots

Upload current **iPhone** screenshots (6.5"): Home, Discover, Pricing, Live.

## Resolution Center

Paste from [ASC_RESOLUTION_CENTER_REPLY.md](./ASC_RESOLUTION_CENTER_REPLY.md).

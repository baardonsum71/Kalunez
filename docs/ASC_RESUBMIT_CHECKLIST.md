# App Store resubmit checklist — Kalunez (build 16+)

Do **not** submit until every box is green.

## This rejection covered three items

| Guideline | Issue | Fix in this build / your action |
|-----------|--------|----------------------------------|
| **4** | Not optimized for all screen sizes (iPad) | App is now **iPhone only** |
| **2.1(b)** | Error when subscribing to Premium | IAP timeouts + you must verify StoreKit sheet on iPhone |
| **2.3.3** | Old screenshots (6.5" iPhone / 13" iPad) | Upload **new** screenshots in ASC |

## Before Archive (on Mac)

1. [ ] `.env.local` has `VITE_REVENUECAT_IOS_PUBLIC_KEY=appl_...`
2. [ ] `npm run build && npx cap sync ios`
3. [ ] Xcode **Build = 16** (or higher)
4. [ ] Xcode **Supported Destinations** = iPhone only (not iPad)

## Sandbox IAP on iPhone (Guideline 2.1b)

1. [ ] Paid Apps Agreement **Active**
2. [ ] Subscription products Cleared for Sale / Ready to Submit and attached to this version
3. [ ] RevenueCat Offering `current` includes `premium_monthly_subscription` and `pro_monthly_subscription`
4. [ ] Device → Settings → App Store → Sandbox Account
5. [ ] TestFlight build 16 → sign in `review@kalunez.app`
6. [ ] **Pricing → Get Started on Premium Monthly**
7. [ ] **StoreKit payment sheet appears within ~10 seconds**
8. [ ] Also test Upgrade to Pro → Subscribe Now

If the sheet does not appear → **do not submit**.

## Screenshots (Guideline 2.3.3)

Upload **new** images that match the current UI. For **6.5-inch iPhone** (required):

Capture from the latest TestFlight / simulator build:

1. Home / Discover with tracks visible
2. Live or a stream screen
3. Pricing (subscription plans) — shows Get Started
4. Playing a track (floating player visible) OR Go Live form
5. Optional: Library or For Artists

**Tips**
- Use real UI from build 16 — not old tip screenshots
- No status bar overlays that look fake
- If ASC still asks for **13-inch iPad** screenshots while the app is iPhone-only, you can often remove iPad as a device in the version’s screenshot set, or upload iPhone screenshots only once iPad is deselected in pricing/availability

## Review Notes (paste in ASC)

```
Sandbox Apple ID: review@kalunez.app (password in App Review Information).

This build is iPhone-only.

To test IAP:
1. Sign in with the review account.
2. Open Pricing.
3. Tap Get Started on Premium Monthly (premium_monthly_subscription).
4. The App Store payment sheet should appear (StoreKit via RevenueCat).

Native features: background audio, lock screen Now Playing, native share sheet, StoreKit IAP.
```

## Resolution Center

See [ASC_RESOLUTION_CENTER_REPLY.md](./ASC_RESOLUTION_CENTER_REPLY.md).

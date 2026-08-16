# App Store resubmit checklist — Kalunez (4.2 + 2.1b)

Do **not** submit until every box below is green.

## Sandbox IAP (Guideline 2.1b) — must work on iPhone **and** iPad

Test **both** screens:
- Upgrade to Pro → **Subscribe Now** (`/subscription`)
- Pricing → **Get Started** (`/pricing`)

1. [ ] Paid Apps Agreement active in App Store Connect → Business
2. [ ] All subscription products **Cleared for Sale** / Ready to Submit
3. [ ] Products attached to this app version
4. [ ] RevenueCat iOS app: products linked; Offering `current` includes:
   - `pro_monthly_subscription`
   - `premium_monthly_subscription`
   - `premium_podcast_monthly`
   - `premium_yearly`
   - `premium_podcast_yearly`
5. [ ] Production build includes `VITE_REVENUECAT_IOS_PUBLIC_KEY` (`appl_…`)
6. [ ] Device → Settings → App Store → Sandbox Account signed in
7. [ ] Open Kalunez → sign in as `review@kalunez.app`
8. [ ] Go to **Upgrade to Pro** → tap **Subscribe Now**
9. [ ] **StoreKit payment sheet appears within ~10 seconds** (iPhone)
10. [ ] Same on **iPad** (reviewer used iPad Air 11")
11. [ ] Also test Pricing → Get Started
12. [ ] If products missing: UI shows an error within 25s — never infinite "Processing…"

## Native music (Guideline 4.2)

1. [ ] Play a track → lock the phone → audio continues (`UIBackgroundModes` audio)
2. [ ] Lock screen / Control Center shows track title + play/pause
3. [ ] Share on a track/stream opens the **native share sheet**
4. [ ] Light haptic on play/pause and after successful purchase

## Review Notes (paste in ASC)

```
Sandbox Apple ID: review@kalunez.app (password in App Review Information).

To test IAP:
1. Sign in with the review account.
2. Open Upgrade to Pro (or Pricing).
3. Tap Subscribe Now / Get Started on Pro Monthly.
4. The App Store payment sheet should appear (StoreKit via RevenueCat).

Native features to verify (Guideline 4.2):
- Background audio playback while the app is locked
- Lock screen / Control Center Now Playing controls
- Native system share sheet on tracks and live streams
- In-app purchases use StoreKit (not Safari checkout)
```

## Resolution Center reply

See [ASC_RESOLUTION_CENTER_REPLY.md](./ASC_RESOLUTION_CENTER_REPLY.md).

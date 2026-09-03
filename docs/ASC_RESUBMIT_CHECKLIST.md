# App Store resubmit — build 20 (IAP error on iPhone)

## Rejection

| Guideline | Device | Issue |
|-----------|--------|--------|
| **2.1(b)** | iPhone 17 Pro Max / iOS 26.6.1 | Error message when using IAP |

## Root cause (most likely)

Archive built **without** `VITE_REVENUECAT_IOS_PUBLIC_KEY=appl_…` baked in → purchase shows an error.

## Before Archive (Mac) — do in order

```bash
cd ~/Projects/tentacled-stream-vibe-live-3
git pull origin cursor/fix-asc-iap-native-1c89

# Must show three lines; IOS must be appl_
grep '^VITE_REVENUECAT' .env.local | sed 's/=.*/=…/'

# This FAILS if appl_ is missing — do not Archive until it passes
npm run build:ios && npx cap sync ios
npx cap open ios
```

1. [ ] Xcode Build = **20**
2. [ ] TestFlight: Pricing → Premium Monthly → **StoreKit sheet** (no error)
3. [ ] ASC: Paid Apps Agreement **Active**
4. [ ] ASC: products **Cleared for Sale** + attached to version
5. [ ] Paste `docs/ASC_RESOLUTION_CENTER_REPLY.md`

**Do not submit until step 2 works on a real iPhone TestFlight build.**

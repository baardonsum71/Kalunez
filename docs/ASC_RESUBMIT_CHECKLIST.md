# App Store resubmit — build 21 (payment sheet timeout)

## What you saw

Pricing showed **Checking App Store products…** and then  
**App Store payment sheet did not appear in time**.

Cause: Get Started could fire **before** products finished loading, so StoreKit never opened.

## Code fix (build 21)

- Buttons disabled until preflight finishes
- Premium Monthly sorted first
- Softer timeout copy

## Still required in App Store Connect (or sheet still won't open)

1. **Business → Paid Apps Agreement** = Active  
2. Each subscription (**especially** `premium_monthly_subscription` and `pro_monthly_subscription`) = **Ready to Submit** / **Cleared for Sale**  
3. Products attached to the app version you upload  
4. RevenueCat → iOS app → Offering **current** includes those product IDs  
5. Bundle ID matches (`com.kalunez.app` or whatever is in Xcode)

## Mac rebuild

```bash
cd ~/Projects/tentacled-stream-vibe-live-3
git pull origin cursor/fix-asc-iap-native-1c89
npm run build:ios && npx cap sync ios
npx cap open ios
```

Archive **Build 21** → TestFlight → wait until “Checking…” finishes → tap **Premium Monthly** only.

If products stay unavailable after preflight, the problem is ASC/RevenueCat linkage — not the button race.

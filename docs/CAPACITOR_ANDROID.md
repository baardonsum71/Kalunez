# Capacitor Android Setup — Kalunez

Same React/Vite app as iOS and web. Android is an additive native shell — **does not change** Vercel or iOS.

## What's in the repo

| Item | Notes |
|------|--------|
| `@capacitor/android` | Native Android project under `android/` |
| App ID | `com.kalunez.app` (same as iOS) |
| RevenueCat | Uses `VITE_REVENUECAT_ANDROID_PUBLIC_KEY` (`goog_...`) on Android |

## Manual steps

### 1. Install Android Studio

- [Android Studio](https://developer.android.com/studio)
- SDK + a virtual device or physical phone with USB debugging

### 2. Sync web build into Android

```bash
npm run cap:sync
# or: npm run build && npx cap sync android
npm run cap:open:android
```

### 3. RevenueCat Google Play app

1. RevenueCat → **Apps** → **+ New** → **Google Play**
2. Package name: `com.kalunez.app`
3. Copy Public API Key (`goog_...`) → `VITE_REVENUECAT_ANDROID_PUBLIC_KEY` in `.env.local` and Vercel
4. Link the same Products / Offering packages as iOS (`pro_monthly`, `event_ticket_49`, etc.) with Google Play product IDs

### 4. Google Play Console

1. Create app **Kalunez**
2. Package name must match: `com.kalunez.app`
3. Create matching **subscriptions** + **consumables** (tips + event tickets)
4. Set up a license tester / internal testing track
5. Upload an AAB from Android Studio (**Build → Generate Signed Bundle**)

### 5. Store listing assets

- Feature graphic, screenshots (phone), short/full description
- Privacy Policy: `https://www.kalunez.com/privacy`
- Content rating questionnaire

## Sale positioning

Once the app is on an **internal/closed testing** track (or production), you can honestly market Kalunez as **iOS + Android**. Until then, say: *“Android Capacitor project included; Play Store launch is the next milestone.”*

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run cap:sync` | Build web + sync iOS **and** Android |
| `npm run cap:open:android` | Open Android Studio |
| `npm run cap:open:ios` | Open Xcode |

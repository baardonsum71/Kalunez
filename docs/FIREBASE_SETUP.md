# Firebase setup — Kalunez (`kalunez-app`)

| Layer | Status |
|-------|--------|
| Firebase project `kalunez-app` | Done |
| Auth + Firestore client | Done |
| Storage rules | Done |
| Cloud Functions (code) | Done — **deploy needs Blaze** |
| Secrets in Google Secret Manager | Set before deploy |

Console: https://console.firebase.google.com/project/kalunez-app

## 1. Upgrade to Blaze (required for Functions)

https://console.firebase.google.com/project/kalunez-app/usage/details

Spark cannot run Cloud Functions. Blaze stays free within free quotas for light use.

## 2. Set secrets (once, after Blaze)

```bash
npx -y firebase-tools@latest login
npx -y firebase-tools@latest use kalunez-app

npx -y firebase-tools@latest functions:secrets:set LIVEKIT_API_KEY
npx -y firebase-tools@latest functions:secrets:set LIVEKIT_API_SECRET
npx -y firebase-tools@latest functions:secrets:set LIVEKIT_URL
npx -y firebase-tools@latest functions:secrets:set MUX_TOKEN_ID
npx -y firebase-tools@latest functions:secrets:set MUX_TOKEN_SECRET
npx -y firebase-tools@latest functions:secrets:set STRIPE_API_KEY
npx -y firebase-tools@latest functions:secrets:set APP_URL
# value e.g. https://www.kalunez.com
npx -y firebase-tools@latest functions:secrets:set REVENUECAT_WEBHOOK_AUTH
```

## 3. Deploy functions

```bash
cd functions && npm install && cd ..
npx -y firebase-tools@latest deploy --only functions
```

## 4. RevenueCat webhook URL

```
https://us-central1-kalunez-app.cloudfunctions.net/handleRevenueCatWebhook
```

Authorization header = same value as `REVENUECAT_WEBHOOK_AUTH`.

## Callable functions (client)

| Name | Purpose |
|------|---------|
| `getLiveKitToken` | Live JWT |
| `getLiveKitRoomInfo` | Viewer count |
| `createMuxLiveStream` | OBS/RTMP |
| `createConnectAccount` | Stripe Connect onboarding |
| `getArtistAccount` | Connect status |
| `payoutArtistEarnings` | Tip payouts |
| `getArtistAnalytics` | Artist dashboard |
| `getPlatformAnalytics` | Admin analytics |

## Env (frontend)

See `.env.example` — `VITE_FIREBASE_*` keys for project `kalunez-app`.

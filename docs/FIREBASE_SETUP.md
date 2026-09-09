# Firebase setup — Kalunez (`kalunez-app`)

| Layer | Status |
|-------|--------|
| Firebase project `kalunez-app` | Done |
| Auth + Firestore client | Done |
| Storage rules | Done |
| Cloud Functions (code) | **Deployed** to `us-central1` |
| Secrets in Google Secret Manager | APP_URL + webhook set; LiveKit/Mux/Stripe need real values |

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

## Deployed webhook

```
https://us-central1-kalunez-app.cloudfunctions.net/handleRevenueCatWebhook
```

Set Authorization header in RevenueCat to the `REVENUECAT_WEBHOOK_AUTH` secret value.

## Replace placeholder secrets (LiveKit / Mux / Stripe)

```bash
npx -y firebase-tools@latest functions:secrets:set LIVEKIT_API_KEY --project kalunez-app
npx -y firebase-tools@latest functions:secrets:set LIVEKIT_API_SECRET --project kalunez-app
npx -y firebase-tools@latest functions:secrets:set LIVEKIT_URL --project kalunez-app
# optional:
npx -y firebase-tools@latest functions:secrets:set MUX_TOKEN_ID --project kalunez-app
npx -y firebase-tools@latest functions:secrets:set MUX_TOKEN_SECRET --project kalunez-app
npx -y firebase-tools@latest functions:secrets:set STRIPE_API_KEY --project kalunez-app
```

Then: `npx -y firebase-tools@latest deploy --only functions --force`

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

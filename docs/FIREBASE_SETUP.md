# Firebase setup — Kalunez (`kalunez-app`)

Kalunez is migrating from Supabase to Firebase.

| Layer | Status |
|-------|--------|
| Firebase project `kalunez-app` | Done |
| Web app + SDK env | Done |
| Auth (email/password) | Done (client) |
| Firestore (`db.js`) | Done (client) |
| Storage (audio/covers/avatars) | Rules ready — enable Storage in console if upload fails |
| Cloud Functions (LiveKit, Mux, Stripe, RC webhook) | **Phase 2 — not deployed yet** |
| Data copy from Supabase | Manual / export when ready |

## Env

Copy to `.env.local` (values also in `.env.production`):

```bash
VITE_FIREBASE_API_KEY=…
VITE_FIREBASE_AUTH_DOMAIN=kalunez-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kalunez-app
VITE_FIREBASE_STORAGE_BUCKET=kalunez-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=878171605439
VITE_FIREBASE_APP_ID=1:878171605439:web:c4505c33268dc66543b90a
```

Console: https://console.firebase.google.com/project/kalunez-app

## Local / deploy rules

```bash
npx -y firebase-tools@latest login
npx -y firebase-tools@latest use kalunez-app
npx -y firebase-tools@latest deploy --only firestore:rules,storage
```

## Auth note

- Email/password works in the app.
- Apple Sign-In on **web** needs Apple provider configured in Firebase Console → Authentication → Sign-in method.
- Native app still uses email/password only (Guideline 4).

## Phase 2 (next)

Port Supabase Edge Functions under `supabase/functions/` to Cloud Functions:

- `getLiveKitToken`, `getLiveKitRoomInfo`, `createMuxLiveStream`
- `createConnectAccount`, `getArtistAccount`, `payoutArtistEarnings`
- `handleRevenueCatWebhook`, `getArtistAnalytics`, `getPlatformAnalytics`

Until then, Go Live token minting and Connect onboarding show a clear “not deployed yet” error.

## Review account

Create `review@kalunez.app` in Firebase Auth (email/password) for App Review after cutover.

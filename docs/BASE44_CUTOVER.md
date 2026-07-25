# Leave Base44 Completely — Kalunez Cutover Checklist

The Kalunez **codebase no longer depends on Base44**. Auth, database, storage, and backend functions use **Supabase**. Payments use **RevenueCat** (Apple/Google/Web) + **Stripe Connect** for artist payouts only.

Use this checklist until `kalunez.com` and the native apps run fully without Base44 — then cancel the Base44 subscription.

---

## Done in code (already)

- [x] Removed `@base44/sdk` / `@base44/vite-plugin`
- [x] Supabase client + Auth (email/password + Apple)
- [x] Postgres schema + RLS (`supabase/migrations/`)
- [x] Edge Functions under `supabase/functions/`
- [x] RevenueCat for subscriptions, tips, event tickets
- [x] Capacitor iOS (`com.kalunez.app`)
- [x] Capacitor Android project (same web code)

---

## 1. Supabase database

In [Supabase Dashboard](https://supabase.com/dashboard) → project `qgegmfjwhamgvcptxztk` → **SQL Editor**:

1. Paste and **Run** `supabase/migrations/0001_init.sql`
2. Paste and **Run** `supabase/migrations/0002_ticketed_events.sql`
3. **Storage** → confirm buckets `audio`, `covers`, `avatars`
4. **Database → Replication** → enable Realtime for `messages`, `chat_messages`, `activities` (and `live_events` if listed)

---

## 2. Supabase Edge Functions + secrets

Install CLI once: `npm install -g supabase` then `supabase login` and:

```bash
cd /path/to/tentacled-stream-vibe-live-3
supabase link --project-ref qgegmfjwhamgvcptxztk
```

**Secrets** (Dashboard → Edge Functions → Secrets, or CLI):

```
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
STRIPE_API_KEY=sk_live_...          # artist payouts only
STRIPE_PLATFORM_FEE_PERCENT=10
REVENUECAT_WEBHOOK_AUTH=            # same secret as RevenueCat webhook
APP_URL=https://www.kalunez.com
```

**Deploy:**

```bash
supabase functions deploy getLiveKitToken
supabase functions deploy getLiveKitRoomInfo
supabase functions deploy createMuxLiveStream
supabase functions deploy getArtistAnalytics
supabase functions deploy getPlatformAnalytics
supabase functions deploy getArtistAccount
supabase functions deploy createConnectAccount
supabase functions deploy payoutArtistEarnings
supabase functions deploy handleRevenueCatWebhook
supabase functions deploy deleteAccount
```

---

## 3. Vercel (kalunez.com) — remove Base44 env

Vercel → Project → **Settings → Environment Variables**

**Remove** (if present):
- `VITE_BASE44_APP_ID`
- `VITE_BASE44_APP_BASE_URL`
- any Base44 proxy / API URL

**Set:**

| Variable | Example |
|----------|---------|
| `VITE_SUPABASE_URL` | `https://qgegmfjwhamgvcptxztk.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_...` or legacy `eyJ...` anon key |
| `VITE_REVENUECAT_PUBLIC_KEY` | `rcb_...` (Web Billing) |
| `VITE_REVENUECAT_IOS_PUBLIC_KEY` | `appl_...` |
| `VITE_REVENUECAT_ANDROID_PUBLIC_KEY` | `goog_...` (when Android app is in RevenueCat) |
| `VITE_LIVEKIT_URL` | `wss://...` (if using browser live) |
| `VITE_MUX_ENABLED` | `true` (optional) |

Then **Deployments → Redeploy**.

**Domain:** `kalunez.com` / `www` must point at **Vercel**, not Base44 hosting.

---

## 4. Auth & payments (no Base44)

| Feature | Where |
|---------|--------|
| Email/password | Supabase Auth |
| Sign in with Apple | Supabase + Apple (see `docs/APPLE_SIGNIN_SETUP.md`) |
| Subscriptions / tips / tickets | RevenueCat |
| Artist payouts | Stripe Connect via Edge Function |

RevenueCat webhook URL:

```
https://qgegmfjwhamgvcptxztk.functions.supabase.co/handleRevenueCatWebhook
```

---

## 5. Smoke test (before canceling Base44)

On **www.kalunez.com** (incognito):

- [ ] Sign up / log in
- [ ] Upload a track
- [ ] Open Live / Create Event
- [ ] Open Pricing (plans load)
- [ ] Privacy / Terms load without Base44 URLs

On **iOS** (TestFlight or device):

- [ ] App opens against Supabase (not Base44)
- [ ] Sandbox purchase works (optional)

---

## 6. Cancel Base44

Only after smoke tests pass:

1. Export anything you still need from Base44 (users/content) if migration of old data matters
2. Delete or archive the Base44 app
3. Cancel Base44 billing

---

## Android + iOS sale positioning

| Platform | Status |
|----------|--------|
| iOS | App Store approved (`com.kalunez.app`) |
| Web / PWA | kalunez.com |
| Android | Capacitor project added — finish Play Console + RevenueCat Google app, then list as dual-platform |

See `docs/CAPACITOR_ANDROID.md` and updated `docs/ACQUIRE_LISTING.md`.

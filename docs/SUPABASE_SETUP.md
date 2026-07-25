# Supabase Setup — Kalunez

Manual steps required before the migrated code can run. Nothing here can be automated by an agent — it requires your own Supabase account.

## 1. Create project

1. Go to [supabase.com](https://supabase.com) → sign up / log in.
2. **New Project** → name `kalunez`, choose a region close to Norway (e.g. `eu-central-1`), set a strong database password (save it in a password manager).
3. Wait ~2 minutes for provisioning.

## 2. Get your keys

Project → **Settings → API**:

| Value | Where it's used |
|-------|------------------|
| `Project URL` | `VITE_SUPABASE_URL` |
| `anon public` key | `VITE_SUPABASE_ANON_KEY` |
| `service_role` key | Supabase Edge Function secrets only — **never** in frontend `.env` |

## 3. Run the database migration

Install the Supabase CLI, then from the project root:

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

This applies everything in `supabase/migrations/`.

Alternatively, paste the contents of `supabase/migrations/0001_init.sql` into the **SQL Editor** in the Supabase Dashboard and run it.

## 4. Enable Storage buckets

The migration creates `audio`, `covers`, `avatars` buckets automatically (public read, authenticated write). Verify under **Storage** in the dashboard.

## 5. Enable Realtime

**Database → Replication**: enable replication for `messages`, `chat_messages`, `activities` (needed for the `.subscribe()` → Realtime migration).

## 6. Set Edge Function secrets

**Edge Functions → Manage secrets** (or `supabase secrets set KEY=value`):

```
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=...
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
STRIPE_API_KEY=sk_live_...        # payout-only, see docs/PAYMENTS.md
STRIPE_PLATFORM_FEE_PERCENT=10
REVENUECAT_WEBHOOK_AUTH=...       # shared secret you set in RevenueCat webhook config
```

## 7. Deploy Edge Functions

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

## 8. Update your `.env`

Copy `.env.example` to `.env` and fill in the values from step 2 plus your RevenueCat key (see `docs/REVENUECAT_SETUP.md`).

## 9. Enable Apple sign-in provider

See `docs/APPLE_SIGNIN_SETUP.md` — this must be done before the "Sign in with Apple" button works.

---

Once steps 1–9 are done, the app is fully cut over to Supabase.

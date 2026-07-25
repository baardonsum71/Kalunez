# Kalunez

**Stream. Create. Connect.**

Kalunez is a full-featured music streaming and live broadcasting platform built for artists and listeners. Upload tracks, go live, build playlists, collaborate, and monetize through subscriptions and tips.

## Product Overview

| Feature | Description |
|---------|-------------|
| Music Streaming | Upload, discover, and play tracks with a floating audio player |
| Live Broadcasting | Go live with webcam, live chat, and viewer engagement |
| Social | Follow artists, activity feed, messages, notifications |
| Playlists | Create and manage personal playlists |
| Collaboration | Collab rooms with waveform feedback on track drafts |
| Monetization | RevenueCat subscriptions + tips (90/10 split), Stripe Connect for artist payouts |
| PWA | Installable progressive web app with offline audio caching |

## Tech Stack

- **Frontend:** React 18, Vite 6, React Router 6, Tailwind CSS, shadcn/ui
- **State:** TanStack Query, custom player store
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Auth:** Sign in with Apple + email/password (Supabase Auth)
- **Payments:** RevenueCat (subscriptions + tips) + Stripe Connect (artist payouts only)
- **Audio:** wavesurfer.js for waveform visualization

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase + RevenueCat credentials
npm run dev
```

### Environment Variables

See [`.env.example`](.env.example) for the full list. Key frontend variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anon/public key |
| `VITE_REVENUECAT_PUBLIC_KEY` | For payments | RevenueCat Web Billing public key |
| `VITE_POSTHOG_KEY` | For analytics | PostHog (gated by cookie consent) |
| `VITE_SENTRY_DSN` | For monitoring | Sentry error tracking |
| `VITE_LIVEKIT_URL` | For browser live | LiveKit WebSocket URL |
| `VITE_MUX_ENABLED` | For OBS live | Enable Mux RTMP streaming |

Backend secrets (Stripe payout key, LiveKit, Mux, RevenueCat webhook auth) are set as **Supabase Edge Function secrets**, not in frontend env files. See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:coverage` | Tests with coverage report |

## Project Structure

```
src/
├── pages/          # 23 route pages (incl. /login)
├── components/     # Feature components + shadcn/ui
├── lib/            # Auth, player store, RevenueCat, data-access helpers
├── api/            # Supabase client
└── hooks/          # Custom React hooks
supabase/
├── migrations/     # Postgres schema + RLS policies
└── functions/      # Edge Functions (LiveKit, Mux, analytics, payments)
```

## Live Streaming

Kalunez supports **LiveKit** (browser WebRTC) and **Mux** (OBS/RTMP). See [docs/TESTING.md](docs/TESTING.md) for Vitest and GitHub Actions CI.
See [docs/ANALYTICS.md](docs/ANALYTICS.md) for PostHog and traction metrics setup.
See [docs/SENTRY.md](docs/SENTRY.md) for error monitoring setup.
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for GitHub, Vercel, Netlify, and Cloudflare Pages setup.
See [docs/MUSIC_LICENSING.md](docs/MUSIC_LICENSING.md) for the UGC-only music rights model (no third-party catalog).
See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for backend setup.
See [docs/BASE44_CUTOVER.md](docs/BASE44_CUTOVER.md) to finish leaving Base44 (Vercel + Supabase).
See [docs/APPLE_SIGNIN_SETUP.md](docs/APPLE_SIGNIN_SETUP.md) for Sign in with Apple.
See [docs/PAYMENTS.md](docs/PAYMENTS.md) for RevenueCat + Stripe Connect payout setup.
See [docs/CAPACITOR_IOS.md](docs/CAPACITOR_IOS.md) for the native iOS app (Capacitor) and App Store submission.
See [docs/CAPACITOR_ANDROID.md](docs/CAPACITOR_ANDROID.md) for Android / Google Play.
See [docs/ACQUIRE_LISTING.md](docs/ACQUIRE_LISTING.md) for Acquire.com listing copy (iOS + Android).

## Legal & compliance

| Page | Route |
|------|-------|
| Terms of Service | `/terms` |
| Privacy Policy | `/privacy` |
| DMCA Policy | `/dmca` |
| Cookie Policy | `/cookies` |

Cookie consent banner gates PostHog analytics and internal event persistence. Upload and Go Live flows require rights attestation (`rights_attested_at` on Track/LiveStream entities).

## Deployment

1. Set up Supabase (schema, storage, auth, functions) — see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
2. Build: `npm run build`
3. Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages)
4. Set environment variables on your host (see `.env.example`)
5. Configure Supabase Edge Function secrets for Stripe (payouts only), LiveKit, Mux, and RevenueCat webhook auth

## Acquisition Notes

This codebase is structured for transfer:

- Clean React/Vite architecture with code-split routes
- Legal pages (Terms, Privacy, DMCA, Cookies) + cookie consent
- UGC music licensing strategy documented in [docs/MUSIC_LICENSING.md](docs/MUSIC_LICENSING.md)
- LiveKit + Mux streaming integrated (configure credentials to enable)
- RevenueCat subscriptions + tips, Stripe Connect for artist payouts (configure keys)
- PostHog analytics + Sentry monitoring (optional, env-gated)
- Vitest unit tests + GitHub Actions CI
- PWA-ready with service worker for offline playback
- Fully on Supabase — no proprietary app-builder lock-in

**Recommended next steps for production:**
- Review [docs/MUSIC_LICENSING.md](docs/MUSIC_LICENSING.md) with legal counsel before scaling
- Complete Supabase, Apple Sign-In, and RevenueCat setup (see `docs/*_SETUP.md`)
- Add LiveKit/Mux credentials and test end-to-end streaming
- Deploy frontend and verify cookie consent + legal pages
- Register DMCA agent (US) if targeting US users at scale

## License

Proprietary — all rights reserved.

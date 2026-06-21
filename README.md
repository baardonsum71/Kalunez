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
| Monetization | Stripe subscriptions + Connect tips (90/10 split) |
| PWA | Installable progressive web app with offline audio caching |

## Tech Stack

- **Frontend:** React 18, Vite 6, React Router 6, Tailwind CSS, shadcn/ui
- **State:** TanStack Query, custom player store
- **Backend:** Base44 (managed NoSQL, auth, serverless functions)
- **Payments:** Stripe (checkout sessions + webhooks)
- **Audio:** wavesurfer.js for waveform visualization

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Base44 app credentials
npm run dev
```

### Environment Variables

See [`.env.example`](.env.example) for the full list. Key frontend variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BASE44_APP_ID` | Yes | Your Base44 app ID |
| `VITE_BASE44_APP_BASE_URL` | Yes | Your Base44 backend URL |
| `VITE_BASE44_FUNCTIONS_VERSION` | Optional | Base44 functions version |
| `VITE_STRIPE_PUBLISHABLE_KEY` | For payments | Stripe publishable key |
| `VITE_STRIPE_PRICE_*` | For subscriptions | Stripe price IDs per plan |
| `VITE_POSTHOG_KEY` | For analytics | PostHog (gated by cookie consent) |
| `VITE_SENTRY_DSN` | For monitoring | Sentry error tracking |
| `VITE_LIVEKIT_URL` | For browser live | LiveKit WebSocket URL |
| `VITE_MUX_ENABLED` | For OBS live | Enable Mux RTMP streaming |

Backend secrets (Stripe, LiveKit, Mux) are set in the **Base44 Dashboard**, not in frontend env files.

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
├── pages/          # 22 route pages
├── components/     # Feature components + shadcn/ui
├── lib/            # Auth, player store, utilities
├── api/            # Base44 SDK client
└── hooks/          # Custom React hooks
base44/
├── entities/       # Database schemas
└── functions/      # Serverless backend (Stripe)
```

## Live Streaming

Kalunez supports **LiveKit** (browser WebRTC) and **Mux** (OBS/RTMP). See [docs/TESTING.md](docs/TESTING.md) for Vitest and GitHub Actions CI.
See [docs/ANALYTICS.md](docs/ANALYTICS.md) for PostHog and traction metrics setup.
See [docs/SENTRY.md](docs/SENTRY.md) for error monitoring setup.
See [docs/MUSIC_LICENSING.md](docs/MUSIC_LICENSING.md) for the UGC-only music rights model (no third-party catalog).
See [docs/STRIPE.md](docs/STRIPE.md) for subscription and Connect setup.

## Legal & compliance

| Page | Route |
|------|-------|
| Terms of Service | `/terms` |
| Privacy Policy | `/privacy` |
| DMCA Policy | `/dmca` |
| Cookie Policy | `/cookies` |

Cookie consent banner gates PostHog analytics and internal event persistence. Upload and Go Live flows require rights attestation (`rights_attested_at` on Track/LiveStream entities).

## Deployment

1. Build: `npm run build`
2. Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages)
3. Set environment variables on your host (see `.env.example`)
4. Configure Base44 secrets for Stripe, LiveKit, and Mux
5. Backend remains on Base44 — no separate server needed for MVP

To migrate off Base44, replace `src/api/base44Client.js` with your own API layer. Entity schemas in `base44/entities/` serve as your data model reference.

## Acquisition Notes

This codebase is structured for transfer:

- Clean React/Vite architecture with code-split routes
- Legal pages (Terms, Privacy, DMCA, Cookies) + cookie consent
- UGC music licensing strategy documented in [docs/MUSIC_LICENSING.md](docs/MUSIC_LICENSING.md)
- LiveKit + Mux streaming integrated (configure credentials to enable)
- Stripe subscriptions + Connect tips (configure price IDs)
- PostHog analytics + Sentry monitoring (optional, env-gated)
- Vitest unit tests + GitHub Actions CI
- PWA-ready with service worker for offline playback
- No vendor lock-in on frontend — portable to any backend

**Recommended next steps for production:**
- Review [docs/MUSIC_LICENSING.md](docs/MUSIC_LICENSING.md) with legal counsel before scaling
- Set Stripe price IDs, webhook, and Connect in Base44 Dashboard
- Add LiveKit/Mux credentials and test end-to-end streaming
- Deploy frontend and verify cookie consent + legal pages
- Register DMCA agent (US) if targeting US users at scale
- Export Base44 data to your own database if migrating backend

## License

Proprietary — all rights reserved.

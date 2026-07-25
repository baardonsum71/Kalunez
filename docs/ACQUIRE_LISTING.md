# Acquire.com Listing — Kalunez

Copy-paste ready content for [Acquire.com](https://acquire.com). Listing language is **English**.

> **Important:** Be honest. Do not claim revenue you do not have. Do not claim features that are not shipped (or mark them clearly as roadmap).

---

## Listing title (pick one)

**Option A (recommended):**  
`Kalunez — App Store Music & Live Platform (iOS + Web, Android Ready, Full Source)`

**Option B:**  
`Creator Music Streaming + Ticketed Live Events — Native iOS, Web, Supabase Backend`

**Option C:**  
`Turnkey Indie Music Platform — RevenueCat IAP, Live Streaming, Domain Included`

---

## Tagline

**Stream. Create. Connect.** — App Store–approved music streaming and live concert platform for independent artists. Web + native iOS live today; Android Capacitor project included. Full source, Supabase backend, domain, and IP included.

---

## Asking price (guidance)

| Tier | Range (USD) | When |
|------|-------------|------|
| Quick sale | $18,000 – $28,000 | Need a fast close |
| Fair market | $35,000 – $55,000 | iOS live + Android project + docs |
| Premium | $60,000 – $90,000+ | Strong demo video + both stores live |

**Suggested list price after Android is on Play Store:** `$49,000` (negotiable).  
**If listing before Android ships:** `$39,000` and pitch Android as included Capacitor project / near-term launch.

**Private floor:** decide for yourself (~70% of list).

---

## Short description

**Kalunez** is an App Store–approved music streaming and live broadcasting platform for artists and fans. Artists upload tracks, go live (browser or OBS), sell optional concert tickets, earn tips, and get paid via Stripe Connect. Listeners stream, chat, tip, and subscribe via Apple IAP (RevenueCat). Stack: React, Supabase, RevenueCat, Capacitor (iOS live, Android project included). Live at **kalunez.com**. Pre-revenue ($0 MRR) — clean handover of code, backend, domain, and IP.

---

## Full listing description

### Overview

**Kalunez** helps independent artists keep performing and earning when physical shows are hard — or impossible — while giving fans a place to discover music, join live streams, and support creators.

**Included platforms**
- ✅ Native **iOS** app — **approved on the App Store** (`com.kalunez.app`)
- ✅ **Web / PWA** at www.kalunez.com
- ✅ **Android** Capacitor project in the repo (same codebase — buyer or seller completes Play Store listing)

**Monetization (live in product)**
- RevenueCat subscriptions (Pro / Premium / Premium+Podcast, monthly & yearly)
- Fan tips (consumables) with Stripe Connect artist payouts (90/10)
- Optional **ticketed live events** (artist-set price: 49 / 99 / 149 NOK tiers)
- Free Go Live remains available (no paywall on discovery streams)

**Current status**
- ✅ App Store–approved iOS build
- ✅ Supabase backend (Postgres, Auth, Storage, Edge Functions) — **no Base44 dependency**
- ✅ RevenueCat + Apple IAP
- ✅ Live streaming (LiveKit + Mux)
- ✅ Chat, profiles, messages, playlists, collab rooms
- ✅ Legal pages: Terms, Privacy, DMCA, Cookies
- ✅ Docs + tests (Vitest / CI)
- ❌ $0 MRR / no paying subscriber base (honest clean slate)

---

### Why buyers care

| Buyer need | Kalunez |
|------------|---------|
| Skip 12–18 months of build | Full product + App Store approval |
| Dual mobile opportunity | iOS live; Android same Capacitor codebase |
| Payments that App Stores allow | RevenueCat / IAP (not sideloaded Stripe checkout in-app) |
| Ownable stack | Supabase + GitHub — not locked to a no-code host |
| Growth story | Ticketed concerts, Android launch, niche artist GTM |

**Problem framing (use this, not “another Spotify”):**  
If a concert is canceled or an artist cannot get a venue, they can still perform online, sell access, take tips, and keep the relationship with fans.

---

### Product features

**Listeners:** Discover, library, playlists, floating player, follow, messages, activity feed, tip artists, subscribe, buy event tickets.

**Artists:** Upload with rights attestation, Go Live (webcam or OBS), Create Event (free or paid), dashboard, analytics, Stripe Connect onboarding, collab rooms.

**Ops:** Admin analytics at `/analytics` (role=`admin`); deeper ops via Supabase + RevenueCat dashboards.

---

### Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 6, Tailwind, shadcn/ui |
| Backend | **Supabase** (Auth, Postgres, Storage, Edge Functions) |
| Payments | **RevenueCat** (IAP + Web Billing) + **Stripe Connect** (payouts only) |
| Live | LiveKit (browser), Mux (OBS/RTMP) |
| Native | **Capacitor** — iOS shipped, Android project included |
| Hosting | Vercel + kalunez.com |
| Analytics / errors | PostHog, Sentry (optional) |

---

### What's included

| Asset | Included |
|-------|----------|
| Domain **kalunez.com** | ✅ (confirm in listing) |
| Full GitHub source | ✅ |
| Supabase project handover | ✅ |
| Vercel project | ✅ |
| App Store app / Bundle ID | ✅ |
| Android Capacitor project | ✅ |
| RevenueCat project | ✅ |
| Stripe Connect setup docs | ✅ |
| Brand **Kalunez** + support email | ✅ |
| Existing users / MRR | ❌ None |

**Buyer setup time:** typically a few hours for keys + store accounts; Android Play listing is the main remaining mobile milestone if not finished before sale.

---

### Growth levers

1. Finish / scale **Android** on Google Play (same app code)  
2. Artist acquisition in one genre or city  
3. Ticketed live events + festivals  
4. Podcast publishing module (billing tiers already exist)  
5. White-label for labels / schools  

---

## Key metrics (honest)

| Metric | Value |
|--------|-------|
| Monthly revenue (MRR) | $0 |
| Annual revenue | $0 |
| App Store | Approved (iOS) |
| Android | Capacitor project (Play listing TBD / update when live) |
| Registered users | _Check Supabase Auth_ |
| Team size | 1 |
| Hours/week to maintain | ~2–5 |

---

## Reason for selling

> Built and shipped a complete dual-path music platform (web + App Store iOS, Android codebase ready). Seeking an operator with marketing and artist-relations strength to scale distribution and both mobile stores.

---

## FAQ

**Q: Is there revenue?**  
A: No. Monetization is integrated (RevenueCat + Stripe Connect). Clean slate for the buyer.

**Q: Is Base44 required?**  
A: No. The product runs on Supabase. Base44 is not part of the stack.

**Q: iOS and Android?**  
A: iOS is App Store approved. Android uses the same Capacitor web codebase; Play Console listing is the remaining store step (included in repo / docs).

**Q: Ticketed concerts?**  
A: Yes — optional paid events alongside free Go Live and tips.

**Q: Domain included?**  
A: Yes / negotiable — state clearly in the listing.

---

## Screenshots & demo video

1. App Store listing / iPhone home  
2. Discover + player  
3. Go Live / live + chat  
4. Create Event + Get Ticket  
5. Pricing / IAP  
6. Artist dashboard + Connect  
7. Web + phone side-by-side  
8. (When ready) Android Play screenshot  

Demo video: use the honest script in chat history (Go Live, tips, tickets, App Store — not fake Ticketmaster UI).

---

## Norsk notat til deg

- List **etter** Base44-cutover + gjerne når Android er på Play (høyere pris)  
- Hvis du lister **før** Android er live: vær ærlig — «Android project included, Play launch ready»  
- Ikke nevn Base44  
- Pris foreslått: **$39k** før Play, **$49k** med begge butikker  

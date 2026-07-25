# Kalunez — Confidential Product Overview (CIM)
**For Acquire.com curation review**

| Field | Detail |
|-------|--------|
| **Product** | Kalunez |
| **URL** | https://www.kalunez.com |
| **Type** | Pre-revenue SaaS / asset sale |
| **Seller** | Baard Onsum (Norway) |
| **Status** | Production web + **App Store–approved iOS**; Android Capacitor project included |
| **Revenue** | $0 MRR (clean handover) |
| **Backend** | Supabase (not Base44) |

Full listing copy: [`docs/ACQUIRE_LISTING.md`](./ACQUIRE_LISTING.md)  
Leave Base44 checklist: [`docs/BASE44_CUTOVER.md`](./BASE44_CUTOVER.md)

---

## 1. Executive summary

Kalunez is a **production music streaming and live concert platform** for independent artists and fans. Artists upload music, go live, optionally sell ticketed events, earn tips, and receive payouts via Stripe Connect. Fans stream, chat, tip, and subscribe via **RevenueCat / Apple IAP**.

**Included in sale:** domain (kalunez.com), full source, Supabase backend, Vercel hosting, App Store iOS app, Android Capacitor project, RevenueCat project, brand, documentation, handover support.

---

## 2. Platforms

| Platform | Status |
|----------|--------|
| Web / PWA | Live at kalunez.com |
| iOS (Capacitor) | **App Store approved** — `com.kalunez.app` |
| Android (Capacitor) | Project in repo — complete Play Console to list as dual-store |

---

## 3. Monetization

- Subscriptions (Pro / Premium / Premium+Podcast) via RevenueCat
- Tips (consumables) + Stripe Connect artist payouts (90/10)
- Optional ticketed live events (49 / 99 / 149 NOK product tiers)
- Free Go Live remains for discovery (no forced paywall)

---

## 4. Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind, shadcn/ui |
| Backend | Supabase (Auth, Postgres, Storage, Edge Functions) |
| Payments | RevenueCat + Stripe Connect (payouts) |
| Live | LiveKit + Mux |
| Native | Capacitor iOS + Android |
| Hosting | Vercel |

---

## 5. Why this is acquirable

- App Store approval already done (high buyer friction removed)
- Modern, portable stack — not locked to a no-code host
- Dual-mobile path (iOS live, Android same codebase)
- Clear problem: keep artist income when physical shows fail
- Pre-revenue = clean financials for buyer

---

## 6. Honest limitations

- $0 MRR / limited organic users
- Android not necessarily on Play Store until seller/buyer finishes listing
- Podcast billing tiers exist; dedicated podcast CMS is roadmap
- Admin analytics exist; full CMS admin panel is ops via Supabase

---

## 7. Suggested ask

- **Before Android on Play:** ~$39,000  
- **With iOS + Android both live:** ~$49,000  

See `docs/ACQUIRE_LISTING.md` for full copy-paste listing.

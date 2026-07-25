# Ticketed Live Events — Kalunez

Optional paid concerts on top of free Go Live. Free streams and tips still work as before.

## Model

| Type | How |
|------|-----|
| Free Go Live | `/go-live` — immediate, everyone can watch |
| Scheduled free event | `/create-event` → Free live |
| Scheduled paid event | `/create-event` → Paid ticket (49 / 99 / 149 kr) |

## Setup

1. Run SQL migration in Supabase SQL Editor:
   - `supabase/migrations/0002_ticketed_events.sql`
2. RevenueCat + App Store Connect — add **consumable** products:
   - `event_ticket_49`
   - `event_ticket_99`
   - `event_ticket_149`
3. Attach them to the default Offering with the **same package identifiers**.
4. Redeploy webhook: `supabase functions deploy handleRevenueCatWebhook`

## Artist flow

1. Create Event → publish
2. Event appears under **Upcoming** on `/live`
3. When ready: open event → **Start Stream** → `/go-live?eventId=…`

## Fan flow

1. Open upcoming / live event
2. If paid → **Get Ticket** (Apple IAP / RevenueCat)
3. Watch when live + tip as usual

## Code map

- Migration: `supabase/migrations/0002_ticketed_events.sql`
- Purchase: `purchaseEventTicket` in `src/lib/revenuecat.js`
- UI: `CreateEvent.jsx`, `EventCard.jsx`, `GetTicketButton.jsx`, updates in `Live.jsx`, `StreamDetail.jsx`, `GoLive.jsx`

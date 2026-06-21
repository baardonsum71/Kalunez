# Analytics Setup — PostHog + Internal Traction Metrics

Kalunez tracks product analytics via **PostHog** and stores key business events internally for traction reporting (Acquire.com due diligence).

## Dual tracking

| Layer | Purpose |
|-------|---------|
| **PostHog** | Product analytics, funnels, session replay, retention |
| **AnalyticsEvent entity** | Internal DB for platform/artist dashboards |

---

## Step 1: PostHog (free tier: 1M events/month)

1. Create account at [https://posthog.com](https://posthog.com)
2. Create project → copy **Project API Key**
3. Add to `.env.local`:

```
VITE_POSTHOG_KEY=phc_xxxxxxxx
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

For EU hosting use `https://eu.i.posthog.com`.

---

## Step 2: Deploy backend functions

| Function | Purpose |
|----------|---------|
| `getPlatformAnalytics` | Admin traction dashboard (DAU, revenue, top tracks) |
| `getArtistAnalytics` | Artist play charts and stats |

---

## Step 3: Admin access

Set a user's `role` to `admin` in Base44 to access `/analytics`.

---

## Tracked events

| Event | Trigger |
|-------|---------|
| `page_view` | Every route change |
| `track_played` | Floating player / play button |
| `track_uploaded` | Successful upload |
| `stream_started` | Go Live |
| `stream_viewed` | Open stream page |
| `tip_initiated` | Tip checkout started |
| `subscription_checkout` | Pricing page checkout |
| `follow_artist` | Follow button |
| `artist_profile_viewed` | Artist profile page |
| `user_identified` | Login / auth |

---

## Dashboards

### Platform Analytics (`/analytics`)
Admin-only. Shows:
- DAU / MAU (7d / 30d)
- Page views, plays, streams, tips, subscriptions
- Daily active users chart (14d)
- Top tracks, event breakdown

### Artist Dashboard
Per-artist play chart (14d) and top tracks via `getArtistAnalytics`.

---

## PostHog recommended insights

Create these in PostHog dashboard:

1. **Weekly Active Users** — unique users, 7-day rolling
2. **Conversion funnel** — page_view → track_played → follow_artist → subscription_checkout
3. **Retention** — return visits after signup
4. **Tip funnel** — stream_viewed → tip_initiated

---

## Privacy

- PostHog respects Do Not Track when configured
- No PII sent beyond email (for identified users)
- Update Privacy page if required for your jurisdiction (GDPR)

See also: `src/lib/analytics.js` for implementation details.

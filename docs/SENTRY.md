# Sentry Error Monitoring

Kalunez uses [Sentry](https://sentry.io) for error tracking, performance monitoring, and session replay on errors.

## Setup (5 minutes)

### 1. Create Sentry project

1. Go to [https://sentry.io](https://sentry.io) (free tier: 5K errors/month)
2. Create project → **React**
3. Copy your **DSN** (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)

### 2. Configure environment

Add to `.env.local`:

```
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_ENABLED=true
```

For production (Base44 publish / Vercel / Netlify):

```
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=production
```

Sentry is **enabled automatically in production builds** (`import.meta.env.PROD`).
In development, set `VITE_SENTRY_ENABLED=true` to test locally.

### 3. Deploy

Rebuild and publish the app. Errors will appear in your Sentry dashboard within seconds.

---

## What's monitored

| Source | Coverage |
|--------|----------|
| React render errors | `ErrorBoundary` → Sentry |
| Unhandled JS errors | Automatic |
| Unhandled promise rejections | Automatic |
| API / mutation failures | React Query `onError` |
| User context | Email, tier, role on login |
| Performance | 20% trace sample rate in prod |
| Session replay | 100% on errors, 5% of sessions |

---

## Recommended Sentry alerts

In Sentry → **Alerts**, create:

1. **New issue** — email/Slack when a new error type appears
2. **Spike in errors** — more than 10 events in 1 hour
3. **Checkout failures** — filter `transaction:*checkout*` or message contains `Stripe`

---

## Source maps (optional, recommended for production)

For readable stack traces in minified builds:

1. Sentry → Settings → Auth Tokens → create token with `project:releases`
2. Add to CI/build environment:

```
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org
SENTRY_PROJECT=kalunez
```

3. Install build plugin (optional upgrade):

```bash
npm install @sentry/vite-plugin --save-dev
```

See [Sentry Vite docs](https://docs.sentry.io/platforms/javascript/guides/react/sourcemaps/) for plugin config.

---

## Privacy

- Session replay masks all text and blocks media by default
- Authorization headers are stripped before send
- No credit card or password data is captured

Update `Privacy.jsx` to mention Sentry if operating in EU (GDPR).

---

## Files

| File | Purpose |
|------|---------|
| `src/lib/sentry.js` | Init, user context, capture helpers |
| `src/components/ErrorBoundary.jsx` | Reports React crashes |
| `src/lib/query-client.js` | Reports mutation errors |
| `src/components/AnalyticsProvider.jsx` | Sets user on login |

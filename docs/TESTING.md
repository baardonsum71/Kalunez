# Testing & CI

Kalunez uses **Vitest** for unit tests and **GitHub Actions** for continuous integration.

## Run tests locally

```bash
npm run test          # single run
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

## What's tested

| Area | Tests |
|------|-------|
| `src/lib/utils.js` | Tailwind class merging |
| `src/lib/playerStore.js` | Global audio player state |
| `src/lib/streaming.js` | LiveKit/Mux helpers |
| `src/lib/stripe.js` | Plan config, formatting |
| `src/lib/sentry.js` | Safe no-op when disabled |
| `src/hooks/useDebounce.js` | Debounce timing |
| `src/components/ErrorBoundary.jsx` | Crash fallback UI |

## CI pipeline

On every push/PR to `main` or `master`:

1. **Lint** — ESLint
2. **Test** — Vitest unit tests
3. **Build** — Production Vite build

See `.github/workflows/ci.yml`.

## Adding tests

Place test files next to source files:

```
src/lib/myModule.js
src/lib/myModule.test.js
```

Use `@/` imports — configured in `vitest.config.js`.

Mocks for Base44, PostHog, and Sentry live in `src/test/setup.js`.

## Coverage

Coverage reports are generated with `npm run test:coverage` and uploaded as CI artifacts (7-day retention).

Target critical paths: payments, streaming, auth, and analytics helpers.

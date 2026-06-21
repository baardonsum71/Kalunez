# Deployment Guide — Kalunez

Kalunez is a **static Vite frontend** + **Base44 backend**. You deploy the `dist/` folder; API/auth stays on Base44.

## Prerequisites

- GitHub repo with this code pushed
- Base44 app running (App ID in `.env.example`)
- Production env vars set on your host

---

## 1. Push to GitHub

If the repo is not on GitHub yet:

```bash
cd /Users/bonsum/Projects/tentacled-stream-vibe-live-3

# Create empty repo at https://github.com/new (name: kalunez, private recommended)
git remote add origin git@github.com:YOUR_USERNAME/kalunez.git
# or HTTPS:
# git remote add origin https://github.com/YOUR_USERNAME/kalunez.git

git push -u origin main
```

**SSH (recommended):** Generate a key if needed:

```bash
ssh-keygen -t ed25519 -C "baardonsum@hotmail.no"
cat ~/.ssh/id_ed25519.pub
```

Add the public key at [GitHub → Settings → SSH keys](https://github.com/settings/keys).

**HTTPS:** Use a [Personal Access Token](https://github.com/settings/tokens) as password when pushing.

---

## 2. Deploy with Vercel (recommended)

Config: `vercel.json` (SPA rewrites for React Router).

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your `kalunez` GitHub repo
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add **Environment Variables** (Production):

| Variable | Value |
|----------|--------|
| `VITE_BASE44_APP_ID` | Your Base44 app ID |
| `VITE_BASE44_APP_BASE_URL` | `https://YOUR-APP.base44.app` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` |
| `VITE_STRIPE_PRICE_*` | Stripe price IDs |
| `VITE_POSTHOG_KEY` | Optional analytics |
| `VITE_SENTRY_DSN` | Optional monitoring |
| `VITE_LIVEKIT_URL` | Optional live streaming |
| `VITE_MUX_ENABLED` | `true` if using Mux |

7. Deploy → your app will be at `https://kalunez.vercel.app` (or custom domain)

**Custom domain:** Vercel → Project → Settings → Domains → add `kalunez.com`.

---

## 3. Deploy with Netlify

Config: `netlify.toml` included.

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → Import from Git
2. Build: `npm run build`, Publish: `dist`
3. Set the same `VITE_*` env vars under **Site settings → Environment variables**
4. Deploy

---

## 4. Deploy with Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Connect Git
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Add `VITE_*` environment variables
5. **SPA fallback:** add redirect rule `/*` → `/index.html` (200)

---

## 5. Base44 backend secrets

These are **not** frontend env vars — set in **Base44 Dashboard → Secrets**:

- `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_ALLOWED_PRICES`
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`
- `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`
- `BASE44_APP_URL` → your deployed frontend URL (for Stripe redirects)

After deploy, update `BASE44_APP_URL` to your production domain.

---

## 6. Post-deploy checklist

- [ ] All routes work (refresh on `/discover`, `/terms`, etc.)
- [ ] Sign in / sign up via Base44 auth
- [ ] Cookie banner appears; analytics only after consent
- [ ] Upload track + rights attestation
- [ ] Stripe checkout (test mode first)
- [ ] Sync entity schemas in Base44 (`rights_attested_at` on Track/LiveStream)
- [ ] Stripe webhook URL points to Base44 function endpoint

---

## 7. CI (GitHub Actions)

`.github/workflows/ci.yml` runs on push/PR to `main`:

- ESLint
- Vitest with coverage
- Production build

No deploy step yet — connect Vercel/Netlify to GitHub for automatic deploys on push.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page after refresh | SPA rewrite missing — check `vercel.json` / Netlify redirects |
| Auth fails | Wrong `VITE_BASE44_APP_BASE_URL` or app not public |
| Stripe redirect wrong | Set `BASE44_APP_URL` in Base44 secrets to production URL |
| Live streaming fails | Add LiveKit/Mux credentials in Base44 + frontend env |

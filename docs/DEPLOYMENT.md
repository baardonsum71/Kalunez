# Deployment Guide — Kalunez

Kalunez is a **static Vite frontend** + **Supabase backend** (Postgres, Auth, Storage, Edge Functions). You deploy the `dist/` folder; the frontend talks directly to Supabase.

## Prerequisites

- GitHub repo with this code pushed
- Supabase project set up — see [docs/SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- Production env vars set on your host

---

## 1. Push to GitHub

**Your repo:** [github.com/baardonsum71/kalunez](https://github.com/baardonsum71/kalunez)

Remote is configured as:

```text
https://github.com/baardonsum71/kalunez.git
```

### First-time setup

1. **Create the empty repo** (if it does not exist yet):  
   [Create kalunez on GitHub →](https://github.com/new?name=kalunez&owner=baardonsum71)  
   Do **not** add README, .gitignore, or license — this project already has commits.

2. **Authenticate** (pick one):

   **SSH (recommended)**
   ```bash
   ssh-keygen -t ed25519 -C "baardonsum@hotmail.no"
   cat ~/.ssh/id_ed25519.pub
   ```
   Add the key at [GitHub → SSH keys](https://github.com/settings/keys), then:
   ```bash
   git remote set-url origin git@github.com:baardonsum71/kalunez.git
   ```

   **HTTPS + Personal Access Token**
   - Create token: [github.com/settings/tokens](https://github.com/settings/tokens) (scope: `repo`)
   - Use the token as password when Git pushes

3. **Push**
   ```bash
   cd /Users/bonsum/Projects/tentacled-stream-vibe-live-3
   git push -u origin main
   ```
   Or run the helper script:
   ```bash
   chmod +x scripts/github-push.sh && ./scripts/github-push.sh
   ```

---

## 2. Deploy with Vercel (recommended)

Config: `vercel.json` (SPA rewrites for React Router).

1. Push code to [github.com/baardonsum71/kalunez](https://github.com/baardonsum71/kalunez) first
2. Go to [vercel.com/new](https://vercel.com/new) → Import **baardonsum71/kalunez**
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add **Environment Variables** (Production):

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://YOUR-PROJECT-REF.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_REVENUECAT_PUBLIC_KEY` | RevenueCat Web Billing public key |
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

## 5. Supabase Edge Function secrets

These are **not** frontend env vars — set via `supabase secrets set` or the Supabase Dashboard:

- `STRIPE_API_KEY` → payout rail only, see [docs/PAYMENTS.md](PAYMENTS.md)
- `REVENUECAT_WEBHOOK_AUTH`
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`
- `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`
- `APP_URL` → your deployed frontend URL (for Connect onboarding redirects)

After deploy, update `APP_URL` to your production domain and redeploy the affected functions.

---

## 6. Post-deploy checklist

- [ ] All routes work (refresh on `/discover`, `/terms`, etc.)
- [ ] Sign in / sign up via Supabase Auth (email + Sign in with Apple)
- [ ] Cookie banner appears; analytics only after consent
- [ ] Upload track + rights attestation
- [ ] RevenueCat subscription purchase (sandbox first)
- [ ] Database migration applied (`supabase db push`)
- [ ] RevenueCat webhook URL points to `handleRevenueCatWebhook` function

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
| Auth fails | Wrong `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, or Apple provider not configured |
| Connect onboarding redirect wrong | Set `APP_URL` in Supabase Edge Function secrets to production URL |
| Live streaming fails | Add LiveKit/Mux credentials as Supabase Edge Function secrets + frontend env |

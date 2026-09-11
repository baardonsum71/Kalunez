# Resubmit checklist — build 24 (IAP + iPad nav)

## Code (this PR)
- [x] iPhone only (`TARGETED_DEVICE_FAMILY = 1`)
- [x] Build number **24**
- [x] Compact native nav (no overflowing top links)
- [x] Phone-width column on large canvases
- [x] Pricing grid decluttered

## App Store Connect — must do before submit
1. **Subscriptions / In-App Purchases**
   - Open each product → fill missing metadata (review screenshot + description)
   - Status must be **Ready to Submit**
2. When submitting the app version, **select the IAP products** so they go in review with the binary
3. Paste `docs/ASC_RESOLUTION_CENTER_REPLY.md` into Resolution Center

## Local build
```bash
# .env.local must have:
# VITE_REVENUECAT_IOS_PUBLIC_KEY=appl_...

npm run build:ios
npx cap sync ios
# Xcode → Archive → Upload → TestFlight
# Verify StoreKit sheet on device before Submit for Review
```

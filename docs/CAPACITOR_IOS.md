# Capacitor iOS Setup — Kalunez

Kalunez's existing React/Vite web app is wrapped in a native iOS shell using [Capacitor](https://capacitorjs.com). The web codebase is unchanged — Capacitor just loads the built `dist/` output inside a native WebView and exposes native APIs (camera, purchases, status bar, etc.) via plugins.

**This setup does not affect the web/PWA deployment or Android in any way.** The `ios/` folder is a separate, additive native project. Adding `@capacitor/android` later would reuse the exact same web code.

## What's already done

| Item | Status |
|------|--------|
| `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios` installed | ✅ |
| `capacitor.config.ts` (app ID `com.kalunez.app`, dark theme) | ✅ |
| Native Xcode project generated (`ios/App`) | ✅ |
| App icon (1024×1024, matches brand) installed in `Assets.xcassets` | ✅ |
| Branded splash screen (navy background, logo) installed | ✅ |
| Camera / microphone / photo library usage descriptions in `Info.plist` | ✅ (required for Go Live + Upload) |
| Status bar + keyboard native plugins wired (`src/lib/nativeBootstrap.js`) | ✅ |
| RevenueCat native plugin (`@revenuecat/purchases-capacitor`) wired into `src/lib/revenuecat.js`, auto-switches between native IAP and Web Billing based on platform | ✅ |
| In-app browser (`@capacitor/browser`) for opening external links (subscription management, Stripe Connect) from the native app | ✅ |

## What you still need to do manually

None of this can be automated — it requires your own Apple Developer account and physical/manual steps in Xcode.

### 1. Apple Developer Program

Same account referenced in `docs/APPLE_SIGNIN_SETUP.md` ($99/year). Bundle ID `com.kalunez.app` should already be registered there for Sign in with Apple — reuse it here.

### 2. Configure signing in Xcode

```bash
npm run cap:open:ios
```

In Xcode:
1. Select the **App** target → **Signing & Capabilities**
2. Team: select your Apple Developer team
3. Confirm Bundle Identifier is `com.kalunez.app` (or update `capacitor.config.ts` + re-run `npm run cap:sync` if you use a different one)
4. Xcode will auto-generate a provisioning profile

### 3. RevenueCat: add an iOS app

1. RevenueCat Dashboard → your project → **Apps** → **+ New** → **App Store**
2. Enter your Bundle ID (`com.kalunez.app`)
3. Copy the **Public API Key** (starts with `appl_`) → set as `VITE_REVENUECAT_IOS_PUBLIC_KEY` in `.env`
4. Attach the same Products/Entitlements you created for Web Billing (see `docs/REVENUECAT_SETUP.md`) to this iOS app — RevenueCat lets one Offering serve multiple platforms once each platform's store products are linked

### 4. Create matching In-App Purchase products in App Store Connect

For every plan in `src/lib/revenuecat.js` (`pro_monthly`, `premium_monthly`, etc.) and the `tip_credit_*` consumables:

1. [App Store Connect](https://appstoreconnect.apple.com) → your app → **Features → In-App Purchases**
2. Create matching **Auto-Renewable Subscriptions** (plans) and **Consumables** (tips) with the *same product identifiers* used in RevenueCat
3. Submit for review alongside your app binary (first-time IAP products require Apple review)

### 5. Sync web build into the native project

Every time you change frontend code:

```bash
npm run cap:sync
```

This runs `vite build` then copies `dist/` into `ios/App/App/public` and updates native plugin config.

### 6. Run on a simulator or device

```bash
npm run cap:open:ios
```

Then press ▶️ in Xcode. Note: **RevenueCat/StoreKit purchases do not work in the iOS Simulator for real transactions** — use a physical device with a Sandbox Apple ID (App Store Connect → Users and Access → Sandbox Testers), or Xcode's StoreKit Testing configuration for local testing.

### 7. TestFlight → App Store submission

1. Xcode → **Product → Archive**
2. **Distribute App** → App Store Connect → Upload
3. In App Store Connect, add the build to a **TestFlight** group for internal testing first
4. Once verified, submit for **App Store Review** with:
   - App Privacy details (what data Kalunez collects — see `src/pages/Privacy.jsx`)
   - Screenshots from the live app (Pricing, Discover, Live, Go Live)
   - Demo account credentials for the reviewer (a test Kalunez login)
   - Age rating (likely 12+ or 17+ given UGC + live streaming)

## Known limitations / follow-ups

- **Sign in with Apple on native**: the current `/login` flow uses Supabase's browser-redirect OAuth, which works in Capacitor's WebView but gives a slightly less native feel than Apple's native `ASAuthorizationController` sheet. If you want the fully native Apple sign-in sheet, add `@capacitor-community/apple-sign-in` and pass its identity token to `supabase.auth.signInWithIdToken({ provider: 'apple', token })` instead — not yet implemented.
- **Background audio**: `UIBackgroundModes` audio is enabled; lock screen / Control Center uses Media Session.
- **Push notifications**: not implemented. Add `@capacitor/push-notifications` + APNs setup if needed later.
- **Android**: Capacitor Android project is added — see `docs/CAPACITOR_ANDROID.md` (Play Console + `goog_...` key still required before store launch).

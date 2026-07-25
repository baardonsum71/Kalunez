# Sign in with Apple — Setup

Requires an active **Apple Developer Program** membership ($99/year, developer.apple.com). This is the same account you will later use for App Store submission.

## 1. Register an App ID

**developer.apple.com → Certificates, Identifiers & Profiles → Identifiers → +**

- Type: **App IDs** → **App**
- Bundle ID: `com.kalunez.app` (or your chosen reverse-domain ID — keep it consistent, you'll reuse it for the future iOS app)
- Capabilities: enable **Sign in with Apple**

## 2. Register a Services ID (used for web/Supabase OAuth)

**Identifiers → + → Services IDs**

- Identifier: `com.kalunez.web` (must differ from the App ID)
- Enable **Sign in with Apple** → **Configure**:
  - Primary App ID: select the App ID from step 1
  - Domains: `<your-project-ref>.supabase.co`
  - Return URLs: `https://<your-project-ref>.supabase.co/auth/v1/callback`

## 3. Create a Sign in with Apple private key

**Keys → + →** name it `Kalunez Supabase Auth`, enable **Sign in with Apple**, configure with the App ID from step 1.

Download the `.p8` key file **once** (Apple will not let you download it again) and note the **Key ID**.

## 4. Gather the four values Supabase needs

| Value | Where to find it |
|-------|-------------------|
| **Services ID** | `com.kalunez.web` from step 2 |
| **Team ID** | developer.apple.com → Membership |
| **Key ID** | From step 3 |
| **Private Key (.p8 contents)** | The downloaded file from step 3 |

## 5. Configure in Supabase

**Supabase Dashboard → Authentication → Providers → Apple** → paste in the four values above → **Save**.

## 6. Update redirect URL in code (already handled)

The frontend calls:

```js
supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin } });
```

No further code change needed once the provider is configured server-side.

## 7. Test

Open the deployed app → `/login` → **Sign in with Apple** → should redirect to Apple's consent screen and back to Kalunez, logged in.

---

This same Apple Developer account, App ID, and bundle ID will be reused later when building the native iOS app for the App Store.

# App Store Connect — Resolution Center reply (build 16+)

Paste when replying to Guidelines **4**, **2.1(b)**, and **2.3.3**.

---

Hello App Review Team,

Thank you for the feedback. We have addressed the issues in this build as follows.

### Guideline 4 — Design / screen sizes

This build is configured for **iPhone only** (device family iPhone). We removed iPad as a target so the UI is no longer shown as an unoptimized iPad experience. Portrait orientation is supported on iPhone. Please review on iPhone.

### Guideline 2.1(b) — In-App Purchase / Subscribe

We fixed the subscription flow so Subscribe / Get Started cannot spin indefinitely:

- Native StoreKit purchases via RevenueCat with hard timeouts and clear on-screen errors.
- Product preflight on Pricing and Upgrade to Pro.
- Please test with the sandbox account below on **iPhone**.

**Sandbox account:** review@kalunez.app (password in App Review Information)

**Steps to purchase:**
1. Sign in with the review account.
2. Open **Pricing** (or Upgrade to Pro).
3. Tap **Get Started** on **Premium Monthly** (`premium_monthly_subscription`) — or Subscribe Now on Pro Monthly.
4. The App Store payment sheet should appear within a few seconds.

### Guideline 2.3.3 — Screenshots / metadata

We uploaded new screenshots for the required iPhone display sizes that match the current app UI (Discover, Live, Pricing / subscription, Go Live / music playback). Please use the screenshots attached to this version.

Please let us know if you need anything else.

Best regards,  
Kalunez Team

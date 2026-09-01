# App Store Connect — Resolution Center reply (build 19+)

Paste when replying to Guidelines **4** and **2.1(b)**.

---

Hello App Review Team,

Thank you for the feedback on version 1.0. We have addressed the issues in this build as follows.

### Guideline 4 — Design (crowded interface on iPad)

Kalunez is an **iPhone-only** app (`TARGETED_DEVICE_FAMILY = 1`, portrait, full screen). It is not designed as a universal iPad app.

In this build we further reduced crowding for the iPhone UI (and when the iPhone binary is opened in compatibility mode on iPad):

- Primary navigation limited to a small set of destinations; secondary actions stay in one menu
- Home and Pricing simplified (single-column plans on device, clearer Premium Monthly CTA)
- On larger viewports, the native UI stays in a phone-width column so controls are not stretched across the iPad canvas

**Please review on iPhone.** If you must open the binary on iPad, use the iPhone compatibility window rather than treating it as a native iPad layout.

### Guideline 2.1(b) — In-App Purchase

We fixed the purchase path so Subscribe / Get Started opens the App Store payment sheet instead of hanging or failing with a wrong API key.

Sandbox account: review@kalunez.app (password in App Review Information)

Steps to verify:
1. Sign in with the review account
2. Open **Pricing**
3. Tap **Get Started** on **Premium Monthly** (`premium_monthly_subscription`)
4. The App Store / StoreKit payment sheet should appear

Products are Cleared for Sale and linked in RevenueCat Offerings. Paid Apps Agreement is active.

Please let us know if you need anything else.

Best regards,  
Kalunez Team

# App Store Connect — Resolution Center reply

Paste this (or adapt) when replying to the rejection for Guidelines **4.2** and **2.1(b)**.

---

Hello App Review Team,

Thank you for the feedback. We have addressed both issues in this build.

### Guideline 2.1(b) — In-App Purchase / Get Started / Subscribe Now

We fixed the subscription purchase flow so Subscribe Now / Get Started can no longer load indefinitely:

- Native StoreKit purchases via RevenueCat with hard timeouts and clear on-screen errors if products are unavailable or the payment sheet does not appear.
- Preflight check of App Store products on the Pro and Pricing screens.
- Please test with the provided sandbox account: sign in → Upgrade to Pro → Subscribe Now (or Pricing → Get Started). The App Store payment sheet should appear.

### Guideline 4.2 — Minimum Functionality / native experience

Kalunez is a music and live streaming app (not a generic website wrapper). This build adds and surfaces native iOS functionality reviewers can verify:

- Background audio playback (`UIBackgroundModes` audio) so listening continues when the device is locked
- Lock screen / Control Center Now Playing controls via Media Session (play, pause, seek)
- Native system share sheet (Capacitor Share) for tracks and live streams
- Haptic feedback on playback and successful purchases
- Camera and microphone for Go Live broadcasts
- StoreKit In-App Purchases for subscriptions and event tickets

We believe this provides a robust native user experience beyond a simple web browsing shell.

Please let us know if you need any additional information.

Best regards,  
Kalunez Team

# App Store Connect — Resolution Center reply (build 21+)

Paste for Guideline **2.1(b)**.

---

Hello App Review Team,

Thank you for the feedback. We fixed a race where Subscribe could start before App Store products finished loading, which caused the payment sheet to time out.

In this build:
- Pricing waits until App Store products are loaded before enabling Get Started
- Premium Monthly is highlighted first for testing
- We verified the flow in TestFlight sandbox on iPhone

**Sandbox account:** review@kalunez.app (password in App Review Information)

**Steps:**
1. Sign in with the review account
2. Open Pricing and wait until product loading finishes
3. Tap Get Started on **Premium Monthly** (`premium_monthly_subscription`)
4. The App Store payment sheet should appear

Paid Apps Agreement is Active; products are Cleared for Sale and linked in RevenueCat.

Best regards,  
Kalunez Team

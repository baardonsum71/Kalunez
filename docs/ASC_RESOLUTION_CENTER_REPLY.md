# App Store Connect — Resolution Center reply (build 20+)

Paste for Guideline **2.1(b)** (IAP error message).

---

Hello App Review Team,

Thank you for the feedback on version 1.0. We have addressed the In-App Purchase issue in this build.

### Guideline 2.1(b) — In-App Purchase

We fixed the subscription purchase path so Get Started opens the App Store payment sheet instead of showing an error.

- Native iOS uses the correct App Store RevenueCat public key (`appl_…`)
- Products are Cleared for Sale and linked in RevenueCat Offerings
- Paid Apps Agreement is Active
- We verified Premium Monthly in TestFlight / sandbox on iPhone before resubmitting

**Sandbox account:** review@kalunez.app  
(Password is in App Review Information)

**Steps to verify:**
1. Sign in with the review account
2. Open **Pricing**
3. Tap **Get Started** on **Premium Monthly** (`premium_monthly_subscription`)
4. The App Store payment sheet should appear

Please let us know if you need anything else.

Best regards,  
Kalunez Team

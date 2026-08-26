# App Store Connect — Resolution Center reply (build 17+)

Paste when replying to Guidelines **4** and **5.1.2(i)**.

---

Hello App Review Team,

Thank you for the feedback on version 1.0 (16). We have addressed the issues in this build as follows.

### Guideline 4 — Design (crowded interface)

We simplified the user interface so primary tasks are easier to complete:

- Header navigation reduced to core destinations (Discover, Library, Live, For Artists), with secondary actions in a single menu
- Home screen decluttered (fewer competing sections and CTAs)
- Pricing layout simplified with clearer plan cards and Premium Monthly highlighted for testing
- App remains **iPhone only**

Please review on iPhone.

### Guideline 5.1.2(i) — Privacy / cookies / tracking

Kalunez does **not** track users across other companies’ apps or websites in the native iOS app.

In this build:

- No cookie / tracking consent banner is shown on iOS
- Optional analytics (PostHog) and analytics event persistence are **disabled** on native iOS
- Cookie preference controls and cookie-policy links are **removed** from the native Settings / footer UI
- The app uses only essential functionality cookies required to run login and playback

We are **not** implementing App Tracking Transparency because we do not collect data for tracking as defined in Guideline 5.1.2.

### In-App Purchase (if re-tested)

Sandbox account: review@kalunez.app (password in App Review Information)

Steps:
1. Sign in with the review account
2. Open Pricing
3. Tap Get Started on **Premium Monthly** (`premium_monthly_subscription`)
4. The App Store payment sheet should appear

Please let us know if you need anything else.

Best regards,  
Kalunez Team

import { Capacitor } from '@capacitor/core';
import { CONSENT_ALL } from '@/lib/cookieConsent';
import { initAnalytics, trackPageView } from '@/lib/analytics';
import { initSentry } from '@/lib/sentry';

export function applyConsentToServices(consent) {
  // Native iOS/Android: no analytics, PostHog, or Sentry cookies (Apple 5.1.2).
  if (Capacitor.isNativePlatform()) return;

  const analyticsAllowed = consent === CONSENT_ALL;
  initSentry({ enableReplay: analyticsAllowed });
  if (analyticsAllowed) {
    initAnalytics();
    if (typeof window !== 'undefined') {
      trackPageView(window.location.pathname + window.location.search, document.title);
    }
  }
}

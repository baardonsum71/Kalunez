import { CONSENT_ALL } from '@/lib/cookieConsent';
import { initAnalytics, trackPageView } from '@/lib/analytics';
import { initSentry } from '@/lib/sentry';

export function applyConsentToServices(consent) {
  const analyticsAllowed = consent === CONSENT_ALL;
  initSentry({ enableReplay: analyticsAllowed });
  if (analyticsAllowed) {
    initAnalytics();
    if (typeof window !== 'undefined') {
      trackPageView(window.location.pathname + window.location.search, document.title);
    }
  }
}

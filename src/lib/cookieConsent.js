const CONSENT_KEY = 'kalunez_cookie_consent';

export const CONSENT_ESSENTIAL = 'essential';
export const CONSENT_ALL = 'all';

export function getCookieConsent() {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === CONSENT_ESSENTIAL || value === CONSENT_ALL) return value;
  return null;
}

export function setCookieConsent(value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent('kalunez:cookie-consent', { detail: value }));
}

export function hasAnalyticsConsent() {
  return getCookieConsent() === CONSENT_ALL;
}

export function hasConsentChoice() {
  return getCookieConsent() !== null;
}

import { Capacitor } from '@capacitor/core';

const CONSENT_KEY = 'kalunez_cookie_consent';

export const CONSENT_ESSENTIAL = 'essential';
export const CONSENT_ALL = 'all';

/** Native shells must not offer cross-app tracking cookies without ATT (Apple 5.1.2). */
export function isNativeApp() {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

export function getCookieConsent() {
  if (typeof window === 'undefined') return null;
  // iOS/Android: essential only — no analytics cookie prompts / PostHog.
  if (isNativeApp()) return CONSENT_ESSENTIAL;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === CONSENT_ESSENTIAL || value === CONSENT_ALL) return value;
  return null;
}

export function setCookieConsent(value) {
  if (typeof window === 'undefined') return;
  if (isNativeApp()) {
    localStorage.setItem(CONSENT_KEY, CONSENT_ESSENTIAL);
    window.dispatchEvent(new CustomEvent('kalunez:cookie-consent', { detail: CONSENT_ESSENTIAL }));
    return;
  }
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent('kalunez:cookie-consent', { detail: value }));
}

export function hasAnalyticsConsent() {
  if (isNativeApp()) return false;
  return getCookieConsent() === CONSENT_ALL;
}

export function hasConsentChoice() {
  if (isNativeApp()) return true;
  return getCookieConsent() !== null;
}

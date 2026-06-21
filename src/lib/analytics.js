import posthog from 'posthog-js';
import { base44 } from '@/api/base44Client';
import { hasAnalyticsConsent } from '@/lib/cookieConsent';

const KEY_EVENTS = new Set([
  'page_view',
  'track_played',
  'track_uploaded',
  'stream_started',
  'stream_viewed',
  'tip_initiated',
  'subscription_checkout',
  'follow_artist',
  'artist_profile_viewed',
  'user_identified',
]);

let initialized = false;

function getAnonymousId() {
  const key = 'kalunez_anonymous_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(key, id);
  }
  return id;
}

function getSessionId() {
  const key = 'kalunez_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `sess_${crypto.randomUUID()}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;

  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false,
    capture_pageleave: true,
    persistence: 'localStorage',
    autocapture: false,
    disable_session_recording: import.meta.env.PROD ? false : true,
  });

  initialized = true;
}

export function isAnalyticsEnabled() {
  return initialized || !!import.meta.env.VITE_POSTHOG_KEY;
}

async function persistEvent(eventName, properties = {}) {
  if (!hasAnalyticsConsent()) return;
  if (!KEY_EVENTS.has(eventName)) return;

  try {
    await base44.entities.AnalyticsEvent.create({
      event_name: eventName,
      user_email: properties.user_email || undefined,
      anonymous_id: getAnonymousId(),
      session_id: getSessionId(),
      page_path: properties.page_path || window.location.pathname,
      entity_type: properties.entity_type,
      entity_id: properties.entity_id,
      value: properties.value,
      properties_json: JSON.stringify(properties),
    });
  } catch {
    // Non-blocking — analytics should never break the app
  }
}

export function identifyUser(user) {
  if (!user || !hasAnalyticsConsent()) return;

  const traits = {
    email: user.email,
    name: user.full_name,
    subscription_tier: user.subscription_tier || 'free',
    role: user.role || 'user',
    artist_name: user.artist_name,
  };

  if (initialized) {
    posthog.identify(user.email, traits);
  }

  track('user_identified', { user_email: user.email, ...traits });
}

export function resetAnalytics() {
  if (initialized) posthog.reset();
  sessionStorage.removeItem('kalunez_session_id');
}

export function trackPageView(path, title) {
  if (!hasAnalyticsConsent()) return;

  const props = { page_path: path, page_title: title };

  if (initialized) {
    posthog.capture('$pageview', props);
  }

  persistEvent('page_view', props);
}

export function track(eventName, properties = {}) {
  if (!hasAnalyticsConsent()) return;

  if (initialized) {
    posthog.capture(eventName, properties);
  }

  persistEvent(eventName, properties);
}

export const AnalyticsEvents = {
  trackPlayed: (track) => track('track_played', {
    entity_type: 'track',
    entity_id: track.id,
    track_title: track.title,
    artist: track.artist,
  }),

  trackUploaded: (track) => track('track_uploaded', {
    entity_type: 'track',
    entity_id: track.id,
    track_title: track.title,
    artist: track.artist,
  }),

  streamStarted: (stream) => track('stream_started', {
    entity_type: 'stream',
    entity_id: stream.id,
    stream_title: stream.title,
    provider: stream.provider,
  }),

  streamViewed: (stream) => track('stream_viewed', {
    entity_type: 'stream',
    entity_id: stream.id,
    stream_title: stream.title,
    artist: stream.artist,
  }),

  tipInitiated: (artistName, amount) => track('tip_initiated', {
    entity_type: 'artist',
    artist: artistName,
    value: amount * 100,
  }),

  subscriptionCheckout: (planId, priceId) => track('subscription_checkout', {
    plan_id: planId,
    price_id: priceId,
  }),

  followArtist: (artistName) => track('follow_artist', {
    entity_type: 'artist',
    artist: artistName,
  }),

  artistProfileViewed: (artistName) => track('artist_profile_viewed', {
    entity_type: 'artist',
    artist: artistName,
  }),
};

export async function getPlatformAnalytics() {
  return base44.functions.invoke('getPlatformAnalytics', {});
}

export async function getArtistAnalytics(days = 30) {
  return base44.functions.invoke('getArtistAnalytics', { days });
}

export function formatAnalyticsCurrency(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100);
}

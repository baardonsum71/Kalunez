import { Capacitor } from '@capacitor/core';
import { supabase } from '@/api/supabaseClient';

// Product/package identifiers must match what you configure in RevenueCat
// (Project > Products / Offerings). See docs/REVENUECAT_SETUP.md.
export const SUBSCRIPTION_PLANS = [
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: '99 kr',
    period: '/month',
    tier: 'pro',
    popular: false,
    features: [
      '320kbps lossless streaming',
      'Offline playback',
      'Pro member badge',
      'Ad-free listening',
    ],
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: '69 kr',
    period: '/month',
    tier: 'premium',
    popular: false,
    features: [
      'Unlimited music uploads',
      'HD audio streaming',
      'Live streaming tools',
      'Social media integration',
      'Priority support',
    ],
  },
  {
    id: 'premium_podcast_monthly',
    name: 'Premium + Podcast',
    price: '89 kr',
    period: '/month',
    tier: 'premium_podcast',
    popular: false,
    features: [
      'Everything in Premium',
      'Unlimited podcast creation',
      'Professional podcast analytics',
      'RSS feed generation',
      'Custom podcast branding',
    ],
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: '699 kr',
    period: '/year',
    tier: 'premium',
    popular: false,
    features: [
      'Everything in Monthly',
      'Save 129 kr per year',
      'Exclusive beta features',
      'Advanced analytics',
    ],
  },
  {
    id: 'premium_podcast_yearly',
    name: 'Premium + Podcast Yearly',
    price: '899 kr',
    period: '/year',
    tier: 'premium_podcast',
    popular: true,
    features: [
      'Everything in Premium + Podcast',
      'Save 169 kr per year',
      'Advanced audience insights',
      'Export capabilities',
    ],
  },
];

export const TIP_AMOUNTS = [1, 5, 10, 20, 50, 100];

/**
 * Ticket price points for Apple IAP / RevenueCat consumables.
 * Artists can type any price; checkout snaps to the nearest of these SKUs.
 * Add matching consumables in RevenueCat / App Store Connect.
 */
export const TICKET_PRICES = [
  { id: 'event_ticket_29', price_cents: 2900, label: '29 kr' },
  { id: 'event_ticket_49', price_cents: 4900, label: '49 kr' },
  { id: 'event_ticket_69', price_cents: 6900, label: '69 kr' },
  { id: 'event_ticket_99', price_cents: 9900, label: '99 kr' },
  { id: 'event_ticket_129', price_cents: 12900, label: '129 kr' },
  { id: 'event_ticket_149', price_cents: 14900, label: '149 kr' },
  { id: 'event_ticket_199', price_cents: 19900, label: '199 kr' },
  { id: 'event_ticket_249', price_cents: 24900, label: '249 kr' },
  { id: 'event_ticket_299', price_cents: 29900, label: '299 kr' },
  { id: 'event_ticket_399', price_cents: 39900, label: '399 kr' },
  { id: 'event_ticket_499', price_cents: 49900, label: '499 kr' },
];

export const MIN_TICKET_KR = 10;
export const MAX_TICKET_KR = 5000;

export function getTicketPriceById(productId) {
  return TICKET_PRICES.find((p) => p.id === productId);
}

export function formatTicketPrice(cents) {
  return `${Math.round((cents || 0) / 100)} kr`;
}

/** Nearest App Store / RevenueCat ticket SKU for a custom price. */
export function nearestTicketTier(priceCents) {
  const cents = Number(priceCents) || 0;
  return TICKET_PRICES.reduce((best, tier) => {
    if (!best) return tier;
    return Math.abs(tier.price_cents - cents) < Math.abs(best.price_cents - cents) ? tier : best;
  }, null);
}

/** Parse artist-entered kroner → cents, or null if invalid. */
export function parseTicketPriceKr(value) {
  const raw = String(value ?? '').trim().replace(',', '.');
  if (!raw) return null;
  const kr = Number(raw);
  if (!Number.isFinite(kr)) return null;
  const rounded = Math.round(kr);
  if (rounded < MIN_TICKET_KR || rounded > MAX_TICKET_KR) return null;
  return rounded * 100;
}

// Native (iOS App Store / Google Play) purchases go through the RevenueCat
// Capacitor plugin so they use StoreKit/Billing, as Apple/Google require.
// In the browser (web app / PWA) we use RevenueCat's Web Billing SDK, which
// processes cards via Stripe under the hood — our code never touches Stripe
// directly. Both expose a near-identical `.getOfferings()`/`.setAttributes()`
// surface, so most of this module doesn't need to branch.
const IS_NATIVE = Capacitor.isNativePlatform();

let purchasesRef = null;

function getPublicKey() {
  if (!IS_NATIVE) return import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
  // Capacitor shares one native plugin; store keys differ per platform.
  if (Capacitor.getPlatform() === 'android') {
    return import.meta.env.VITE_REVENUECAT_ANDROID_PUBLIC_KEY;
  }
  return import.meta.env.VITE_REVENUECAT_IOS_PUBLIC_KEY;
}

function getMissingKeyVarName() {
  if (!IS_NATIVE) return 'VITE_REVENUECAT_PUBLIC_KEY';
  if (Capacitor.getPlatform() === 'android') return 'VITE_REVENUECAT_ANDROID_PUBLIC_KEY';
  return 'VITE_REVENUECAT_IOS_PUBLIC_KEY';
}

async function getPurchases() {
  const key = getPublicKey();
  if (!key) {
    throw new Error(`RevenueCat is not configured. Add ${getMissingKeyVarName()} to .env.local — see docs/REVENUECAT_SETUP.md`);
  }

  if (purchasesRef) return purchasesRef;

  const { data } = await supabase.auth.getUser();
  const appUserId = data?.user?.id;
  if (!appUserId) throw new Error('You must be signed in to do this.');

  if (IS_NATIVE) {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    await Purchases.configure({ apiKey: key, appUserID: appUserId });
    purchasesRef = Purchases;
  } else {
    const { Purchases } = await import('@revenuecat/purchases-js');
    purchasesRef = Purchases.configure(key, appUserId);
  }

  return purchasesRef;
}

function findPackage(offerings, identifier) {
  return (
    offerings.current?.availablePackages.find((p) => p.identifier === identifier)
    ?? offerings.all?.[identifier]?.availablePackages?.[0]
  );
}

async function purchasePackage(purchases, rcPackage) {
  if (IS_NATIVE) {
    await purchases.purchasePackage({ aPackage: rcPackage });
  } else {
    await purchases.purchase({ rcPackage });
  }
}

/** Always return plan cards for the Pricing page (display prices are local).
 *  Checkout still requires a platform RevenueCat public key at purchase time. */
export function getConfiguredPlans() {
  return SUBSCRIPTION_PLANS;
}

export function isBillingConfigured() {
  return Boolean(getPublicKey());
}

export function getPlanById(planId) {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId);
}

export async function purchasePlan(planId) {
  const plan = getPlanById(planId);
  if (!plan) throw new Error(`Unknown plan "${planId}"`);

  const { AnalyticsEvents } = await import('@/lib/analytics');
  AnalyticsEvents.subscriptionCheckout(planId, plan.id);

  const purchases = await getPurchases();
  const offerings = await purchases.getOfferings();
  const rcPackage = findPackage(offerings, planId);

  if (!rcPackage) {
    throw new Error(`RevenueCat package "${planId}" not found. Check your Offering configuration.`);
  }

  await purchasePackage(purchases, rcPackage);
}

export async function getCustomerInfo() {
  const purchases = await getPurchases();
  if (IS_NATIVE) {
    const { customerInfo } = await purchases.getCustomerInfo();
    return customerInfo;
  }
  return purchases.getCustomerInfo();
}

/**
 * Returns the RevenueCat-hosted management URL where the current user can
 * view, change, or cancel their subscription (routes to Stripe's customer
 * portal for Web Billing, or the App Store / Play Store subscription page
 * on native platforms). Returns null if there's nothing to manage.
 */
export async function getManagementUrl() {
  const info = await getCustomerInfo();
  return info?.managementURL || null;
}

export async function openSubscriptionManagement() {
  const url = await getManagementUrl();
  if (!url) {
    throw new Error('No active subscription to manage yet. It may take a minute after purchase to appear — try again shortly.');
  }
  if (IS_NATIVE) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export async function purchaseTip(artistName, amountUsd) {
  const purchases = await getPurchases();
  await purchases.setAttributes({ artistName });

  const offerings = await purchases.getOfferings();
  const tipProductId = `tip_credit_${amountUsd}`;
  const rcPackage = findPackage(offerings, tipProductId);

  if (!rcPackage) {
    throw new Error(`RevenueCat tip product "${tipProductId}" not found. Configure it in RevenueCat (see docs/REVENUECAT_SETUP.md).`);
  }

  await purchasePackage(purchases, rcPackage);
}

/**
 * Purchase a ticket for a paid live event. Creates a `tickets` row after
 * a successful RevenueCat consumable purchase. Product IDs must match
 * TICKET_PRICES (or the nearest SKU for a custom artist price).
 */
export async function purchaseEventTicket(eventId, ticketProductId, amountCents) {
  const tier =
    getTicketPriceById(ticketProductId) ||
    nearestTicketTier(amountCents);
  if (!tier) throw new Error(`Unknown ticket product "${ticketProductId}"`);

  const productId = tier.id;
  const chargedCents = tier.price_cents;

  const { data: authData } = await supabase.auth.getUser();
  const email = authData?.user?.email;
  if (!email) throw new Error('You must be signed in to buy a ticket.');

  const purchases = await getPurchases();
  await purchases.setAttributes({ eventId: String(eventId) });

  const offerings = await purchases.getOfferings();
  const rcPackage = findPackage(offerings, productId);
  if (!rcPackage) {
    throw new Error(
      `RevenueCat ticket product "${productId}" not found. Add matching consumables in RevenueCat — see docs/REVENUECAT_SETUP.md.`
    );
  }

  await purchasePackage(purchases, rcPackage);

  const { data: existing } = await supabase
    .from('tickets')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_email', email)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from('tickets').insert({
      event_id: eventId,
      user_email: email,
      amount_cents: amountCents || chargedCents,
      ticket_product_id: productId,
    });
    if (error && !String(error.message || '').includes('duplicate')) {
      throw error;
    }
  }

  return { eventId, ticketProductId: productId, amount_cents: amountCents || chargedCents };
}

export async function userHasTicket(eventId, userEmail) {
  if (!eventId || !userEmail) return false;
  const { data, error } = await supabase
    .from('tickets')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_email', userEmail)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function startConnectOnboarding(artistName) {
  const { data, error } = await supabase.functions.invoke('createConnectAccount', { body: { artistName } });
  if (error) throw error;
  const url = data?.url;
  if (!url) throw new Error(data?.error || 'Could not start Connect onboarding');

  if (IS_NATIVE) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } else {
    window.location.href = url;
  }
}

export async function getArtistAccount(type = 'status') {
  const { data, error } = await supabase.functions.invoke('getArtistAccount', { body: { type } });
  if (error) throw error;
  return data;
}

export function formatCents(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format((cents || 0) / 100);
}

import { Capacitor } from '@capacitor/core';
import { supabase } from '@/api/supabaseClient';

// Product/package identifiers must match what you configure in RevenueCat
// (Project > Products / Offerings). See docs/REVENUECAT_SETUP.md.
export const SUBSCRIPTION_PLANS = [
  {
    // App Store Product IDs — Apple blocks reuse of deleted IDs, so these
    // match App Store Connect (`*_subscription`) rather than the original short IDs.
    id: 'pro_monthly_subscription',
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
    id: 'premium_monthly_subscription',
    name: 'Premium Monthly',
    price: '69 kr',
    period: '/month',
    tier: 'premium',
    popular: true,
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
    popular: false,
    features: [
      'Everything in Premium + Podcast',
      'Save 169 kr per year',
      'Advanced audience insights',
      'Export capabilities',
    ],
  },
];

/**
 * Fixed ticket price points for Apple IAP / RevenueCat consumables.
 * Add matching consumables in RevenueCat / App Store Connect.
 */
export const TICKET_PRICES = [
  { id: 'event_ticket_49', price_cents: 4900, label: '49 kr' },
  { id: 'event_ticket_99', price_cents: 9900, label: '99 kr' },
  { id: 'event_ticket_149', price_cents: 14900, label: '149 kr' },
  { id: 'event_ticket_199', price_cents: 19900, label: '199 kr' },
  { id: 'event_ticket_299', price_cents: 29900, label: '299 kr' },
];

export function getTicketPriceById(productId) {
  return TICKET_PRICES.find((p) => p.id === productId);
}

export function formatTicketPrice(cents) {
  return `${Math.round((cents || 0) / 100)} kr`;
}

/** Nearest ticket SKU (used if an older custom price_cents is on an event). */
export function nearestTicketTier(priceCents) {
  const cents = Number(priceCents) || 0;
  return TICKET_PRICES.reduce((best, tier) => {
    if (!best) return tier;
    return Math.abs(tier.price_cents - cents) < Math.abs(best.price_cents - cents) ? tier : best;
  }, null);
}

// Native (iOS App Store / Google Play) purchases go through the RevenueCat
// Capacitor plugin so they use StoreKit/Billing, as Apple/Google require.
// In the browser (web app / PWA) we use RevenueCat's Web Billing SDK, which
// processes cards via Stripe under the hood — our code never touches Stripe
// directly. Both expose a near-identical `.getOfferings()`/`.setAttributes()`
// surface, so most of this module doesn't need to branch.
const IS_NATIVE = Capacitor.isNativePlatform();

let purchasesRef = null;
let configuredUserId = null;

// Public Web Billing SDK key — safe in the client. Used as fallback when
// Vercel env is missing/misnamed (dashboard env has failed to inject repeatedly).
const WEB_BILLING_PUBLIC_KEY_FALLBACK = 'rcb_TdRZaSXDttTeYETrokkCKpvLqdYQ';

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function isPurchaseCancelled(err) {
  if (!err) return false;
  const code = err.code ?? err.errorCode ?? err.userInfo?.readableErrorCode;
  const msg = String(err.message || err || '').toLowerCase();
  return (
    code === 1
    || code === '1'
    || code === 'PURCHASE_CANCELLED'
    || err.userCancelled === true
    || msg.includes('cancelled')
    || msg.includes('canceled')
  );
}

function formatPurchaseError(err) {
  if (isPurchaseCancelled(err)) {
    return 'Purchase canceled.';
  }
  const msg = err?.message || String(err || 'Checkout failed');
  if (/web billing api key|invalid api key/i.test(msg)) {
    return 'Wrong RevenueCat API key for this platform. Web needs rcb_…, iOS app needs appl_… — check .env.local and rebuild.';
  }
  if (/timed out|did not appear/i.test(msg)) {
    return msg;
  }
  if (/not available|could not be found|no products|offering/i.test(msg)) {
    return `${msg} Make sure the Paid Apps Agreement is active and the product is Cleared for Sale.`;
  }
  if (/network|offline|internet|connection/i.test(msg)) {
    return `${msg} Check your network connection and try again.`;
  }
  return msg;
}

function normalizeKey(value) {
  return String(value || '').trim();
}

function getPublicKey() {
  if (!IS_NATIVE) {
    // purchases-js ONLY accepts Web Billing keys (rcb_). If someone put appl_/goog_
    // in VITE_REVENUECAT_PUBLIC_KEY, fall back so Safari/web still works.
    const webKey = normalizeKey(import.meta.env.VITE_REVENUECAT_PUBLIC_KEY);
    if (webKey.startsWith('rcb_')) return webKey;
    if (webKey) {
      console.warn(
        '[RevenueCat] VITE_REVENUECAT_PUBLIC_KEY must be rcb_ (Web Billing). '
        + 'appl_ belongs in VITE_REVENUECAT_IOS_PUBLIC_KEY. Using built-in web fallback.'
      );
    }
    return WEB_BILLING_PUBLIC_KEY_FALLBACK;
  }
  // Capacitor shares one native plugin; store keys differ per platform.
  if (Capacitor.getPlatform() === 'android') {
    const androidKey = normalizeKey(import.meta.env.VITE_REVENUECAT_ANDROID_PUBLIC_KEY);
    if (androidKey && !androidKey.startsWith('goog_')) {
      throw new Error(
        'Wrong RevenueCat key for Android. VITE_REVENUECAT_ANDROID_PUBLIC_KEY must start with goog_.'
      );
    }
    return androidKey || null;
  }
  const iosKey = normalizeKey(import.meta.env.VITE_REVENUECAT_IOS_PUBLIC_KEY);
  if (iosKey && !iosKey.startsWith('appl_')) {
    throw new Error(
      'Wrong RevenueCat key for iOS. VITE_REVENUECAT_IOS_PUBLIC_KEY must start with appl_ (App Store). Do not put the Web Billing rcb_ key here — and never put appl_ in VITE_REVENUECAT_PUBLIC_KEY.'
    );
  }
  return iosKey || null;
}

function getMissingKeyVarName() {
  if (!IS_NATIVE) return 'VITE_REVENUECAT_PUBLIC_KEY';
  if (Capacitor.getPlatform() === 'android') return 'VITE_REVENUECAT_ANDROID_PUBLIC_KEY';
  return 'VITE_REVENUECAT_IOS_PUBLIC_KEY';
}

function packageStoreProduct(pkg) {
  return pkg?.product || pkg?.storeProduct || null;
}

async function getPurchases() {
  const key = getPublicKey();
  if (!key) {
    throw new Error(`RevenueCat is not configured. Add ${getMissingKeyVarName()} to .env.local — see docs/REVENUECAT_SETUP.md`);
  }

  const { data } = await withTimeout(
    supabase.auth.getUser(),
    12000,
    'Sign-in check timed out. Close the app, sign in again, then retry purchase.'
  );
  const appUserId = data?.user?.id;
  if (!appUserId) throw new Error('You must be signed in to do this.');

  if (IS_NATIVE) {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    if (!purchasesRef) {
      await withTimeout(
        Purchases.configure({ apiKey: key, appUserID: appUserId }),
        12000,
        'Store setup timed out. Check your network and try again.'
      );
      purchasesRef = Purchases;
      configuredUserId = appUserId;
    } else if (configuredUserId !== appUserId) {
      try {
        await withTimeout(
          Purchases.logIn({ appUserID: appUserId }),
          12000,
          'Store login timed out. Try again.'
        );
        configuredUserId = appUserId;
      } catch {
        // Continue with existing session if logIn is unavailable.
      }
    }
    return purchasesRef;
  }

  if (!purchasesRef || configuredUserId !== appUserId) {
    const { Purchases } = await import('@revenuecat/purchases-js');
    purchasesRef = Purchases.configure(key, appUserId);
    configuredUserId = appUserId;
  }

  return purchasesRef;
}

function packageMatches(pkg, identifier) {
  if (!pkg || !identifier) return false;
  const productId =
    packageStoreProduct(pkg)?.identifier
    || pkg.productIdentifier;
  return pkg.identifier === identifier || productId === identifier;
}

function findPackage(offerings, identifier) {
  if (!offerings || !identifier) return null;

  const fromCurrent = offerings.current?.availablePackages?.find((p) => packageMatches(p, identifier));
  if (fromCurrent) return fromCurrent;

  const named = offerings.all?.[identifier]?.availablePackages?.[0];
  if (named) return named;

  for (const offering of Object.values(offerings.all || {})) {
    const match = offering?.availablePackages?.find((p) => packageMatches(p, identifier));
    if (match) return match;
  }
  return null;
}

async function purchasePackage(purchases, rcPackage) {
  if (IS_NATIVE) {
    await purchases.purchasePackage({ aPackage: rcPackage });
  } else {
    await purchases.purchase({ rcPackage });
  }
}

/** Native fallback when Offering package identifiers don't match App Store product IDs. */
async function purchaseNativeStoreProduct(purchases, productId) {
  const { products } = await withTimeout(
    purchases.getProducts({ productIdentifiers: [productId] }),
    12000,
    `Could not load App Store product "${productId}" (timed out).`
  );
  const product = products?.[0];
  if (!product) {
    throw new Error(
      `App Store product "${productId}" is not available. Confirm it is Cleared for Sale, linked in RevenueCat to the iOS app, and the Paid Apps Agreement is active.`
    );
  }
  await purchases.purchaseStoreProduct({ product });
}

async function purchaseByIdentifier(purchases, productId) {
  const offerings = await withTimeout(
    purchases.getOfferings(),
    12000,
    'Could not load App Store products (timed out). Try again on a good network connection.'
  );
  const rcPackage = findPackage(offerings, productId);
  const storeProduct = packageStoreProduct(rcPackage);

  // Only purchase via package when StoreKit actually attached a real product.
  // Empty/missing product objects are a common misconfig and used to spin forever.
  if (rcPackage && storeProduct?.identifier) {
    await withTimeout(
      purchasePackage(purchases, rcPackage),
      20000,
      'App Store payment sheet did not appear. Account Holder must accept Paid Apps Agreement (Business) and products must be Cleared for Sale.'
    );
    return;
  }

  if (IS_NATIVE) {
    await withTimeout(
      purchaseNativeStoreProduct(purchases, productId),
      20000,
      'App Store payment sheet did not appear. Account Holder must accept Paid Apps Agreement (Business) and products must be Cleared for Sale.'
    );
    return;
  }

  throw new Error(
    `Product "${productId}" is not available from the store. Link it in RevenueCat Offerings and confirm Cleared for Sale.`
  );
}

/** Returns product IDs that are currently purchasable from the store (for UI preflight). */
export async function getAvailableStoreProductIds(productIds) {
  const ids = (productIds || []).filter(Boolean);
  if (!ids.length || !getPublicKey()) return [];

  try {
    const purchases = await getPurchases();
    if (IS_NATIVE) {
      const { products } = await withTimeout(
        purchases.getProducts({ productIdentifiers: ids }),
        12000,
        'Product check timed out'
      );
      return (products || []).map((p) => p.identifier).filter(Boolean);
    }
    const offerings = await withTimeout(purchases.getOfferings(), 12000, 'Product check timed out');
    return ids.filter((id) => {
      const pkg = findPackage(offerings, id);
      return Boolean(packageStoreProduct(pkg)?.identifier || pkg);
    });
  } catch {
    return [];
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

  try {
    const { AnalyticsEvents } = await import('@/lib/analytics');
    AnalyticsEvents.subscriptionCheckout(planId, plan.id);
  } catch {
    // Analytics must never block checkout.
  }

  try {
    const purchases = await getPurchases();
    await purchaseByIdentifier(purchases, planId);
  } catch (err) {
    const wrapped = new Error(formatPurchaseError(err));
    wrapped.cause = err;
    wrapped.userCancelled = isPurchaseCancelled(err);
    throw wrapped;
  }
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

  try {
    const purchases = await getPurchases();
    try {
      await purchases.setAttributes({ eventId: String(eventId) });
    } catch {
      // Attributes are optional — never block StoreKit purchase.
    }

    await purchaseByIdentifier(purchases, productId);
  } catch (err) {
    const wrapped = new Error(formatPurchaseError(err));
    wrapped.cause = err;
    wrapped.userCancelled = isPurchaseCancelled(err);
    throw wrapped;
  }

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

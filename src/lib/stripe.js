import { loadStripe } from '@stripe/stripe-js';
import { base44 } from '@/api/base44Client';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: '99 kr',
    period: '/month',
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
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
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY,
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
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_PODCAST_MONTHLY,
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
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_YEARLY,
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
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_PODCAST_YEARLY,
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

export function getConfiguredPlans() {
  return SUBSCRIPTION_PLANS.filter(p => p.priceId);
}

export function getPlanByPriceId(priceId) {
  return SUBSCRIPTION_PLANS.find(p => p.priceId === priceId);
}

function checkoutErrorMessage(err) {
  const data = err?.data ?? err?.response?.data;
  if (typeof data === 'string' && data) return data;
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;
  const msg = err?.message || 'Checkout failed';
  if (msg.includes('status code 500')) {
    return 'Checkout failed on server. Check Base44 Secrets: STRIPE_API_KEY (sk_test_), STRIPE_ALLOWED_PRICES, and that createCheckoutSession is published.';
  }
  return msg;
}

export async function startSubscriptionCheckout(priceId, { successPath, cancelPath, planId } = {}) {
  if (planId) {
    const { AnalyticsEvents } = await import('@/lib/analytics');
    AnalyticsEvents.subscriptionCheckout(planId, priceId);
  }

  let response;
  try {
    response = await base44.functions.invoke('createCheckoutSession', {
      priceId,
      successPath,
      cancelPath,
    });
  } catch (err) {
    throw new Error(checkoutErrorMessage(err));
  }

  const checkoutUrl = response?.url || response?.data?.url;
  const sessionId = response?.sessionId || response?.data?.sessionId;

  if (checkoutUrl) {
    window.location.assign(checkoutUrl);
    return;
  }

  if (!sessionId) throw new Error(response?.error || 'No checkout session returned');

  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) throw new Error('Stripe publishable key is not configured');

  const stripe = await loadStripe(key);
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw new Error(error.message);
}

export async function startTipCheckout(artistName, amount, { returnUrl } = {}) {
  const response = await base44.functions.invoke('createTipCheckout', {
    artistName,
    amount,
    returnUrl: returnUrl || window.location.pathname,
  });

  const sessionId = response?.sessionId || response?.data?.sessionId;
  if (!sessionId) throw new Error(response?.error || 'Could not start tip checkout');

  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) throw new Error('Stripe publishable key is not configured');

  const stripe = await loadStripe(key);
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw new Error(error.message);
}

export async function startConnectOnboarding(artistName) {
  const response = await base44.functions.invoke('createConnectAccount', { artistName });
  const url = response?.url || response?.data?.url;
  if (!url) throw new Error(response?.error || 'Could not start Connect onboarding');
  window.location.href = url;
}

export async function getArtistAccount(type = 'status') {
  return base44.functions.invoke('getArtistAccount', { type });
}

export function formatCents(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format((cents || 0) / 100);
}

export const TIP_AMOUNTS = [1, 5, 10, 20, 50, 100];

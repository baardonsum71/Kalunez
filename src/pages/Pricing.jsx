import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import {
  getConfiguredPlans,
  getAvailableStoreProductIds,
  isBillingConfigured,
  isPurchaseCancelled,
  purchasePlan,
} from '@/lib/revenuecat';

const UI_PURCHASE_TIMEOUT_MS = 25000;

export default function Pricing() {
  const { user, navigateToLogin } = useAuth();
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [storeReadyIds, setStoreReadyIds] = useState(null);
  const [preflightDone, setPreflightDone] = useState(!Capacitor.isNativePlatform());
  const purchaseWatchdogRef = useRef(null);
  const plans = getConfiguredPlans();
  const billingReady = isBillingConfigured();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    let cancelled = false;

    async function preflight() {
      if (!isNative || !billingReady) {
        setPreflightDone(true);
        return;
      }
      try {
        const ids = await getAvailableStoreProductIds(plans.map((p) => p.id));
        if (!cancelled) {
          setStoreReadyIds(new Set(ids));
          if (!ids.length) {
            setError(
              'App Store products are not available yet. Confirm they are Cleared for Sale, linked in RevenueCat, and the Paid Apps Agreement is active — then retry.'
            );
          }
        }
      } catch {
        if (!cancelled) {
          setStoreReadyIds(new Set());
          setError(
            'Could not reach the App Store to load products. Check your network and try again.'
          );
        }
      } finally {
        if (!cancelled) setPreflightDone(true);
      }
    }

    preflight();
    return () => {
      cancelled = true;
    };
  }, [isNative, billingReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    if (purchaseWatchdogRef.current) clearTimeout(purchaseWatchdogRef.current);
  }, []);

  const handleSubscribe = async (plan) => {
    setError('');
    setSuccess('');
    if (!billingReady) {
      setError('Checkout is not configured yet for this platform. Prices are shown; payments need RevenueCat setup.');
      return;
    }
    if (!user) {
      navigateToLogin();
      return;
    }
    if (isNative && storeReadyIds && !storeReadyIds.has(plan.id)) {
      setError(
        `"${plan.name}" is not available from the App Store right now. Confirm the product is Cleared for Sale and linked in RevenueCat Offerings, then retry.`
      );
      return;
    }

    setLoadingId(plan.id);
    if (purchaseWatchdogRef.current) clearTimeout(purchaseWatchdogRef.current);
    purchaseWatchdogRef.current = setTimeout(() => {
      setLoadingId((current) => {
        if (current === plan.id) {
          setError(
            'App Store payment sheet did not appear in time. Check your network, confirm products are Cleared for Sale, then tap Get Started again.'
          );
          return null;
        }
        return current;
      });
    }, UI_PURCHASE_TIMEOUT_MS);

    try {
      await purchasePlan(plan.id);
      setSuccess(`Subscribed to ${plan.name}.`);
      try {
        if (isNative) {
          const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
          await Haptics.impact({ style: ImpactStyle.Medium });
        }
      } catch {
        // Optional.
      }
    } catch (err) {
      if (isPurchaseCancelled(err) || err?.userCancelled) {
        setError('Purchase canceled.');
      } else {
        setError(err.message || 'Checkout failed. Try again.');
      }
    } finally {
      if (purchaseWatchdogRef.current) {
        clearTimeout(purchaseWatchdogRef.current);
        purchaseWatchdogRef.current = null;
      }
      setLoadingId(null);
    }
  };

  const storeMissing =
    isNative && preflightDone && storeReadyIds !== null && storeReadyIds.size === 0;

  return (
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-3">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">Unlock the full Kalunez experience</p>
          {!billingReady && (
            <p className="text-amber-300/90 text-sm mt-3">
              Prices below are listed. Live checkout needs a RevenueCat key for this platform.
            </p>
          )}
          {isNative && !preflightDone && (
            <p className="text-muted-foreground text-sm mt-3 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking App Store products…
            </p>
          )}
          {storeMissing && (
            <p className="text-amber-300/90 text-sm mt-3">
              Subscription products are not reachable from the App Store. Get Started will show an error instead of spinning forever — fix product linkage, then retry.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <div className="bg-destructive/20 border border-destructive/50 text-destructive rounded-xl p-3 text-center text-sm">
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <div className="bg-green-900/30 border border-green-500/40 text-green-300 rounded-xl p-3 text-center text-sm">
            {success}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const productReady = !isNative || !storeReadyIds || storeReadyIds.has(plan.id);
            const busy = loadingId === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.popular
                    ? 'bg-gradient-to-b from-purple-900/50 to-cyan-900/30 border-2 border-purple-500'
                    : 'bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <h2 className="text-white font-bold text-center text-lg mb-4 mt-2">{plan.name}</h2>

                <div className="text-center mb-6">
                  <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-muted-foreground text-lg ml-1">{plan.period}</span>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-foreground text-sm">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSubscribe(plan)}
                  disabled={busy}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation ${
                    plan.popular ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'gradient-bg'
                  }`}
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {busy
                    ? 'Opening App Store…'
                    : !productReady
                      ? 'Retry Get Started'
                      : 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getConfiguredPlans, startSubscriptionCheckout } from '@/lib/stripe';

export default function Pricing() {
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState('');
  const plans = getConfiguredPlans();

  const handleSubscribe = async (plan) => {
    setError('');
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    if (!plan.priceId) {
      setError(`Plan "${plan.name}" is not configured yet.`);
      return;
    }

    setLoadingId(plan.id);
    try {
      await startSubscriptionCheckout(plan.priceId, {
        successPath: '/subscription?success=true',
        cancelPath: '/pricing?canceled=true',
        planId: plan.id,
      });
    } catch (err) {
      setError(err.message || 'Checkout failed');
      setLoadingId(null);
    }
  };

  if (plans.length === 0) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">Pricing Not Configured</h1>
          <p className="text-muted-foreground text-sm">
            Add Stripe price IDs to <code className="text-purple-400">.env.local</code> — see docs/STRIPE.md
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-3">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">Unlock the full Kalunez experience</p>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <div className="bg-destructive/20 border border-destructive/50 text-destructive rounded-xl p-3 text-center text-sm">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan) => (
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
                disabled={loadingId === plan.id}
                className={`w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 ${
                  plan.popular ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'gradient-bg'
                }`}
              >
                {loadingId === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

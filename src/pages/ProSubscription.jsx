import { useState, useEffect } from 'react';
import { Crown, Music, Download, Zap, CheckCircle2, Loader2, ExternalLink, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getConfiguredPlans, purchasePlan, openSubscriptionManagement } from '@/lib/revenuecat';

const PRO_FEATURES = [
  { icon: Music, label: 'High-Quality Audio', description: '320kbps lossless streaming' },
  { icon: Download, label: 'Offline Playback', description: 'Download tracks for offline listening' },
  { icon: Crown, label: 'Profile Badge', description: 'Exclusive Pro member badge' },
  { icon: Zap, label: 'Ad-Free', description: 'Enjoy uninterrupted listening' },
];

export default function ProSubscription() {
  const { user, navigateToLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState('');

  const proPlan = getConfiguredPlans().find(p => p.id === 'pro_monthly');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) setSuccess(true);
    if (params.get('canceled')) setError('Checkout was canceled.');
  }, []);

  const handleCheckout = async (planId) => {
    if (!user) {
      navigateToLogin();
      return;
    }
    if (!planId) {
      setError('Subscription plan is not configured. Add VITE_REVENUECAT_PUBLIC_KEY to .env.local');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await purchasePlan(planId);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setManageError('');
    setManageLoading(true);
    try {
      await openSubscriptionManagement();
    } catch (err) {
      setManageError(err.message || 'Could not open subscription management');
    } finally {
      setManageLoading(false);
    }
  };

  const isPro = user?.subscription_tier && user.subscription_tier !== 'free';

  return (
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-yellow-900/30 to-transparent px-4 pt-10 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Upgrade to Pro</h1>
          </div>
          <p className="text-muted-foreground text-lg">Unlock premium features and elevate your listening experience</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20">
        {success && (
          <div className="bg-green-900/30 border border-green-500/50 text-green-300 rounded-xl p-4 mb-8 text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Welcome! Your subscription is now active.
          </div>
        )}

        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-destructive rounded-xl p-4 mb-8 text-center">
            {error}
          </div>
        )}

        {isPro ? (
          <div className="bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 rounded-2xl p-8 text-center mb-12">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">You're a {user.subscription_tier} Member!</h2>
            <p className="text-muted-foreground mb-6">Enjoy all premium features and exclusive benefits.</p>

            {manageError && (
              <p className="text-destructive text-sm mb-4">{manageError}</p>
            )}

            <button
              type="button"
              onClick={handleManageSubscription}
              disabled={manageLoading}
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-2.5 rounded-xl font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {manageLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Settings2 className="w-4 h-4" />
              )}
              Manage / Cancel Subscription
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </button>
            <p className="text-muted-foreground text-xs mt-3">
              Opens your billing portal — you can change plans, update payment method, or cancel anytime.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12 my-16">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">What's Included</h2>
              {PRO_FEATURES.map(({ icon: Icon, label, description }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{label}</h3>
                    <p className="text-muted-foreground text-sm">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center">
              <div className="w-full bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 rounded-2xl p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">{proPlan?.price || '$9.99'}</div>
                <p className="text-muted-foreground mb-6">per month</p>
                <button
                  type="button"
                  onClick={() => handleCheckout(proPlan?.id)}
                  disabled={loading || !proPlan?.id}
                  className="w-full gradient-bg text-white py-3 rounded-xl font-bold mb-4 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Processing...' : 'Subscribe Now'}
                </button>
                <p className="text-muted-foreground text-xs mb-4">Cancel anytime. Secure payment via RevenueCat.</p>
                <Link to="/pricing" className="text-purple-400 text-sm hover:underline">
                  View all plans →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

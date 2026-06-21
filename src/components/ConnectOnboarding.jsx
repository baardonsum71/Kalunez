import { useState, useEffect } from 'react';
import { Wallet, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { startConnectOnboarding, getArtistAccount } from '@/lib/stripe';
import { toast } from '@/components/ui/use-toast';

export default function ConnectOnboarding({ user, onUpdate }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [artistName, setArtistName] = useState(user?.artist_name || user?.full_name || '');

  useEffect(() => {
    loadAccount();
    const params = new URLSearchParams(window.location.search);
    if (params.get('connect') === 'success') {
      toast({ title: 'Stripe connected!', description: 'Your payout account is being verified.' });
      window.history.replaceState({}, '', '/artist-dashboard');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAccount = async () => {
    setLoading(true);
    try {
      const result = await getArtistAccount();
      const data = result?.account ?? result?.data?.account;
      setAccount(data);
      onUpdate?.(data);
    } catch {
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!artistName.trim()) {
      toast({ title: 'Artist name required', description: 'Enter your public artist name.', variant: 'destructive' });
      return;
    }
    setConnecting(true);
    try {
      await startConnectOnboarding(artistName.trim());
    } catch (err) {
      toast({ title: 'Connect failed', description: err.message, variant: 'destructive' });
      setConnecting(false);
    }
  };

  const openDashboard = async () => {
    try {
      const result = await getArtistAccount('dashboard');
      const url = result?.url || result?.data?.url;
      if (url) window.open(url, '_blank');
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-secondary rounded w-1/3 mb-4" />
        <div className="h-10 bg-secondary rounded" />
      </div>
    );
  }

  const isReady = account?.charges_enabled && account?.payouts_enabled;

  return (
    <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/10 border border-yellow-500/20 rounded-2xl p-6 mb-10">
      <div className="flex items-start gap-3 mb-4">
        <Wallet className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-white font-bold text-lg">Receive Tips & Payouts</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Connect Stripe to receive tips from fans. Kalunez takes a 10% platform fee; the rest goes directly to you.
          </p>
        </div>
      </div>

      {isReady ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Stripe Connect active — you can receive tips as <span className="font-semibold text-white">{account.artist_name}</span>
          </div>
          <button
            type="button"
            onClick={openDashboard}
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Open Stripe Express Dashboard
          </button>
        </div>
      ) : account?.stripe_connect_account_id ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            Onboarding incomplete — finish setting up your payout account
          </div>
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="gradient-bg text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {connecting && <Loader2 className="w-4 h-4 animate-spin" />}
            Continue Setup
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            value={artistName}
            onChange={e => setArtistName(e.target.value)}
            placeholder="Your public artist name"
            className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-yellow-500"
          />
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {connecting && <Loader2 className="w-4 h-4 animate-spin" />}
            Connect Stripe Account
          </button>
        </div>
      )}
    </div>
  );
}

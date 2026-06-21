import { useState } from 'react';
import { DollarSign, X, Heart, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { startTipCheckout, TIP_AMOUNTS } from '@/lib/stripe';
import { toast } from '@/components/ui/use-toast';
import { AnalyticsEvents } from '@/lib/analytics';

export default function TipButton({ artistName }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendTip = async () => {
    setLoading(true);
    setError('');
    try {
      const me = await base44.auth.me().catch(() => null);
      if (!me) {
        base44.auth.redirectToLogin();
        return;
      }
      AnalyticsEvents.tipInitiated(artistName, selected);
      await startTipCheckout(artistName, selected, {
        returnUrl: window.location.pathname,
      });
    } catch (err) {
      const msg = err.message || 'Could not process tip';
      setError(msg);
      toast({ title: 'Tip failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
      >
        <DollarSign className="w-4 h-4" /> Tip Artist
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-0">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 relative">
            <button
              type="button"
              onClick={() => { setOpen(false); setError(''); }}
              aria-label="Close"
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-white font-bold text-lg mb-1">Send a Tip</h3>
            <p className="text-muted-foreground text-sm mb-5">
              Support <span className="text-purple-400">{artistName}</span> — paid via Stripe, 90% goes to the artist
            </p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {TIP_AMOUNTS.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setSelected(amount)}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition-all ${
                    selected === amount
                      ? 'bg-yellow-500 border-yellow-400 text-black'
                      : 'bg-secondary border-border text-foreground hover:border-yellow-500/50'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-destructive text-xs mb-3">{error}</p>
            )}

            <button
              type="button"
              onClick={sendTip}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className="w-4 h-4" />
              )}
              {loading ? 'Redirecting to Stripe...' : `Send $${selected} Tip`}
            </button>

            <p className="text-muted-foreground text-xs text-center mt-3">
              Secure payment powered by Stripe Connect
            </p>
          </div>
        </div>
      )}
    </>
  );
}

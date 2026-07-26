import { useState } from 'react';
import { DollarSign, X, Heart, Radio } from 'lucide-react';
import { TIP_AMOUNTS } from '@/lib/revenuecat';

/**
 * Public page for App Store / listing screenshots of the tip purchase UI.
 * Open /tip-demo — modal is always visible. Not linked in main nav.
 */
export default function TipDemo() {
  const [selected, setSelected] = useState(5);
  const artistName = 'Nova Pulse';

  return (
    <div className="min-h-[70vh] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#0d0d12] to-[#1a0520]" />
      <div className="absolute inset-0 opacity-40" style={{
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(200,245,66,0.15), transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(255,45,149,0.2), transparent 45%)',
      }} />

      <div className="relative max-w-lg mx-auto px-4 pt-10 pb-24">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex flex-col items-center justify-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE
          </div>
          <Radio className="w-10 h-10 text-white/40" />
          <p className="text-white font-semibold text-lg">{artistName}</p>
          <p className="text-white/50 text-sm">Late Night Set — Live on Kalunez</p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 bg-yellow-500 text-black font-bold px-4 py-2.5 rounded-xl text-sm"
        >
          <DollarSign className="w-4 h-4" /> Tip Artist
        </button>
      </div>

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-8 sm:pb-0">
        <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
          <button type="button" aria-label="Close" className="absolute top-4 right-4 text-muted-foreground">
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-white font-bold text-lg mb-1">Send a Tip</h3>
          <p className="text-muted-foreground text-sm mb-5">
            Support <span className="text-[var(--lime)]">{artistName}</span> — 90% goes to the artist
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {TIP_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setSelected(amount)}
                className={`py-2.5 rounded-xl font-bold text-sm border transition-all ${
                  selected === amount
                    ? 'bg-yellow-500 border-yellow-400 text-black'
                    : 'bg-secondary border-border text-foreground'
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Send ${selected} Tip
          </button>

          <p className="text-muted-foreground text-xs text-center mt-3">
            Secure payment powered by RevenueCat
          </p>
        </div>
      </div>
    </div>
  );
}

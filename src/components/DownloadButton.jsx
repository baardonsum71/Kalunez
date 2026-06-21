import { useState, useEffect } from 'react';
import { Download, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DownloadButton({ trackTitle, audioUrl, trackId }) {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      if (u) {
        const subscriptions = await base44.entities.Subscription.filter({ user_email: u.email, tier: 'pro' }, '', 1);
        setIsPro(subscriptions.length > 0);
      }
    }).catch(() => {});
  }, []);

  const handleDownload = () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${trackTitle}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button
        onClick={handleDownload}
        className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
          isPro
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        {isPro ? (
          <>
            <Download className="w-3.5 h-3.5" /> Download
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5" /> Pro Only
          </>
        )}
      </button>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 safe-top safe-bottom safe-left safe-right">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm text-center safe-area-padding">
            <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Download Available for Pro Members</h3>
            <p className="text-muted-foreground text-sm mb-6">Upgrade to Pro to download tracks for offline listening.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors text-sm font-semibold"
              >
                Cancel
              </button>
              <a
                href="/subscription"
                className="flex-1 gradient-bg text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold inline-flex items-center justify-center"
              >
                Upgrade
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { Capacitor } from '@capacitor/core';

export default function ShareButton({ title, url, text }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: text || `Check out "${title}" on Kalunez!`,
      url: url || window.location.href,
    };

    if (Capacitor.isNativePlatform()) {
      try {
        const { Share } = await import('@capacitor/share');
        await Share.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
          dialogTitle: 'Share on Kalunez',
        });
        try {
          const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch {
          // Optional.
        }
        return;
      } catch (err) {
        if (err?.message?.includes('cancel') || err?.message?.includes('Share canceled')) return;
        // Fall through to web share / clipboard.
      }
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        alert('Failed to copy link');
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-white/5 transition-colors text-muted-foreground hover:text-white text-sm font-medium"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  );
}

import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton({ title, url, text }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: text || `Check out "${title}" on Kalunez!`,
      url: url || window.location.href,
    };

    // Use native share on mobile
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy link to clipboard
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
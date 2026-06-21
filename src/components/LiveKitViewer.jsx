import { useRef } from 'react';
import { useLiveKitViewer } from '@/hooks/useLiveKit';
import { Radio } from 'lucide-react';

export default function LiveKitViewer({ roomName, streamId, isLive, onViewerCount }) {
  const containerRef = useRef(null);

  const { connected, error } = useLiveKitViewer({
    roomName,
    streamId,
    videoContainerRef: containerRef,
    enabled: isLive && !!roomName,
    onViewerCount,
  });

  if (!isLive || !roomName) return null;

  return (
    <div className="aspect-video bg-black relative">
      <div ref={containerRef} className="w-full h-full" />

      {!connected && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <div className="w-8 h-8 border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin mb-3" />
          <p className="text-muted-foreground text-sm">Connecting to stream...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-4 text-center">
          <Radio className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
          <p className="text-white text-sm font-medium mb-1">Stream unavailable</p>
          <p className="text-muted-foreground text-xs">{error}</p>
        </div>
      )}

      {connected && (
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
          <Radio className="w-3 h-3" /> LIVE
        </div>
      )}
    </div>
  );
}

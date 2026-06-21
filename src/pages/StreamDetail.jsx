import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Radio, Users, ChevronLeft } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FollowButton from '@/components/FollowButton';
import LiveListeningRoom from '@/components/LiveListeningRoom';
import LiveKitViewer from '@/components/LiveKitViewer';
import MuxStreamPlayer from '@/components/MuxStreamPlayer';
import ShareButton from '@/components/ShareButton';
import TipButton from '@/components/TipButton';
import { getLiveKitRoomInfo } from '@/lib/streaming';
import { AnalyticsEvents } from '@/lib/analytics';

export default function StreamDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [liveViewers, setLiveViewers] = useState(null);

  const { data: stream, isLoading } = useQuery({
    queryKey: ['stream', id],
    queryFn: () => base44.entities.LiveStream.filter({ id }, '-created_date', 1).then(r => r[0]),
    enabled: !!id,
    refetchInterval: (query) => query.state.data?.is_live ? 15000 : false,
  });

  const handleViewerCount = useCallback(async (count) => {
    setLiveViewers(count);
    if (stream?.id && count !== stream.viewer_count) {
      await base44.entities.LiveStream.update(stream.id, { viewer_count: count }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['stream', id] });
    }
  }, [stream?.id, stream?.viewer_count, id, queryClient]);

  useQuery({
    queryKey: ['livekit-room', stream?.room_name],
    queryFn: async () => {
      const info = await getLiveKitRoomInfo(stream.room_name);
      if (info.viewerCount !== stream.viewer_count) {
        await base44.entities.LiveStream.update(stream.id, { viewer_count: info.viewerCount }).catch(() => {});
      }
      return info;
    },
    enabled: !!stream?.is_live && stream?.provider === 'livekit' && !!stream?.room_name,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (stream) AnalyticsEvents.streamViewed(stream);
  }, [stream?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="hero-gradient min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-white text-xl">Stream not found.</p>
        <Link to="/live" className="text-purple-400 hover:underline">Back to Live</Link>
      </div>
    );
  }

  const isLive = stream.is_live;
  const viewerCount = liveViewers ?? stream.viewer_count ?? 0;
  const isLiveKit = stream.provider === 'livekit' || !!stream.room_name;
  const isMux = stream.provider === 'mux' || !!stream.mux_playback_id;

  const renderPlayer = () => {
    if (isLive && isLiveKit && stream.room_name) {
      return (
        <LiveKitViewer
          roomName={stream.room_name}
          streamId={stream.id}
          isLive={isLive}
          onViewerCount={handleViewerCount}
        />
      );
    }

    if ((isLive || !isLive) && isMux && stream.mux_playback_id) {
      return (
        <MuxStreamPlayer
          playbackId={stream.mux_playback_id}
          isLive={isLive}
          title={stream.title}
        />
      );
    }

    if (stream.stream_url) {
      return (
        <video
          src={stream.stream_url}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-black"
          poster={stream.thumbnail_url}
        />
      );
    }

    return (
      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/30">
        {isLive ? (
          <div className="text-center px-4">
            <Radio className="w-12 h-12 text-purple-400/50 mx-auto mb-3 animate-pulse" />
            <p className="text-white text-sm">Waiting for broadcaster...</p>
          </div>
        ) : (
          <>
            {stream.thumbnail_url ? (
              <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-full object-cover" />
            ) : (
              <Radio className="w-16 h-16 text-purple-400/50" />
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="hero-gradient min-h-screen px-4 pt-[calc(1.5rem+var(--safe-top))] pb-[calc(6rem+var(--safe-bottom))]">
      <div className="max-w-4xl mx-auto">
        <Link to="/live" className="flex items-center gap-1 text-muted-foreground hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Live
        </Link>

        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <div className="bg-secondary relative">
            {renderPlayer()}
            {isLive && !isLiveKit && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                <Radio className="w-3 h-3" /> LIVE
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-white font-bold text-2xl">{stream.title}</h1>
                <p className="text-muted-foreground">{stream.artist}</p>
              </div>
              <FollowButton artistName={stream.artist} />
            </div>

            <div className="flex items-center gap-4 text-muted-foreground text-sm flex-wrap">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {viewerCount} viewers
              </span>
              {stream.category && (
                <span className="bg-secondary px-3 py-1 rounded-full text-xs">{stream.category}</span>
              )}
              {stream.provider && (
                <span className="bg-secondary px-3 py-1 rounded-full text-xs capitalize">{stream.provider}</span>
              )}
            </div>

            {stream.description && (
              <p className="text-muted-foreground text-sm mt-4">{stream.description}</p>
            )}

            <div className="flex gap-2 mt-4">
              <ShareButton title={stream.title} url={`${window.location.origin}/stream/${stream.id}`} />
              <TipButton artistName={stream.artist} />
            </div>
          </div>
        </div>

        {isLive && <LiveListeningRoom streamId={id} />}
      </div>
    </div>
  );
}

import MuxPlayer from '@mux/mux-player-react';

export default function MuxStreamPlayer({ playbackId, isLive, title }) {
  if (!playbackId) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Waiting for broadcast...</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black">
      <MuxPlayer
        playbackId={playbackId}
        streamType={isLive ? 'live' : 'on-demand'}
        metadata={{ video_title: title }}
        autoPlay
        muted={false}
        style={{ width: '100%', height: '100%', aspectRatio: '16/9' }}
        primaryColor="#a855f7"
        secondaryColor="#06b6d4"
      />
    </div>
  );
}

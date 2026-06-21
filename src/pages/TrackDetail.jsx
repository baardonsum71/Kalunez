import { useParams, Link } from 'react-router-dom';
import { Music, Heart, Play, ChevronLeft, Flag } from 'lucide-react';
import { playTrack } from '@/lib/playerStore';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommentSection from '@/components/CommentSection';
import FollowButton from '@/components/FollowButton';
import AudioWaveform from '@/components/AudioWaveform';
import DownloadButton from '@/components/DownloadButton';
import ShareButton from '@/components/ShareButton';
import AddToPlaylistButton from '@/components/AddToPlaylistButton';

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrackDetail() {
  const { id } = useParams();

  const { data: track, isLoading } = useQuery({
    queryKey: ['track', id],
    queryFn: () => base44.entities.Track.filter({ id }, '-created_date', 1).then(r => r[0]),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!track) return (
    <div className="hero-gradient min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-white text-xl">Track not found.</p>
      <Link to="/discover" className="text-purple-400 hover:underline">Back to Discover</Link>
    </div>
  );

  const copyrightReportUrl = `mailto:support@kalunez.com?subject=${encodeURIComponent('Copyright report — Kalunez')}&body=${encodeURIComponent(
    `I believe the following track infringes my copyright:\n\nTrack: ${track.title}\nArtist: ${track.artist}\nURL: ${window.location.href}\nTrack ID: ${track.id}\n\nDescribe your claim:\n`,
  )}`;

  return (
    <div className="hero-gradient min-h-screen px-4 pt-[calc(1.5rem+var(--safe-top))] pb-[calc(6rem+var(--safe-bottom))]">
      <div className="max-w-2xl mx-auto">
        <Link to="/discover" className="flex items-center gap-1 text-muted-foreground hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl overflow-hidden mb-6">
          <div className="aspect-square bg-secondary relative flex items-center justify-center max-h-72">
            {track.cover_url ? (
              <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-pink-900/30">
                <Music className="w-20 h-20 text-purple-400/50" />
              </div>
            )}
            <button
              onClick={() => playTrack(track)}
              className="absolute bottom-4 right-4 w-14 h-14 gradient-bg rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            >
              <Play className="w-6 h-6 text-white ml-0.5" />
            </button>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 className="text-white font-bold text-2xl">{track.title}</h1>
                <p className="text-muted-foreground">{track.artist}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {track.audio_url && <DownloadButton trackTitle={track.title} audioUrl={track.audio_url} trackId={track.id} />}
                <AddToPlaylistButton trackId={track.id} />
                <FollowButton artistName={track.artist} />
                <ShareButton title={track.title} url={`${window.location.origin}/track/${id}`} text={`Check out "${track.title}" by ${track.artist} on Kalunez!`} />
              </div>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground text-sm mt-3 flex-wrap">
              {track.genre && <span className="bg-secondary px-3 py-1 rounded-full">{track.genre}</span>}
              <span>{formatDuration(track.duration)}</span>
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {track.likes || 0}</span>
            </div>
            {track.description && <p className="text-muted-foreground text-sm mt-4">{track.description}</p>}
            <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center gap-3 text-xs">
              <a
                href={copyrightReportUrl}
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-red-400 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" /> Report copyright concern
              </a>
              <Link to="/dmca" className="text-purple-400 hover:underline">DMCA policy</Link>
            </div>
          </div>
        </div>

        {track.audio_url && (
          <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6 mb-6">
            <h2 className="text-white font-bold text-lg mb-4">Waveform</h2>
            <AudioWaveform audioUrl={track.audio_url} height={120} />
          </div>
        )}

        <CommentSection contentId={id} contentType="track" />
      </div>
    </div>
  );
}
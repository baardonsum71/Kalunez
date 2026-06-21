import { memo, useState } from 'react';
import { Play, Heart, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import FollowButton from '@/components/FollowButton';
import { playTrack } from '@/lib/playerStore';
import AddToPlaylistButton from '@/components/AddToPlaylistButton';
import DownloadButton from '@/components/DownloadButton';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';

function TrackCard({ track }) {
  const [likes, setLikes] = useState(track.likes || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newLikes = liked ? likes - 1 : likes + 1;
    const wasLiked = liked;
    setLiked(!liked);
    setLikes(newLikes);
    try {
      await base44.entities.Track.update(track.id, { likes: newLikes });
    } catch {
      setLiked(wasLiked);
      setLikes(likes);
      toast({ title: 'Error', description: 'Could not update like.', variant: 'destructive' });
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group">
      <Link to={`/track/${track.id}`}>
        <div className="relative aspect-square bg-secondary">
          {track.cover_url ? (
            <img
              src={track.cover_url}
              alt={track.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-pink-900/30">
              <Music className="w-12 h-12 text-purple-400/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); playTrack(track); }}
              aria-label={`Play ${track.title}`}
              className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center shadow-lg"
            >
              <Play className="w-5 h-5 text-white ml-0.5" />
            </button>
          </div>
          {track.genre && (
            <span className="absolute top-2 left-2 bg-black/60 text-purple-300 text-xs px-2 py-0.5 rounded-full">
              {track.genre}
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate">{track.title}</h3>
        <div className="flex items-center justify-between mt-0.5">
          <Link to={`/artist/${encodeURIComponent(track.artist)}`} className="text-muted-foreground text-xs truncate hover:text-purple-400 transition-colors">{track.artist}</Link>
          <FollowButton artistName={track.artist} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-muted-foreground text-xs">{formatDuration(track.duration)}</span>
          <div className="flex items-center gap-1">
            {track.audio_url && <DownloadButton trackTitle={track.title} audioUrl={track.audio_url} trackId={track.id} />}
            <AddToPlaylistButton trackId={track.id} />
            <button
              type="button"
              onClick={handleLike}
              aria-label={liked ? 'Unlike track' : 'Like track'}
              className={`flex items-center gap-1 text-xs ${liked ? 'text-pink-400' : 'text-muted-foreground hover:text-pink-400'} transition-colors`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
              {likes}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TrackCard);

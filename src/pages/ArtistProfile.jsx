import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Music, Radio, Heart, ChevronLeft, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TrackCard from '@/components/TrackCard';
import StreamCard from '@/components/StreamCard';
import FollowButton from '@/components/FollowButton';
import { AnalyticsEvents } from '@/lib/analytics';

export default function ArtistProfile() {
  const { name } = useParams();

  useEffect(() => {
    if (name) AnalyticsEvents.artistProfileViewed(decodeURIComponent(name));
  }, [name]);

  const { data: artistUser = null } = useQuery({
    queryKey: ['artist-user', name],
    queryFn: () => base44.entities.User.filter({ full_name: name }, 'created_date', 1).then(r => r[0]),
    enabled: !!name,
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['artist-tracks', name],
    queryFn: () => base44.entities.Track.filter({ artist: name }, '-created_date', 50),
    enabled: !!name,
  });

  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['artist-streams', name],
    queryFn: () => base44.entities.LiveStream.filter({ artist: name, is_live: true }, '-created_date', 10),
    enabled: !!name,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['artist-followers', name],
    queryFn: () => base44.entities.Follow.filter({ artist_name: name }, 'created_date', 1000),
    enabled: !!name,
  });

  const isLoading = tracksLoading || streamsLoading;
  const totalPlays = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);
  const totalLikes = tracks.reduce((sum, t) => sum + (t.likes || 0), 0);

  return (
    <div className="hero-gradient min-h-screen px-4 pt-[calc(1.5rem+var(--safe-top))] pb-[calc(6rem+var(--safe-bottom))]">
      <div className="max-w-4xl mx-auto">
        <Link to="/discover" className="flex items-center gap-1 text-muted-foreground hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        {/* Artist Header */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 overflow-hidden">
              {artistUser?.profile_picture_url ? (
                <img src={artistUser.profile_picture_url} alt={name} className="w-full h-full object-cover" />
              ) : (
                <Music className="w-12 h-12 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{name}</h1>
              {artistUser?.bio && (
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{artistUser.bio}</p>
              )}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-2xl font-bold text-purple-400">{tracks.length}</p>
                  <p className="text-muted-foreground text-sm">Tracks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-pink-400">{totalPlays.toLocaleString()}</p>
                  <p className="text-muted-foreground text-sm">Total Plays</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400">{totalLikes.toLocaleString()}</p>
                  <p className="text-muted-foreground text-sm">Likes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{followers.length.toLocaleString()}</p>
                  <p className="text-muted-foreground text-sm">Followers</p>
                </div>
              </div>
              <FollowButton artistName={name} />
            </div>
          </div>
        </div>

        {/* Live Streams */}
        {streams.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <Radio className="w-6 h-6 text-red-400 animate-pulse" /> Live Now
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {streams.map(stream => <StreamCard key={stream.id} stream={stream} />)}
            </div>
          </div>
        )}

        {/* Tracks */}
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            <Music className="w-6 h-6 text-purple-400" /> Discography
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-secondary" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-secondary rounded" />
                    <div className="h-2 bg-secondary rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-16">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No tracks available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {tracks.map(track => <TrackCard key={track.id} track={track} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
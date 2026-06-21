import { Link } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Play, Upload, Radio, Music, Users, UserPlus, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import TrackCard from '@/components/TrackCard';
import StreamCard from '@/components/StreamCard';
import PullToRefresh from '@/components/PullToRefresh';

function TrackSkeletonGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-square bg-secondary" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-secondary rounded" />
            <div className="h-2 bg-secondary rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatStat(n, cap = 500) {
  if (n >= cap) return `${cap}+`;
  return n.toLocaleString();
}

export default function Home() {
  const { navigateToLogin } = useAuth();
  const queryClient = useQueryClient();

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['featured-tracks'],
    queryFn: () => base44.entities.Track.filter({ is_featured: true }, '-created_date', 6),
    staleTime: 60000,
  });

  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['live-streams-home'],
    queryFn: () => base44.entities.LiveStream.filter({ is_live: true }, '-viewer_count', 4),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const { data: followingTracks = [], isLoading: followingLoading } = useQuery({
    queryKey: ['following-feed'],
    queryFn: async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!me) return [];
      const follows = await base44.entities.Follow.filter({ follower_email: me.email });
      if (!follows.length) return [];
      const artistNames = new Set(follows.map(f => f.artist_name));
      const recentTracks = await base44.entities.Track.list('-created_date', 50);
      return recentTracks.filter(t => artistNames.has(t.artist)).slice(0, 6);
    },
    staleTime: 60000,
  });

  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const [allTracks, allStreams] = await Promise.all([
        base44.entities.Track.list('-created_date', 500),
        base44.entities.LiveStream.list('-created_date', 500),
      ]);
      const artists = new Set(allTracks.map(t => t.artist).filter(Boolean)).size;
      return {
        tracks: allTracks.length,
        streams: allStreams.length,
        artists,
      };
    },
    staleTime: 300000,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="hero-gradient min-h-screen">
        <section className="relative pt-20 pb-32 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-700/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-4">
              Stream. Create.<br />
              <span className="gradient-text">Connect.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
              Join the music revolution with unlimited streaming, live broadcasting, and social features.
              Upload your tracks, connect with fans, and discover new music.
            </p>
            <p className="text-sm text-muted-foreground mb-10">Available worldwide excluding certain restricted regions</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/discover" className="gradient-bg text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 justify-center hover:opacity-90 transition-opacity">
                <Play className="w-5 h-5" /> Start Streaming
              </Link>
              <Link to="/upload" className="border border-white/30 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 justify-center hover:bg-white/10 transition-colors">
                <Upload className="w-5 h-5" /> Upload Music
              </Link>
              <button
                type="button"
                onClick={() => navigateToLogin()}
                className="border border-cyan-400/50 text-cyan-300 px-8 py-3 rounded-full font-semibold flex items-center gap-2 justify-center hover:bg-cyan-400/10 transition-colors"
              >
                <UserPlus className="w-5 h-5" /> Create Account
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 rounded-2xl overflow-hidden grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">For Artists</span>
              <h2 className="text-3xl font-bold text-white mb-4">Stream From Anywhere</h2>
              <p className="text-muted-foreground mb-6">
                Turn your living room into a global concert hall. Go live, upload tracks,
                and connect with fans worldwide — all from one platform.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/for-artists" className="gradient-bg text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <Play className="w-4 h-4" /> Learn More
                </Link>
                <Link to="/go-live" className="border border-purple-500/50 text-purple-300 px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-purple-500/10 transition-colors">
                  <Radio className="w-4 h-4" /> Go Live
                </Link>
              </div>
            </div>
            <div className="relative min-h-56">
              <img
                src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop"
                alt="Artist streaming from home"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-card/60 to-transparent md:from-transparent" />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white text-sm font-semibold">Your Living Room</p>
                <p className="text-purple-300 text-xs">Your Global Stage</p>
              </div>
            </div>
          </div>
        </section>

        {(followingLoading || followingTracks.length > 0) && (
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-400" /> Following
              </h2>
              <Link to="/discover" className="text-purple-400 hover:text-purple-300 text-sm font-medium">Discover More →</Link>
            </div>
            {followingLoading ? (
              <TrackSkeletonGrid count={3} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {followingTracks.map(track => <TrackCard key={track.id} track={track} />)}
              </div>
            )}
          </section>
        )}

        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Music className="w-6 h-6 text-purple-400" /> Featured Tracks
            </h2>
            <Link to="/discover" className="text-purple-400 hover:text-purple-300 text-sm font-medium">View All →</Link>
          </div>
          {tracksLoading ? (
            <TrackSkeletonGrid count={3} />
          ) : tracks.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No featured tracks yet. Be the first to upload!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.map(track => <TrackCard key={track.id} track={track} />)}
            </div>
          )}
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Radio className="w-6 h-6 text-pink-400" /> Live Now
            </h2>
            <Link to="/live" className="text-purple-400 hover:text-purple-300 text-sm font-medium">View All →</Link>
          </div>
          {streamsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-secondary" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-secondary rounded" />
                    <div className="h-2 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : streams.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No live streams at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {streams.map(stream => <StreamCard key={stream.id} stream={stream} />)}
            </div>
          )}
        </section>

        {stats && (
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Music, label: 'Tracks Available', value: formatStat(stats.tracks), color: 'text-purple-400' },
                { icon: Users, label: 'Active Artists', value: formatStat(stats.artists), color: 'text-pink-400' },
                { icon: Radio, label: 'Total Streams', value: formatStat(stats.streams), color: 'text-blue-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 rounded-xl p-6 text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
                  <p className="text-3xl font-bold text-white mb-1">{value}</p>
                  <p className="text-muted-foreground text-sm">{label}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PullToRefresh>
  );
}

import { Link } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Play, Radio, Music, Users, Heart, Tv2 } from 'lucide-react';
import { listRows, filterRows } from '@/lib/db';
import { useAuth } from '@/lib/AuthContext';
import TrackCard from '@/components/TrackCard';
import StreamCard from '@/components/StreamCard';
import PullToRefresh from '@/components/PullToRefresh';

function TrackSkeletonGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse border border-border">
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['featured-tracks'],
    queryFn: () => filterRows('tracks', { is_featured: true }, '-created_date', 6),
    staleTime: 60000,
  });

  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['live-streams-home'],
    queryFn: () => filterRows('live_streams', { is_live: true }, '-viewer_count', 4),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const { data: followingTracks = [], isLoading: followingLoading } = useQuery({
    queryKey: ['following-feed', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const follows = await filterRows('follows', { follower_email: user.email });
      if (!follows.length) return [];
      const artistNames = new Set(follows.map(f => f.artist_name));
      const recentTracks = await listRows('tracks', '-created_date', 50);
      return recentTracks.filter(t => artistNames.has(t.artist)).slice(0, 6);
    },
    staleTime: 60000,
  });

  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const [allTracks, allStreams] = await Promise.all([
        listRows('tracks', '-created_date', 500),
        listRows('live_streams', '-created_date', 500),
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
        {/* Hero — one composition: brand, headline, line, CTA, full-bleed visual */}
        <section className="relative min-h-[100svh] flex items-end md:items-center overflow-hidden club-grain">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1571266028243-d220c6a0b4c4?w=1600&h=1200&fit=crop&q=80"
              alt=""
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/75 to-[#050507]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/90 via-[#050507]/35 to-transparent" />
          </div>
          <div className="hero-sweep" aria-hidden />

          <div className="relative z-[2] w-full max-w-6xl mx-auto px-4 pt-[calc(6rem+var(--safe-top))] pb-16 md:pb-24">
            <p className="font-display text-5xl sm:text-6xl md:text-8xl tracking-wide logo-gradient-text mb-4 md:mb-6">
              KALUNEZ
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-white leading-[0.95] mb-4 max-w-3xl">
              THE ROOM<br />
              <span className="gradient-text">NEVER CLOSES</span>
            </h1>
            <p className="text-base md:text-lg text-white/75 max-w-md mb-8 font-medium">
              Stream sets, tip the booth, go live — built for nights that refuse to end.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/discover"
                className="gradient-bg px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 justify-center hover:opacity-90 transition-opacity text-sm tracking-wide uppercase"
              >
                <Play className="w-5 h-5" /> Enter the stream
              </Link>
              <Link
                to="/go-live"
                className="border border-white/25 bg-black/40 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold flex items-center gap-2 justify-center hover:border-[var(--lime)]/50 hover:bg-white/5 transition-colors text-sm"
              >
                <Tv2 className="w-5 h-5 text-[var(--magenta)]" /> Go Live
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1400&h=700&fit=crop&q=80"
              alt="DJ booth atmosphere"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
            <div className="relative p-8 md:p-12 max-w-xl">
              <span className="font-display text-sm tracking-[0.2em] text-[var(--lime)] mb-3 block">FOR ARTISTS</span>
              <h2 className="font-display text-4xl md:text-5xl text-white mb-3 leading-none">PLAY THE ROOM. GET PAID.</h2>
              <p className="text-white/70 mb-6 text-sm md:text-base">
                Upload originals, schedule ticketed nights, tip jar on — your set, your audience, your cut.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/for-artists" className="gradient-bg px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                  Artist tools
                </Link>
                <Link to="/go-live" className="border border-white/25 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:border-[var(--magenta)]/50 transition-colors">
                  <Radio className="w-4 h-4" /> Go Live
                </Link>
              </div>
            </div>
          </div>
        </section>

        {(followingLoading || followingTracks.length > 0) && (
          <section className="max-w-6xl mx-auto px-4 pb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl text-white flex items-center gap-2 tracking-wide">
                <Heart className="w-6 h-6 text-[var(--magenta)]" /> FOLLOWING
              </h2>
              <Link to="/discover" className="text-[var(--lime)] hover:opacity-80 text-sm font-semibold">Discover →</Link>
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

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-3xl text-white flex items-center gap-2 tracking-wide">
              <Music className="w-6 h-6 text-[var(--lime)]" /> FEATURED
            </h2>
            <Link to="/discover" className="text-[var(--lime)] hover:opacity-80 text-sm font-semibold">View all →</Link>
          </div>
          {tracksLoading ? (
            <TrackSkeletonGrid count={3} />
          ) : tracks.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No featured tracks yet. Be the first to upload.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.map(track => <TrackCard key={track.id} track={track} />)}
            </div>
          )}
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-3xl text-white flex items-center gap-2 tracking-wide">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--magenta)] live-pulse" />
                LIVE NOW
              </span>
            </h2>
            <Link to="/live" className="text-[var(--lime)] hover:opacity-80 text-sm font-semibold">View all →</Link>
          </div>
          {streamsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse border border-border">
                  <div className="aspect-video bg-secondary" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-secondary rounded" />
                    <div className="h-2 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : streams.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No one is live right now — claim the booth.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {streams.map(stream => <StreamCard key={stream.id} stream={stream} />)}
            </div>
          )}
        </section>

        {stats && (
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Music, label: 'Tracks', value: formatStat(stats.tracks) },
                { icon: Users, label: 'Artists', value: formatStat(stats.artists) },
                { icon: Radio, label: 'Streams', value: formatStat(stats.streams) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="border border-white/10 bg-white/[0.03] rounded-xl p-5 text-center">
                  <Icon className="w-5 h-5 mx-auto mb-2 text-[var(--lime)]" />
                  <p className="font-display text-4xl text-white mb-0.5 tracking-wide">{value}</p>
                  <p className="text-muted-foreground text-xs uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PullToRefresh>
  );
}

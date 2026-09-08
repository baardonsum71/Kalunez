import { Link } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Play, Radio, Music, Heart, Tv2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { listRows, filterRows } from '@/lib/db';
import { useAuth } from '@/lib/AuthContext';
import TrackCard from '@/components/TrackCard';
import StreamCard from '@/components/StreamCard';
import PullToRefresh from '@/components/PullToRefresh';

function TrackSkeletonGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isNative = Capacitor.isNativePlatform();

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

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="hero-gradient min-h-screen">
        <section className="relative min-h-[70svh] md:min-h-[85svh] flex items-end md:items-center overflow-hidden club-grain">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 90% 60% at 75% 40%, rgba(255, 45, 149, 0.28), transparent 55%),
                radial-gradient(ellipse 70% 50% at 15% 70%, rgba(200, 245, 66, 0.14), transparent 50%),
                linear-gradient(165deg, #050507 0%, #0c0612 45%, #050507 100%)
              `,
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-[#050507]/50" aria-hidden />

          <div className="relative z-[2] w-full max-w-6xl mx-auto px-4 pt-[calc(5rem+var(--safe-top))] pb-12 md:pb-20">
            <p className="font-display text-5xl sm:text-6xl md:text-8xl tracking-wide logo-gradient-text mb-4 md:mb-6">
              KALUNEZ
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-white leading-[0.95] mb-4 max-w-3xl">
              THE ROOM<br />
              <span className="gradient-text">NEVER CLOSES</span>
            </h1>
            <p className="text-base md:text-lg text-white/75 max-w-md mb-8 font-medium">
              Stream sets, buy tickets, go live — built for nights that refuse to end.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/discover"
                className="gradient-bg px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 justify-center hover:opacity-90 transition-opacity text-sm tracking-wide uppercase"
              >
                <Play className="w-5 h-5" /> Enter the stream
              </Link>
              {!isNative && (
                <Link
                  to="/go-live"
                  className="border border-white/25 bg-black/40 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold flex items-center gap-2 justify-center hover:border-[var(--lime)]/50 hover:bg-white/5 transition-colors text-sm"
                >
                  <Tv2 className="w-5 h-5 text-[var(--magenta)]" /> Go Live
                </Link>
              )}
            </div>
          </div>
        </section>

        {(followingLoading || followingTracks.length > 0) && (
          <section className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl md:text-3xl text-white flex items-center gap-2 tracking-wide">
                <Heart className="w-5 h-5 text-[var(--magenta)]" /> FOLLOWING
              </h2>
              <Link to="/discover" className="text-[var(--lime)] hover:opacity-80 text-sm font-semibold">Discover →</Link>
            </div>
            {followingLoading ? (
              <TrackSkeletonGrid count={2} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {followingTracks.map(track => <TrackCard key={track.id} track={track} />)}
              </div>
            )}
          </section>
        )}

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl md:text-3xl text-white flex items-center gap-2 tracking-wide">
              <Music className="w-5 h-5 text-[var(--lime)]" /> FEATURED
            </h2>
            <Link to="/discover" className="text-[var(--lime)] hover:opacity-80 text-sm font-semibold">View all →</Link>
          </div>
          {tracksLoading ? (
            <TrackSkeletonGrid count={2} />
          ) : tracks.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No featured tracks yet. Be the first to upload.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tracks.map(track => <TrackCard key={track.id} track={track} />)}
            </div>
          )}
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl md:text-3xl text-white flex items-center gap-2 tracking-wide">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--magenta)] live-pulse" />
                LIVE NOW
              </span>
            </h2>
            <Link to="/live" className="text-[var(--lime)] hover:opacity-80 text-sm font-semibold">View all →</Link>
          </div>
          {streamsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array(2).fill(0).map((_, i) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {streams.map(stream => <StreamCard key={stream.id} stream={stream} />)}
            </div>
          )}
        </section>
      </div>
    </PullToRefresh>
  );
}

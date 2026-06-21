import { useState, useMemo } from 'react';
import { Search, TrendingUp, Star, Flame, Music } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TrackCard from '@/components/TrackCard';
import PullToRefresh from '@/components/PullToRefresh';
import MobileSelect from '@/components/MobileSelect';
import { useDebounce } from '@/hooks/useDebounce';

const GENRES = ['All Genres', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'R&B', 'Classical', 'Country', 'Reggae', 'Other'];
const TIME_PERIODS = ['Today', 'This Week', 'This Month', 'This Year', 'All Time'];
const TABS = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'new', label: 'New Releases', icon: Star },
  { id: 'top', label: 'Top Charts', icon: Flame },
];

function getPeriodStart(period) {
  const now = new Date();
  switch (period) {
    case 'Today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'This Week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'This Month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'This Year':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
}

export default function Discover() {
  const [genre, setGenre] = useState('All Genres');
  const [period, setPeriod] = useState('All Time');
  const [tab, setTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const queryClient = useQueryClient();
  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['tracks', genre, tab],
    queryFn: () => genre === 'All Genres'
      ? base44.entities.Track.list('-plays', 50)
      : base44.entities.Track.filter({ genre }, '-plays', 50),
    staleTime: 60000,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['tracks'] });
  };

  const filteredTracks = useMemo(() => {
    let result = tab === 'new'
      ? [...tracks].sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      : tab === 'top'
      ? [...tracks].sort((a, b) => (b.likes || 0) - (a.likes || 0))
      : tracks;

    const periodStart = getPeriodStart(period);
    if (periodStart) {
      result = result.filter(t => new Date(t.created_date) >= periodStart);
    }

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        (track.genre && track.genre.toLowerCase().includes(query))
      );
    }

    return result;
  }, [tracks, tab, period, debouncedSearch]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="hero-gradient min-h-screen">
        <div className="bg-gradient-to-b from-purple-900/40 to-transparent px-4 pt-10 pb-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
              <Search className="w-7 h-7 text-purple-400" /> Discover Music
            </h1>
            <p className="text-muted-foreground">Find your next favorite track</p>
            <div className="mt-5 mb-4">
              <input
                type="search"
                placeholder="Search tracks, artists, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tracks"
                className="w-full bg-secondary/50 border border-border text-white text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <MobileSelect value={genre} onValueChange={setGenre} options={GENRES} className="w-40" />
              <MobileSelect value={period} onValueChange={setPeriod} options={TIME_PERIODS} className="w-40" />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex gap-2 mb-8 border-b border-border pb-0 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  tab === id
                    ? 'gradient-bg text-white'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              {tab === 'trending' ? 'Trending Now' : tab === 'new' ? 'New Releases' : 'Top Charts'}
            </h2>
            <span className="text-muted-foreground text-sm">{filteredTracks.length} tracks</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-secondary" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-secondary rounded" />
                    <div className="h-2 bg-secondary rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-20">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No tracks found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTracks.map(track => <TrackCard key={track.id} track={track} />)}
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mt-14 mb-6 flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-400" /> Genre Spotlight
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, label: 'Trending Tracks', value: filteredTracks.length, color: 'text-green-400' },
              { icon: Star, label: 'New This Week', value: tracks.filter(t => {
                const d = new Date(t.created_date);
                return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
              }).length, color: 'text-yellow-400' },
              { icon: Music, label: 'Genres Available', value: new Set(tracks.map(t => t.genre).filter(Boolean)).size, color: 'text-purple-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 rounded-xl p-6 flex flex-col items-center">
                <Icon className={`w-8 h-8 mb-2 ${color}`} />
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-muted-foreground text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Radio, CalendarPlus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { filterRows } from '@/lib/db';
import StreamCard from '@/components/StreamCard';
import EventCard from '@/components/EventCard';
import PullToRefresh from '@/components/PullToRefresh';
import MobileSelect from '@/components/MobileSelect';

const CATEGORIES = ['All Categories', 'Music', 'Electronic', 'Hip Hop', 'Rock', 'Jazz'];
const TYPES = ['All Types', 'Audio Only', 'Video'];
const SORT_OPTIONS = ['Most Viewers', 'Most Recent', 'Most Reactions'];

export default function Live() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [type, setType] = useState('All Types');
  const [sort, setSort] = useState('Most Viewers');

  const queryClient = useQueryClient();
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['live-streams'],
    queryFn: () => filterRows('live_streams', { is_live: true }, '-viewer_count', 50),
  });

  const { data: upcoming = [] } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      try {
        const rows = await filterRows('live_streams', { status: 'scheduled' }, 'starts_at', 30);
        const now = Date.now();
        return rows.filter((e) => !e.starts_at || new Date(e.starts_at).getTime() >= now - 3600_000);
      } catch {
        // Migration not applied yet — show empty upcoming
        return [];
      }
    },
  });

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['live-streams'] }),
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] }),
    ]);
  };

  const filtered = streams
    .filter((s) => {
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.artist?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All Categories' || s.category === category;
      const matchType = type === 'All Types' || s.stream_type === type;
      return matchSearch && matchCat && matchType;
    })
    .sort((a, b) => {
      if (sort === 'Most Viewers') return (b.viewer_count || 0) - (a.viewer_count || 0);
      if (sort === 'Most Reactions') return (b.reaction_count || 0) - (a.reaction_count || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  const filteredUpcoming = upcoming.filter((e) => {
    if (!search) return true;
    return e.title.toLowerCase().includes(search.toLowerCase()) || e.artist?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="hero-gradient min-h-screen">
        <div className="bg-gradient-to-b from-blue-900/30 to-transparent px-4 pt-10 pb-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Live Streams</h1>
              <p className="text-muted-foreground">Discover live music and upcoming concerts</p>
            </div>
            <Link
              to="/create-event"
              className="inline-flex items-center justify-center gap-2 gradient-bg text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90"
            >
              <CalendarPlus className="w-4 h-4" /> Create Event
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-20">
          <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search streams..."
                className="w-full bg-secondary border border-border text-foreground text-sm pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <MobileSelect value={category} onValueChange={setCategory} options={CATEGORIES} className="w-44" />
            <MobileSelect value={type} onValueChange={setType} options={TYPES} className="w-36" />
            <MobileSelect value={sort} onValueChange={setSort} options={SORT_OPTIONS} className="w-44" />
          </div>

          {filteredUpcoming.length > 0 && (
            <section className="mb-10">
              <h2 className="text-white font-bold text-lg mb-4">Upcoming concerts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredUpcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-white font-bold text-lg mb-4">Live now</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                      <div className="aspect-video bg-secondary" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-secondary rounded" />
                        <div className="h-2 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Radio className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-semibold text-white mb-2">No Live Streams</h3>
                <p className="text-muted-foreground mb-4">Be the first to go live — or schedule a concert.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/go-live" className="gradient-bg text-white px-5 py-2.5 rounded-xl font-bold text-sm">
                    Go Live
                  </Link>
                  <Link to="/create-event" className="border border-border text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:border-purple-500/50">
                    Create Event
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filtered.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PullToRefresh>
  );
}

import { useState } from 'react';
import { Search, Radio } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import StreamCard from '@/components/StreamCard';
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
    queryFn: () => base44.entities.LiveStream.filter({ is_live: true }, '-viewer_count', 50),
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['live-streams'] });
  };

  const filtered = streams
    .filter(s => {
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

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-blue-900/30 to-transparent px-4 pt-10 pb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1">Live Streams</h1>
          <p className="text-muted-foreground">Discover live music and performances</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Filters */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search streams..."
              className="w-full bg-secondary border border-border text-foreground text-sm pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          <MobileSelect value={category} onValueChange={setCategory} options={CATEGORIES} className="w-44" />
          <MobileSelect value={type} onValueChange={setType} options={TYPES} className="w-36" />
          <MobileSelect value={sort} onValueChange={setSort} options={SORT_OPTIONS} className="w-44" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
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
          <div className="text-center py-24">
            <Radio className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-semibold text-white mb-2">No Live Streams</h3>
            <p className="text-muted-foreground">Be the first to go live!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map(stream => <StreamCard key={stream.id} stream={stream} />)}
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}
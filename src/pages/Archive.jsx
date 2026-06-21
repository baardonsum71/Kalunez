import { useState } from 'react';
import { Archive, Clock, Music, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

function formatDuration(seconds) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ArchivePage() {
  const [search, setSearch] = useState('');

  const { data: vods = [], isLoading } = useQuery({
    queryKey: ['vods'],
    queryFn: () => base44.entities.LiveStream.filter({ is_live: false }, '-created_date', 50),
  });

  const filtered = vods.filter(v =>
    !search || v.title.toLowerCase().includes(search.toLowerCase()) || v.artist?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-indigo-900/30 to-transparent px-4 pt-10 pb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
            <Archive className="w-7 h-7 text-indigo-400" /> Stream Archive
          </h1>
          <p className="text-muted-foreground">Watch past performances on demand</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search past streams..."
            className="w-full max-w-sm bg-secondary border border-border text-foreground text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-secondary" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-secondary rounded" />
                  <div className="h-2 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Archive className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-semibold text-white mb-2">No archived streams yet</h3>
            <p className="text-muted-foreground">Past streams will appear here once they end.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(vod => (
             <Link key={vod.id} to={`/vod/${vod.id}`} className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all group block">
                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm truncate mb-1">{vod.title}</h3>
                  <p className="text-muted-foreground text-xs truncate mb-2">{vod.artist}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="bg-secondary px-2 py-0.5 rounded">{vod.category || 'Music'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(vod.ended_at || vod.created_date)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
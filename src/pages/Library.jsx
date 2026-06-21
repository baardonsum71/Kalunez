import { useState, useEffect } from 'react';
import { Music, Search, Heart, ListMusic, Plus, Trash2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TrackCard from '@/components/TrackCard';
import PullToRefresh from '@/components/PullToRefresh';

export default function Library() {
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: allTracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['library-tracks'],
    queryFn: () => base44.entities.Track.list('-created_date', 200),
  });

  const { data: playlists = [], isLoading: playlistsLoading } = useQuery({
    queryKey: ['my-playlists', user?.email],
    queryFn: () => base44.entities.Playlist.filter({ created_by: user.email }, '-created_date', 50),
    enabled: !!user,
  });

  const { mutate: createPlaylist } = useMutation({
    mutationFn: () => base44.entities.Playlist.create({ name: newName.trim(), track_ids: [], is_public: true }),
    onSuccess: () => { setNewName(''); setShowCreate(false); qc.invalidateQueries({ queryKey: ['my-playlists'] }); },
  });

  const { mutate: deletePlaylist } = useMutation({
    mutationFn: (id) => base44.entities.Playlist.delete(id),
    onSuccess: () => { setSelectedPlaylist(null); qc.invalidateQueries({ queryKey: ['my-playlists'] }); },
  });

  const { mutate: removeFromPlaylist } = useMutation({
    mutationFn: ({ playlistId, trackId }) => {
      const pl = playlists.find(p => p.id === playlistId);
      return base44.entities.Playlist.update(playlistId, { track_ids: (pl.track_ids || []).filter(id => id !== trackId) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-playlists'] }),
  });

  const handleRefresh = () => qc.invalidateQueries({ queryKey: ['library-tracks'] });

  const playlistTracks = selectedPlaylist
    ? allTracks.filter(t => (selectedPlaylist.track_ids || []).includes(t.id))
    : [];

  const filtered = allTracks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.artist?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="hero-gradient min-h-screen">
        <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
              <Music className="w-7 h-7 text-purple-400" /> My Library
            </h1>
            <p className="text-muted-foreground">Your music collection & playlists</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-20 space-y-10">

          {/* Playlists Section */}
          {user && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ListMusic className="w-5 h-5 text-purple-400" /> Playlists
                </h2>
                <button
                  onClick={() => setShowCreate(v => !v)}
                  className="gradient-bg text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" /> New Playlist
                </button>
              </div>

              {showCreate && (
                <div className="flex gap-3 mb-4">
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && newName.trim() && createPlaylist()}
                    placeholder="Playlist name..."
                    className="flex-1 max-w-xs bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                  <button onClick={() => newName.trim() && createPlaylist()} className="gradient-bg text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                    Create
                  </button>
                  <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-white px-2 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              )}

              {playlistsLoading ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[1,2,3].map(i => <div key={i} className="w-36 h-24 bg-card rounded-xl animate-pulse shrink-0" />)}
                </div>
              ) : playlists.length === 0 ? (
                <p className="text-muted-foreground text-sm">No playlists yet. Create one and add tracks!</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {playlists.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlaylist(p.id === selectedPlaylist?.id ? null : p)}
                      className={`shrink-0 w-36 bg-card border rounded-xl p-3 text-left transition-all hover:border-purple-500/60 ${selectedPlaylist?.id === p.id ? 'border-purple-500 bg-purple-900/20' : 'border-border'}`}
                    >
                      <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center mb-2">
                        <ListMusic className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                      <p className="text-muted-foreground text-xs">{(p.track_ids || []).length} tracks</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Expanded playlist view */}
              {selectedPlaylist && (
                <div className="mt-6 bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                      <h3 className="text-white font-bold">{selectedPlaylist.name}</h3>
                      <p className="text-muted-foreground text-xs">{playlistTracks.length} tracks</p>
                    </div>
                    <button onClick={() => deletePlaylist(selectedPlaylist.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {playlistTracks.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">No tracks in this playlist yet.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {playlistTracks.map(track => (
                        <div key={track.id} className="flex items-center gap-3 px-5 py-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                            {track.cover_url ? <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Music className="w-4 h-4 text-muted-foreground" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{track.title}</p>
                            <p className="text-muted-foreground text-xs truncate">{track.artist}</p>
                          </div>
                          <button
                            onClick={() => removeFromPlaylist({ playlistId: selectedPlaylist.id, trackId: track.id })}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* All Tracks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" /> All Tracks
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-secondary border border-border text-foreground text-sm pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 w-48"
                />
              </div>
            </div>

            {tracksLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array(10).fill(0).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-secondary" />
                    <div className="p-3 space-y-2"><div className="h-3 bg-secondary rounded" /><div className="h-2 bg-secondary rounded w-2/3" /></div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <Heart className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-semibold text-white mb-2">No tracks found</h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {filtered.map(track => <TrackCard key={track.id} track={track} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}
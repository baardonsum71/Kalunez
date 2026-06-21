import { useState } from 'react';
import { ListMusic, Plus, X, Trash2, ChevronLeft, Music } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

export default function Playlists() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState(null); // selected playlist object
  const qc = useQueryClient();

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list('-created_date', 50),
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['all-tracks-for-playlists'],
    queryFn: () => base44.entities.Track.list('-created_date', 200),
    enabled: !!selected,
  });

  const create = useMutation({
    mutationFn: (data) => base44.entities.Playlist.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists'] });
      setShowForm(false);
      setName('');
      setDescription('');
    },
  });

  const deletePlaylist = useMutation({
    mutationFn: (id) => base44.entities.Playlist.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists'] });
      setSelected(null);
    },
  });

  const removeTrack = useMutation({
    mutationFn: ({ playlist, trackId }) =>
      base44.entities.Playlist.update(playlist.id, {
        track_ids: (playlist.track_ids || []).filter((id) => id !== trackId),
      }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['playlists'] });
      setSelected(updated);
    },
  });

  // Keep selected in sync with latest data
  const currentPlaylist = selected ? playlists.find((p) => p.id === selected.id) || selected : null;
  const playlistTracks = currentPlaylist
    ? tracks.filter((t) => (currentPlaylist.track_ids || []).includes(t.id))
    : [];

  if (currentPlaylist) {
    return (
      <div className="hero-gradient min-h-screen">
        <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 text-muted-foreground hover:text-white text-sm mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> All Playlists
            </button>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
                  <ListMusic className="w-7 h-7 text-purple-400" />
                  {currentPlaylist.name}
                </h1>
                {currentPlaylist.description && (
                  <p className="text-muted-foreground">{currentPlaylist.description}</p>
                )}
                <p className="text-muted-foreground text-sm mt-1">
                  {(currentPlaylist.track_ids || []).length} tracks
                </p>
              </div>
              <button
                onClick={() => deletePlaylist.mutate(currentPlaylist.id)}
                disabled={deletePlaylist.isPending}
                className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/30 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-destructive/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 pb-20">
          {playlistTracks.length === 0 ? (
            <div className="text-center py-24">
              <Music className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-xl font-semibold text-white mb-2">No tracks yet</h3>
              <p className="text-muted-foreground">Add tracks from Discover or Library.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlistTracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-card border border-border rounded-xl flex items-center gap-4 p-3 hover:border-purple-500/40 transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary shrink-0 overflow-hidden">
                    {track.cover_url ? (
                      <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-pink-900/30">
                        <Music className="w-5 h-5 text-purple-400/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/track/${track.id}`} className="text-white font-semibold text-sm truncate block hover:text-purple-400 transition-colors">
                      {track.title}
                    </Link>
                    <p className="text-muted-foreground text-xs truncate">{track.artist}</p>
                  </div>
                  {track.genre && (
                    <span className="hidden sm:block bg-secondary text-purple-300 text-xs px-2 py-0.5 rounded-full shrink-0">
                      {track.genre}
                    </span>
                  )}
                  <button
                    onClick={() => removeTrack.mutate({ playlist: currentPlaylist, trackId: track.id })}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
                    title="Remove from playlist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
              <ListMusic className="w-7 h-7 text-purple-400" /> Playlists
            </h1>
            <p className="text-muted-foreground">Organize your favorite music</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="gradient-bg text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> New Playlist
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {showForm && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Create Playlist</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Playlist name..."
                className="w-full bg-secondary border border-border text-foreground text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="w-full bg-secondary border border-border text-foreground text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => name && create.mutate({ name, description })}
                disabled={!name || create.isPending}
                className="gradient-bg text-white px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {create.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse space-y-3">
                <div className="aspect-square bg-secondary rounded-lg" />
                <div className="h-3 bg-secondary rounded" />
                <div className="h-2 bg-secondary rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-24">
            <ListMusic className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
            <p className="text-muted-foreground">Create your first playlist to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => setSelected(pl)}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-900/40 to-pink-900/30 flex items-center justify-center">
                  <ListMusic className="w-10 h-10 text-purple-400/60" />
                </div>
                <div className="p-3">
                  <h3 className="text-white font-semibold text-sm truncate">{pl.name}</h3>
                  {pl.description && (
                    <p className="text-muted-foreground text-xs mt-0.5 truncate">{pl.description}</p>
                  )}
                  <p className="text-muted-foreground text-xs mt-1">
                    {(pl.track_ids || []).length} tracks
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
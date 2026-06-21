import { useState, useEffect } from 'react';
import { ListPlus, Plus, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AddToPlaylistButton({ trackId }) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState('');
  const [added, setAdded] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const load = async () => {
    if (!user) return;
    const all = await base44.entities.Playlist.filter({ created_by: user.email }, '-created_date', 50);
    setPlaylists(all);
  };

  const toggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) { base44.auth.redirectToLogin(); return; }
    await load();
    setOpen(v => !v);
  };

  const qc = useQueryClient();

  // Pre-cache audio when saving to playlist
  const cacheAudio = (audioUrl) => {
    if (audioUrl && navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CACHE_AUDIO', url: audioUrl });
    }
  };

  const { mutate: addToPlaylist } = useMutation({
    mutationFn: async ({ playlist, track }) => {
      const ids = playlist.track_ids || [];
      if (ids.includes(trackId)) return;
      if (track?.audio_url) cacheAudio(track.audio_url);
      return base44.entities.Playlist.update(playlist.id, { track_ids: [...ids, trackId] });
    },
    onMutate: async ({ playlist }) => {
      const ids = playlist.track_ids || [];
      if (ids.includes(trackId)) return;
      setAdded(playlist.id);
      qc.setQueryData(['my-playlists', user?.email], (old) =>
        old?.map((p) => (p.id === playlist.id ? { ...p, track_ids: [...ids, trackId] } : p))
      );
      return { playlist };
    },
    onError: (err, vars, context) => {
      if (context?.playlist) {
        qc.invalidateQueries({ queryKey: ['my-playlists'] });
      }
    },
    onSuccess: () => {
      setTimeout(() => { setAdded(null); setOpen(false); }, 800);
    },
  });

  const { mutate: createAndAdd } = useMutation({
    mutationFn: async () => {
      if (!newName.trim()) return;
      return base44.entities.Playlist.create({ name: newName.trim(), track_ids: [trackId], is_public: true });
    },
    onMutate: async () => {
      const optimisticPlaylist = { id: `optimistic-${Date.now()}`, name: newName.trim(), track_ids: [trackId] };
      setAdded(optimisticPlaylist.id);
      setNewName('');
      qc.setQueryData(['my-playlists', user?.email], (old) => [optimisticPlaylist, ...(old || [])]);
      return { optimisticId: optimisticPlaylist.id };
    },
    onError: (err, vars, context) => {
      qc.invalidateQueries({ queryKey: ['my-playlists'] });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-playlists'] });
      setTimeout(() => { setAdded(null); setOpen(false); }, 800);
    },
  });

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={toggle}
        title="Add to playlist"
        className="p-1.5 rounded-md text-muted-foreground hover:text-purple-400 hover:bg-secondary transition-colors"
      >
        <ListPlus className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-white text-xs font-semibold">Add to Playlist</span>
            <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); }} className="text-muted-foreground hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto">
            {playlists.length === 0 ? (
              <p className="text-muted-foreground text-xs px-3 py-2">No playlists yet</p>
            ) : playlists.map(p => {
              const alreadyIn = (p.track_ids || []).includes(trackId);
              return (
                <button
                  key={p.id}
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); addToPlaylist({ playlist: p, track: null }); }}
                  disabled={alreadyIn}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary text-sm text-foreground transition-colors disabled:opacity-50"
                >
                  <span className="truncate">{p.name}</span>
                  {added === p.id ? <Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> : alreadyIn ? <Check className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : null}
                </button>
              );
            })}
          </div>

          <div className="border-t border-border px-3 py-2 flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), createAndAdd())}
              placeholder="New playlist..."
              className="flex-1 bg-secondary border border-border text-foreground text-xs px-2 py-1.5 rounded-md focus:outline-none focus:border-purple-500"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); createAndAdd(); }} className="gradient-bg text-white p-1.5 rounded-md hover:opacity-90 transition-opacity">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
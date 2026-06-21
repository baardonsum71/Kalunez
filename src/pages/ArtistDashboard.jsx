import { useState, useEffect } from 'react';
import { BarChart2, Music, DollarSign, Play, Edit2, Trash2, Save, X, Radio } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ConnectOnboarding from '@/components/ConnectOnboarding';
import ArtistAnalyticsChart from '@/components/ArtistAnalyticsChart';
import { formatCents } from '@/lib/stripe';
import { Link } from 'react-router-dom';

export default function ArtistDashboard() {
  const [user, setUser] = useState(null);
  const [artistAccount, setArtistAccount] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['my-tracks', user?.email],
    queryFn: () => base44.entities.Track.filter({ created_by: user.email }, '-created_date', 50),
    enabled: !!user,
  });

  const { data: streams = [] } = useQuery({
    queryKey: ['my-streams', user?.email],
    queryFn: () => base44.entities.LiveStream.filter({ created_by: user.email }, '-created_date', 50),
    enabled: !!user,
  });

  const { data: tips = [] } = useQuery({
    queryKey: ['my-tips', user?.email],
    queryFn: () => base44.entities.Tip.filter({ artist_email: user.email, status: 'completed' }, '-created_date', 20),
    enabled: !!user,
  });

  const { mutate: deleteTrack } = useMutation({
    mutationFn: (id) => base44.entities.Track.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-tracks'] }),
  });

  const { mutate: saveTrack } = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Track.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-tracks'] });
      setEditingId(null);
    },
  });

  const totalPlays = tracks.reduce((s, t) => s + (t.plays || 0), 0);
  const totalStreams = streams.length;
  const tipEarnings = artistAccount?.total_earnings_cents
    ?? tips.reduce((s, t) => s + (t.amount_cents - (t.platform_fee_cents || 0)), 0);

  const startEdit = (track) => {
    setEditingId(track.id);
    setEditForm({ title: track.title, artist: track.artist, genre: track.genre || '', description: track.description || '' });
  };

  if (!user) return (
    <div className="hero-gradient min-h-screen flex flex-col items-center justify-center gap-4">
      <BarChart2 className="w-12 h-12 text-purple-400 opacity-50" />
      <p className="text-white text-xl font-semibold">Sign in to view your dashboard</p>
      <button type="button" onClick={() => base44.auth.redirectToLogin()} className="gradient-bg text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
        Sign In
      </button>
    </div>
  );

  return (
    <div className="hero-gradient min-h-screen px-4 pt-[calc(2.5rem+var(--safe-top))] pb-[calc(6rem+var(--safe-bottom))]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
          <BarChart2 className="w-7 h-7 text-purple-400" /> Artist Dashboard
        </h1>
        <p className="text-muted-foreground mb-8">
          Welcome back, <span className="text-purple-300">{user.full_name || user.email}</span>
          {user.role === 'admin' && (
            <Link to="/analytics" className="ml-3 text-purple-400 text-sm hover:underline">Platform Analytics →</Link>
          )}
        </p>

        <ConnectOnboarding user={user} onUpdate={setArtistAccount} />

        <ArtistAnalyticsChart />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Music, label: 'Uploads', value: tracks.length, color: 'text-purple-400' },
            { icon: Play, label: 'Total Plays', value: totalPlays.toLocaleString(), color: 'text-cyan-400' },
            { icon: Radio, label: 'Live Streams', value: totalStreams, color: 'text-pink-400' },
            { icon: DollarSign, label: 'Tip Earnings', value: formatCents(tipEarnings), color: 'text-yellow-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 rounded-xl p-4 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {tips.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-10">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-white font-bold text-lg">Recent Tips</h2>
            </div>
            <div className="divide-y divide-border">
              {tips.slice(0, 5).map(tip => (
                <div key={tip.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{formatCents(tip.amount_cents - (tip.platform_fee_cents || 0))}</p>
                    <p className="text-muted-foreground text-xs">from {tip.tipper_email?.split('@')[0] || 'fan'}</p>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {new Date(tip.created_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">My Uploads</h2>
            <span className="text-muted-foreground text-sm">{tracks.length} tracks</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3].map(i => (
                <div key={i} className="px-6 py-4 flex gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-secondary rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-secondary rounded w-1/3" />
                    <div className="h-2 bg-secondary rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-16">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-white font-semibold mb-1">No uploads yet</p>
              <p className="text-muted-foreground text-sm">Head to the Upload page to share your music</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tracks.map(track => (
                <div key={track.id} className="px-6 py-4">
                  {editingId === track.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={editForm.title}
                          onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="Title"
                          className="bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <input
                          value={editForm.artist}
                          onChange={e => setEditForm(f => ({ ...f, artist: e.target.value }))}
                          placeholder="Artist"
                          className="bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <input
                        value={editForm.description}
                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Description (optional)"
                        className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveTrack({ id: track.id, data: editForm })}
                          className="flex items-center gap-1 gradient-bg text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 border border-border text-foreground text-sm px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                        {track.cover_url ? (
                          <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{track.title}</p>
                        <p className="text-muted-foreground text-xs">{track.artist} · {track.genre || 'Unknown Genre'}</p>
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Play className="w-3 h-3" /> {track.plays || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(track)}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTrack(track.id)}
                          className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

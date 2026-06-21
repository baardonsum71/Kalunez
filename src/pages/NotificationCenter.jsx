import { useState, useEffect } from 'react';
import { Bell, Music, Radio, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationCenter() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 100),
    enabled: !!user,
    refetchInterval: 3000,
  });

  const { mutate: markAsRead } = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markAllAsRead } = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: deleteNotification } = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleNotificationClick = (notif) => {
    if (notif.type === 'track_upload') {
      navigate(`/track/${notif.content_id}`);
    } else if (notif.type === 'live_stream') {
      navigate(`/vod/${notif.content_id}`);
    }
    markAsRead(notif.id);
  };

  if (!user) {
    return (
      <div className="hero-gradient min-h-screen flex flex-col items-center justify-center gap-4">
        <Bell className="w-12 h-12 text-purple-400 opacity-50" />
        <p className="text-white text-xl font-semibold">Sign in to view notifications</p>
        <button onClick={() => base44.auth.redirectToLogin()} className="gradient-bg text-white px-6 py-3 rounded-xl font-bold hover:opacity-90">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="hero-gradient min-h-screen px-4 pt-10 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-purple-400" /> Notifications
          </h1>
          {notifications.some(n => !n.read) && (
            <button onClick={() => markAllAsRead()} className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
              <Check className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-secondary rounded w-1/2" />
                    <div className="h-2 bg-secondary rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-white font-semibold mb-1">No notifications yet</p>
              <p className="text-muted-foreground text-sm">Follow artists to get notified when they upload or go live</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(notif => {
                const Icon = notif.type === 'track_upload' ? Music : Radio;
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full flex items-start gap-4 px-5 py-4 hover:bg-secondary/50 transition-colors text-left ${!notif.read ? 'bg-purple-500/10 border-l-2 border-purple-400' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">
                        {notif.type === 'track_upload' ? `${notif.artist_name} uploaded a new track` : `${notif.artist_name} started a live stream`}
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5">{notif.content_title}</p>
                      <p className="text-muted-foreground text-xs mt-1">{timeAgo(notif.created_date)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10 shrink-0 mt-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
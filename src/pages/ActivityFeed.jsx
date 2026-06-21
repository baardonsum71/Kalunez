import { useState, useEffect } from 'react';
import { Heart, Music, ListMusic, Clock } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/PullToRefresh';

export default function ActivityFeed() {
  const [user, setUser] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = base44.entities.Activity.subscribe((event) => {
      qc.invalidateQueries({ queryKey: ['activity-feed'] });
    });
    return unsubscribe;
  }, [user, qc]);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: () => base44.entities.Activity.list('-created_date', 50),
  });

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'like':
        return <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />;
      case 'playlist_add':
        return <ListMusic className="w-4 h-4 text-purple-400" />;
      case 'listen':
        return <Music className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getActionText = (actionType) => {
    switch (actionType) {
      case 'like':
        return 'liked';
      case 'playlist_add':
        return 'added to playlist';
      case 'listen':
        return 'is listening to';
      default:
        return 'interacted with';
    }
  };

  const formatTime = (isoDate) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleRefresh = () => qc.invalidateQueries({ queryKey: ['activity-feed'] });

  if (!user) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Sign in to see activity from your friends</p>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="hero-gradient min-h-screen">
        <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
              <Music className="w-7 h-7 text-purple-400" /> Activity Feed
            </h1>
            <p className="text-muted-foreground">See what your friends are listening to</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-20">
          {isLoading ? (
            <div className="space-y-3 mt-6">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 rounded-lg h-20 animate-pulse border border-cyan-500/20" />
                ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-24">
              <Music className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-xl font-semibold text-white mb-2">No activity yet</h3>
              <p className="text-muted-foreground">Start listening, liking, and sharing to see activity here</p>
            </div>
          ) : (
            <div className="space-y-3 mt-6">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-400/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center mt-0.5">
                      {getActionIcon(activity.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-white font-semibold">
                            {activity.user_name}
                            <span className="text-muted-foreground font-normal"> {getActionText(activity.action_type)}</span>
                          </p>
                          <p className="text-purple-300 font-medium truncate">{activity.track_title}</p>
                          <p className="text-muted-foreground text-sm truncate">{activity.artist_name}</p>
                        </div>
                        <div className="text-muted-foreground text-xs flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatTime(activity.created_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
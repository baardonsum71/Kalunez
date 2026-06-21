import { memo, useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { AnalyticsEvents } from '@/lib/analytics';

function FollowButton({ artistName }) {
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const queryClient = useQueryClient();

  const { data: followId, isLoading } = useQuery({
    queryKey: ['follow', user?.email, artistName],
    queryFn: async () => {
      const existing = await base44.entities.Follow.filter({
        follower_email: user.email,
        artist_name: artistName,
      });
      return existing.length > 0 ? existing[0].id : null;
    },
    enabled: isAuthenticated && !!user?.email && !!artistName,
    staleTime: 60000,
  });

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    try {
      if (followId) {
        await base44.entities.Follow.delete(followId);
        toast({ title: 'Unfollowed', description: `You unfollowed ${artistName}` });
      } else {
        await base44.entities.Follow.create({ follower_email: user.email, artist_name: artistName });
        AnalyticsEvents.followArtist(artistName);
        toast({ title: 'Following', description: `You now follow ${artistName}` });
      }
      queryClient.invalidateQueries({ queryKey: ['follow', user.email, artistName] });
      queryClient.invalidateQueries({ queryKey: ['following-feed'] });
    } catch {
      toast({ title: 'Error', description: 'Could not update follow status.', variant: 'destructive' });
    }
  };

  const following = !!followId;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isLoading}
      aria-label={following ? `Unfollow ${artistName}` : `Follow ${artistName}`}
      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-all disabled:opacity-50 ${
        following
          ? 'border-purple-500 text-purple-400 bg-purple-500/10'
          : 'border-border text-muted-foreground hover:border-purple-500/60 hover:text-purple-400'
      }`}
    >
      {following ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
      {following ? 'Following' : 'Follow'}
    </button>
  );
}

export default memo(FollowButton);

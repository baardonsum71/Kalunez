import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Play } from 'lucide-react';
import { getArtistAnalytics } from '@/lib/analytics';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function ArtistAnalyticsChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['artist-analytics'],
    queryFn: () => getArtistAnalytics(14),
    staleTime: 60000,
  });

  const analytics = data?.data || data;
  const chartData = analytics?.playsByDay?.slice(-14) || [];

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 mb-10 animate-pulse">
        <div className="h-4 bg-secondary rounded w-1/4 mb-4" />
        <div className="h-40 bg-secondary rounded" />
      </div>
    );
  }

  if (!chartData.some(d => d.plays > 0)) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-10">
      <h2 className="text-white font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-400" /> Plays (14 days)
      </h2>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
          <Line type="monotone" dataKey="plays" stroke="#a855f7" strokeWidth={2} dot={false} name="Plays" />
        </LineChart>
      </ResponsiveContainer>

      {analytics?.topTracks?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-muted-foreground text-xs mb-2 uppercase tracking-wide">Top performing</p>
          {analytics.topTracks.slice(0, 3).map(t => (
            <div key={t.id} className="flex items-center justify-between py-1">
              <span className="text-white text-sm truncate flex items-center gap-1">
                <Play className="w-3 h-3 text-purple-400 shrink-0" /> {t.title}
              </span>
              <span className="text-muted-foreground text-xs">{t.plays} plays</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

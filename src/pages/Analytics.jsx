import { useQuery } from '@tanstack/react-query';
import { BarChart2, Users, Music, Play, Radio, DollarSign, TrendingUp, Crown, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getPlatformAnalytics, formatAnalyticsCurrency } from '@/lib/analytics';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 rounded-xl p-5">
      <Icon className={`w-5 h-5 mb-2 ${color}`} />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
      {sub && <p className="text-muted-foreground text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const { user, isAuthenticated, navigateToLogin } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: getPlatformAnalytics,
    enabled: isAuthenticated && user?.role === 'admin',
    staleTime: 60000,
    refetchInterval: 120000,
  });

  if (!isAuthenticated) {
    return (
      <div className="hero-gradient min-h-screen flex flex-col items-center justify-center gap-4">
        <BarChart2 className="w-12 h-12 text-purple-400 opacity-50" />
        <p className="text-white text-xl">Sign in to view analytics</p>
        <button type="button" onClick={() => navigateToLogin()} className="gradient-bg text-white px-6 py-3 rounded-xl font-bold">
          Sign In
        </button>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="hero-gradient min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <BarChart2 className="w-12 h-12 text-purple-400 opacity-50" />
        <p className="text-white text-xl font-semibold">Platform analytics is admin-only</p>
        <p className="text-muted-foreground text-sm">View your artist stats on the dashboard instead.</p>
        <Link to="/artist-dashboard" className="gradient-bg text-white px-6 py-3 rounded-xl font-bold">
          Artist Dashboard
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center px-4">
        <p className="text-destructive">Failed to load analytics. Deploy getPlatformAnalytics to Base44.</p>
      </div>
    );
  }

  const { overview, dailyActive, topTracks, eventCounts } = data?.data || data || {};
  const chartData = (dailyActive || []).slice(-14);

  return (
    <div className="hero-gradient min-h-screen px-4 pt-10 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
            <BarChart2 className="w-7 h-7 text-purple-400" /> Platform Analytics
          </h1>
          <p className="text-muted-foreground">Traction metrics for Kalunez — ready for Acquire.com due diligence</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <StatCard icon={Users} label="Active Users (7d)" value={overview?.uniqueUsers7d ?? 0} color="text-cyan-400" sub={`${overview?.uniqueUsers30d ?? 0} in 30d`} />
          <StatCard icon={Activity} label="Page Views (7d)" value={overview?.pageViews7d?.toLocaleString() ?? 0} color="text-purple-400" />
          <StatCard icon={Music} label="Total Tracks" value={overview?.totalTracks ?? 0} color="text-pink-400" sub={`${overview?.totalArtists ?? 0} artists`} />
          <StatCard icon={Play} label="Total Plays" value={overview?.totalPlays?.toLocaleString() ?? 0} color="text-green-400" />
          <StatCard icon={Radio} label="Live Now" value={overview?.liveStreamsNow ?? 0} color="text-red-400" sub={`${overview?.totalStreams ?? 0} total`} />
          <StatCard icon={DollarSign} label="Tip Revenue" value={formatAnalyticsCurrency(overview?.tipRevenueCents)} color="text-yellow-400" sub={`${overview?.totalTips ?? 0} tips`} />
          <StatCard icon={Crown} label="Subscriptions" value={overview?.activeSubscriptions ?? 0} color="text-yellow-400" sub="active" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" /> Daily Active Users (14d)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} />
                <Line type="monotone" dataKey="users" stroke="#a855f7" strokeWidth={2} dot={false} name="Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> Page Views (14d)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="pageViews" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Top Tracks</h2>
            {topTracks?.length ? (
              <div className="space-y-3">
                {topTracks.map((t, i) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{t.title}</p>
                      <p className="text-muted-foreground text-xs truncate">{t.artist}</p>
                    </div>
                    <span className="text-purple-400 text-sm font-semibold">{t.plays} plays</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No tracks yet</p>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Events (7d)</h2>
            {eventCounts && Object.keys(eventCounts).length ? (
              <div className="space-y-2">
                {Object.entries(eventCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground text-sm font-mono">{name}</span>
                      <span className="text-white text-sm font-semibold">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No events recorded yet</p>
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-xs text-center mt-8">
          Also tracked in PostHog when VITE_POSTHOG_KEY is configured · Updated {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'live'}
        </p>
      </div>
    </div>
  );
}

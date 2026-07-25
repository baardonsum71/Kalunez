import { requireUser, getServiceClient, jsonResponse } from '../_shared/client.ts';

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(iso: string | null) {
  return iso ? iso.slice(0, 10) : null;
}

function groupByDay(events: any[], days = 30) {
  const start = daysAgo(days);
  const map: Record<string, { date: string; users: Set<string>; pageViews: number; events: number }> = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = toDateKey(d.toISOString()) as string;
    map[key] = { date: key, users: new Set(), pageViews: 0, events: 0 };
  }

  for (const e of events) {
    const key = toDateKey(e.created_at);
    if (!key || !map[key]) continue;
    map[key].events += 1;
    if (e.event_name === 'page_view') map[key].pageViews += 1;
    const id = e.user_email || e.anonymous_id;
    if (id) map[key].users.add(id);
  }

  return Object.values(map).map((d) => ({
    date: d.date,
    users: d.users.size,
    pageViews: d.pageViews,
    events: d.events,
  }));
}

Deno.serve(async (req) => {
  try {
    const { user, supabase } = await requireUser(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin access required' }, 403);

    const service = getServiceClient();

    const [tracksRes, streamsRes, tipsRes, subsRes, eventsRes] = await Promise.all([
      service.from('tracks').select('*').order('plays', { ascending: false }).limit(500),
      service.from('live_streams').select('*').order('created_at', { ascending: false }).limit(500),
      service.from('tips').select('*').eq('status', 'completed').order('created_at', { ascending: false }).limit(500),
      service.from('subscriptions').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(500),
      service.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(2000),
    ]);

    const tracks = tracksRes.data || [];
    const streams = streamsRes.data || [];
    const tips = tipsRes.data || [];
    const subscriptions = subsRes.data || [];
    const events30d = eventsRes.data || [];

    const cutoff7 = daysAgo(7);
    const cutoff30 = daysAgo(30);

    const events7d = events30d.filter((e) => new Date(e.created_at) >= cutoff7);
    const eventsIn30 = events30d.filter((e) => new Date(e.created_at) >= cutoff30);

    const uniqueUsers7d = new Set(events7d.map((e) => e.user_email || e.anonymous_id).filter(Boolean)).size;
    const uniqueUsers30d = new Set(eventsIn30.map((e) => e.user_email || e.anonymous_id).filter(Boolean)).size;

    const totalPlays = tracks.reduce((s, t) => s + (t.plays || 0), 0);
    const tipRevenueCents = tips.reduce((s, t) => s + (t.amount_cents || 0), 0);
    const liveNow = streams.filter((s) => s.is_live).length;
    const artists = new Set(tracks.map((t) => t.artist).filter(Boolean)).size;

    const topTracks = [...tracks]
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 10)
      .map((t) => ({ id: t.id, title: t.title, artist: t.artist, plays: t.plays || 0, likes: t.likes || 0 }));

    const eventCounts: Record<string, number> = {};
    for (const e of events7d) {
      eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
    }

    return jsonResponse({
      overview: {
        totalTracks: tracks.length,
        totalPlays,
        totalStreams: streams.length,
        liveStreamsNow: liveNow,
        totalArtists: artists,
        totalTips: tips.length,
        tipRevenueCents,
        activeSubscriptions: subscriptions.length,
        uniqueUsers7d,
        uniqueUsers30d,
        pageViews7d: events7d.filter((e) => e.event_name === 'page_view').length,
      },
      dailyActive: groupByDay(eventsIn30, 30),
      topTracks,
      eventCounts,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

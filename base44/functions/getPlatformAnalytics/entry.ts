import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(iso) {
  return iso ? iso.slice(0, 10) : null;
}

function groupByDay(events, days = 30) {
  const start = daysAgo(days);
  const map = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    map[toDateKey(d.toISOString())] = { date: toDateKey(d.toISOString()), users: new Set(), pageViews: 0, events: 0 };
  }

  for (const e of events) {
    const key = toDateKey(e.created_date);
    if (!key || !map[key]) continue;
    map[key].events += 1;
    if (e.event_name === 'page_view') map[key].pageViews += 1;
    const id = e.user_email || e.anonymous_id;
    if (id) map[key].users.add(id);
  }

  return Object.values(map).map(d => ({
    date: d.date,
    users: d.users.size,
    pageViews: d.pageViews,
    events: d.events,
  }));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [tracks, streams, tips, subscriptions, events30d] = await Promise.all([
      base44.asServiceRole.entities.Track.list('-plays', 500),
      base44.asServiceRole.entities.LiveStream.list('-created_date', 500),
      base44.asServiceRole.entities.Tip.filter({ status: 'completed' }, '-created_date', 500),
      base44.asServiceRole.entities.Subscription.filter({ status: 'active' }, '-created_date', 500),
      base44.asServiceRole.entities.AnalyticsEvent.list('-created_date', 2000),
    ]);

    const cutoff7 = daysAgo(7);
    const cutoff30 = daysAgo(30);

    const events7d = events30d.filter(e => new Date(e.created_date) >= cutoff7);
    const eventsIn30 = events30d.filter(e => new Date(e.created_date) >= cutoff30);

    const uniqueUsers7d = new Set(
      events7d.map(e => e.user_email || e.anonymous_id).filter(Boolean)
    ).size;

    const uniqueUsers30d = new Set(
      eventsIn30.map(e => e.user_email || e.anonymous_id).filter(Boolean)
    ).size;

    const totalPlays = tracks.reduce((s, t) => s + (t.plays || 0), 0);
    const tipRevenueCents = tips.reduce((s, t) => s + (t.amount_cents || 0), 0);
    const liveNow = streams.filter(s => s.is_live).length;

    const artists = new Set(tracks.map(t => t.artist).filter(Boolean)).size;

    const topTracks = [...tracks]
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 10)
      .map(t => ({ id: t.id, title: t.title, artist: t.artist, plays: t.plays || 0, likes: t.likes || 0 }));

    const eventCounts = {};
    for (const e of events7d) {
      eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
    }

    return Response.json({
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
        pageViews7d: events7d.filter(e => e.event_name === 'page_view').length,
      },
      dailyActive: groupByDay(eventsIn30, 30),
      topTracks,
      eventCounts,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function toDateKey(iso) {
  return iso ? iso.slice(0, 10) : null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { days = 30 } = await req.json().catch(() => ({}));

    const [tracks, streams, tips, events] = await Promise.all([
      base44.entities.Track.filter({ created_by: user.email }, '-created_date', 100),
      base44.entities.LiveStream.filter({ created_by: user.email }, '-created_date', 100),
      base44.asServiceRole.entities.Tip.filter({ artist_email: user.email, status: 'completed' }, '-created_date', 200),
      base44.asServiceRole.entities.AnalyticsEvent.filter({ user_email: user.email }, '-created_date', 500),
    ]);

    const cutoff = daysAgo(days);
    const recentEvents = events.filter(e => new Date(e.created_date) >= cutoff);

    const playsByDay = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(cutoff);
      d.setDate(d.getDate() + i);
      playsByDay[toDateKey(d.toISOString())] = 0;
    }

    for (const e of recentEvents) {
      if (e.event_name === 'track_played') {
        const key = toDateKey(e.created_date);
        if (key && playsByDay[key] !== undefined) playsByDay[key] += 1;
      }
    }

    const totalPlays = tracks.reduce((s, t) => s + (t.plays || 0), 0);
    const totalLikes = tracks.reduce((s, t) => s + (t.likes || 0), 0);
    const tipEarnings = tips.reduce((s, t) => s + (t.amount_cents - (t.platform_fee_cents || 0)), 0);

    const topTracks = [...tracks]
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 5)
      .map(t => ({ id: t.id, title: t.title, plays: t.plays || 0, likes: t.likes || 0 }));

    return Response.json({
      overview: {
        totalTracks: tracks.length,
        totalPlays,
        totalLikes,
        totalStreams: streams.length,
        liveStreams: streams.filter(s => s.is_live).length,
        totalTips: tips.length,
        tipEarningsCents: tipEarnings,
        profileViews: recentEvents.filter(e => e.event_name === 'artist_profile_viewed').length,
      },
      playsByDay: Object.entries(playsByDay).map(([date, plays]) => ({ date, plays })),
      topTracks,
      recentTips: tips.slice(0, 5).map(t => ({
        amountCents: t.amount_cents,
        netCents: t.amount_cents - (t.platform_fee_cents || 0),
        date: t.created_date,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

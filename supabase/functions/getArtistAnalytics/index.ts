import { requireUser, getServiceClient, jsonResponse } from '../_shared/client.ts';

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function toDateKey(iso: string | null) {
  return iso ? iso.slice(0, 10) : null;
}

Deno.serve(async (req) => {
  try {
    const { user, supabase } = await requireUser(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { days = 30 } = await req.json().catch(() => ({}));
    const service = getServiceClient();

    const [tracksRes, streamsRes, tipsRes, eventsRes] = await Promise.all([
      supabase.from('tracks').select('*').eq('created_by', user.email).order('created_at', { ascending: false }).limit(100),
      supabase.from('live_streams').select('*').eq('created_by', user.email).order('created_at', { ascending: false }).limit(100),
      service.from('tips').select('*').eq('artist_email', user.email).eq('status', 'completed').order('created_at', { ascending: false }).limit(200),
      service.from('analytics_events').select('*').eq('user_email', user.email).order('created_at', { ascending: false }).limit(500),
    ]);

    const tracks = tracksRes.data || [];
    const streams = streamsRes.data || [];
    const tips = tipsRes.data || [];
    const events = eventsRes.data || [];

    const cutoff = daysAgo(days);
    const recentEvents = events.filter((e) => new Date(e.created_at) >= cutoff);

    const playsByDay: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(cutoff);
      d.setDate(d.getDate() + i);
      const key = toDateKey(d.toISOString());
      if (key) playsByDay[key] = 0;
    }

    for (const e of recentEvents) {
      if (e.event_name === 'track_played') {
        const key = toDateKey(e.created_at);
        if (key && playsByDay[key] !== undefined) playsByDay[key] += 1;
      }
    }

    const totalPlays = tracks.reduce((s, t) => s + (t.plays || 0), 0);
    const totalLikes = tracks.reduce((s, t) => s + (t.likes || 0), 0);
    const tipEarnings = tips.reduce((s, t) => s + (t.amount_cents - (t.platform_fee_cents || 0)), 0);

    const topTracks = [...tracks]
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 5)
      .map((t) => ({ id: t.id, title: t.title, plays: t.plays || 0, likes: t.likes || 0 }));

    return jsonResponse({
      overview: {
        totalTracks: tracks.length,
        totalPlays,
        totalLikes,
        totalStreams: streams.length,
        liveStreams: streams.filter((s) => s.is_live).length,
        totalTips: tips.length,
        tipEarningsCents: tipEarnings,
        profileViews: recentEvents.filter((e) => e.event_name === 'artist_profile_viewed').length,
      },
      playsByDay: Object.entries(playsByDay).map(([date, plays]) => ({ date, plays })),
      topTracks,
      recentTips: tips.slice(0, 5).map((t) => ({
        amountCents: t.amount_cents,
        netCents: t.amount_cents - (t.platform_fee_cents || 0),
        date: t.created_at,
      })),
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

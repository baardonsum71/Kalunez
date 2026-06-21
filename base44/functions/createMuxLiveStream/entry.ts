import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const MUX_API = 'https://api.mux.com/video/v1/live-streams';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, streamId } = await req.json();

    const tokenId = Deno.env.get('MUX_TOKEN_ID');
    const tokenSecret = Deno.env.get('MUX_TOKEN_SECRET');

    if (!tokenId || !tokenSecret) {
      return Response.json({ error: 'Mux not configured' }, { status: 503 });
    }

    const auth = btoa(`${tokenId}:${tokenSecret}`);

    const muxRes = await fetch(MUX_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        playback_policy: ['public'],
        new_asset_settings: {
          playback_policy: ['public'],
        },
        passthrough: streamId || title || '',
        reduced_latency: true,
      }),
    });

    if (!muxRes.ok) {
      const err = await muxRes.text();
      return Response.json({ error: `Mux API error: ${err}` }, { status: 502 });
    }

    const { data: liveStream } = await muxRes.json();
    const playbackId = liveStream.playback_ids?.[0]?.id;
    const streamKey = liveStream.stream_key;

    return Response.json({
      muxLiveStreamId: liveStream.id,
      muxPlaybackId: playbackId,
      streamKey,
      rtmpUrl: 'rtmps://global-live.mux.com:443/app',
      hlsUrl: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

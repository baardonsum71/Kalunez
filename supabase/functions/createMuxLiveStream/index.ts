import { requireUser, jsonResponse } from '../_shared/client.ts';

const MUX_API = 'https://api.mux.com/video/v1/live-streams';

Deno.serve(async (req) => {
  try {
    const { user } = await requireUser(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { title, streamId } = await req.json();

    const tokenId = Deno.env.get('MUX_TOKEN_ID');
    const tokenSecret = Deno.env.get('MUX_TOKEN_SECRET');

    if (!tokenId || !tokenSecret) {
      return jsonResponse({ error: 'Mux not configured' }, 503);
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
        new_asset_settings: { playback_policy: ['public'] },
        passthrough: streamId || title || '',
        reduced_latency: true,
      }),
    });

    if (!muxRes.ok) {
      const err = await muxRes.text();
      return jsonResponse({ error: `Mux API error: ${err}` }, 502);
    }

    const { data: liveStream } = await muxRes.json();
    const playbackId = liveStream.playback_ids?.[0]?.id;
    const streamKey = liveStream.stream_key;

    return jsonResponse({
      muxLiveStreamId: liveStream.id,
      muxPlaybackId: playbackId,
      streamKey,
      rtmpUrl: 'rtmps://global-live.mux.com:443/app',
      hlsUrl: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null,
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

import { AccessToken } from 'npm:livekit-server-sdk@2.15.4';
import { requireUser, jsonResponse } from '../_shared/client.ts';

Deno.serve(async (req) => {
  try {
    const { user, supabase } = await requireUser(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { roomName, role = 'viewer', streamId } = await req.json();
    if (!roomName) return jsonResponse({ error: 'Missing roomName' }, 400);

    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
    const livekitUrl = Deno.env.get('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !livekitUrl) {
      return jsonResponse({ error: 'LiveKit not configured' }, 503);
    }

    if (role === 'publisher' && streamId) {
      const { data: stream } = await supabase
        .from('live_streams')
        .select('id, room_name')
        .eq('id', streamId)
        .single();
      if (!stream || stream.room_name !== roomName) {
        return jsonResponse({ error: 'Stream not found' }, 404);
      }
    }

    const identity = user.email || user.id || `user-${Date.now()}`;
    const isPublisher = role === 'publisher';

    const at = new AccessToken(apiKey, apiSecret, {
      identity: isPublisher ? `host-${identity}` : `viewer-${identity}-${Date.now()}`,
      name: user.user_metadata?.full_name || user.email || identity,
      ttl: isPublisher ? '6h' : '2h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: isPublisher,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return jsonResponse({ token, url: livekitUrl, roomName, role });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

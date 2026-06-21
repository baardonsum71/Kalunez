import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { AccessToken } from 'npm:livekit-server-sdk@2.15.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomName, role = 'viewer', streamId } = await req.json();

    if (!roomName) {
      return Response.json({ error: 'Missing roomName' }, { status: 400 });
    }

    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
    const livekitUrl = Deno.env.get('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !livekitUrl) {
      return Response.json({ error: 'LiveKit not configured' }, { status: 503 });
    }

    if (role === 'publisher' && streamId) {
      const streams = await base44.entities.LiveStream.filter({ id: streamId }, '-created_date', 1);
      const stream = streams[0];
      if (!stream || stream.room_name !== roomName) {
        return Response.json({ error: 'Stream not found' }, { status: 404 });
      }
    }

    const identity = user.email || user.id || `user-${Date.now()}`;
    const isPublisher = role === 'publisher';

    const at = new AccessToken(apiKey, apiSecret, {
      identity: isPublisher ? `host-${identity}` : `viewer-${identity}-${Date.now()}`,
      name: user.full_name || user.email || identity,
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

    return Response.json({
      token,
      url: livekitUrl,
      roomName,
      role,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

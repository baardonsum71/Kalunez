import { RoomServiceClient } from 'npm:livekit-server-sdk@2.15.4';
import { requireUser, jsonResponse } from '../_shared/client.ts';

Deno.serve(async (req) => {
  try {
    const { user } = await requireUser(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { roomName } = await req.json();
    if (!roomName) return jsonResponse({ error: 'Missing roomName' }, 400);

    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
    const livekitUrl = Deno.env.get('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !livekitUrl) {
      return jsonResponse({ error: 'LiveKit not configured' }, 503);
    }

    const client = new RoomServiceClient(livekitUrl, apiKey, apiSecret);
    let viewerCount = 0;
    try {
      const participants = await client.listParticipants(roomName);
      viewerCount = participants.filter((p) => !p.identity.startsWith('host-')).length;
    } catch {
      viewerCount = 0;
    }

    return jsonResponse({ roomName, viewerCount });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

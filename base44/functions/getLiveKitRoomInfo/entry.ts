import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { RoomServiceClient } from 'npm:livekit-server-sdk@2.15.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { roomName } = await req.json();

    if (!roomName) {
      return Response.json({ error: 'Missing roomName' }, { status: 400 });
    }

    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
    const livekitUrl = Deno.env.get('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !livekitUrl) {
      return Response.json({ error: 'LiveKit not configured' }, { status: 503 });
    }

    const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret);

    try {
      const participants = await roomService.listParticipants(roomName);
      const viewers = participants.filter(p => !p.identity.startsWith('host-')).length;

      return Response.json({
        viewerCount: viewers,
        totalParticipants: participants.length,
        isActive: participants.length > 0,
      });
    } catch {
      return Response.json({ viewerCount: 0, totalParticipants: 0, isActive: false });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

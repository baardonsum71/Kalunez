import { base44 } from '@/api/base44Client';

export async function getLiveKitCredentials(roomName, role, streamId) {
  const result = await base44.functions.invoke('getLiveKitToken', {
    roomName,
    role,
    streamId,
  });
  return result;
}

export async function getLiveKitRoomInfo(roomName) {
  const result = await base44.functions.invoke('getLiveKitRoomInfo', { roomName });
  return result;
}

export async function createMuxStream(title, streamId) {
  const result = await base44.functions.invoke('createMuxLiveStream', {
    title,
    streamId,
  });
  return result;
}

export function generateRoomName() {
  return `kalunez-${crypto.randomUUID()}`;
}

export function getMuxHlsUrl(playbackId) {
  if (!playbackId) return null;
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function isLiveKitConfigured() {
  return !!import.meta.env.VITE_LIVEKIT_URL;
}

export function isMuxConfigured() {
  return import.meta.env.VITE_MUX_ENABLED === 'true';
}

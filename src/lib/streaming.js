import { supabase } from '@/api/supabaseClient';

async function invoke(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  return data;
}

export async function getLiveKitCredentials(roomName, role, streamId) {
  return invoke('getLiveKitToken', { roomName, role, streamId });
}

export async function getLiveKitRoomInfo(roomName) {
  return invoke('getLiveKitRoomInfo', { roomName });
}

export async function createMuxStream(title, streamId) {
  return invoke('createMuxLiveStream', { title, streamId });
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

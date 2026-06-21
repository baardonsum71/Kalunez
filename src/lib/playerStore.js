// Simple pub/sub singleton for the global music player state
import { AnalyticsEvents } from '@/lib/analytics';
const listeners = new Set();
let state = {
  track: null,      // { id, title, artist, audio_url, cover_url }
  playing: false,
  currentTime: 0,
  duration: 0,
};

export function getPlayerState() {
  return state;
}

export function setPlayerState(partial) {
  state = { ...state, ...partial };
  listeners.forEach(fn => fn(state));
}

export function subscribePlayer(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function playTrack(track) {
  setPlayerState({ track, playing: true, currentTime: 0, duration: 0 });
  AnalyticsEvents.trackPlayed(track);
}

export function togglePlay() {
  setPlayerState({ playing: !state.playing });
}
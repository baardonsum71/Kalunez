import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPlayerState,
  setPlayerState,
  subscribePlayer,
  playTrack,
  togglePlay,
} from './playerStore';

vi.mock('@/lib/analytics', () => ({
  AnalyticsEvents: { trackPlayed: vi.fn() },
}));

describe('playerStore', () => {
  beforeEach(() => {
    setPlayerState({ track: null, playing: false, currentTime: 0, duration: 0 });
  });

  it('starts with empty state', () => {
    expect(getPlayerState()).toEqual({
      track: null,
      playing: false,
      currentTime: 0,
      duration: 0,
    });
  });

  it('playTrack sets track and playing state', () => {
    const track = { id: '1', title: 'Test', artist: 'Artist', audio_url: '/a.mp3' };
    playTrack(track);

    const state = getPlayerState();
    expect(state.track).toEqual(track);
    expect(state.playing).toBe(true);
    expect(state.currentTime).toBe(0);
  });

  it('togglePlay flips playing boolean', () => {
    playTrack({ id: '1', title: 'T', artist: 'A' });
    togglePlay();
    expect(getPlayerState().playing).toBe(false);
    togglePlay();
    expect(getPlayerState().playing).toBe(true);
  });

  it('notifies subscribers on state change', () => {
    const listener = vi.fn();
    const unsub = subscribePlayer(listener);

    setPlayerState({ playing: true });
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ playing: true }));

    unsub();
    setPlayerState({ playing: false });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

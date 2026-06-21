import { describe, it, expect } from 'vitest';
import { generateRoomName, getMuxHlsUrl } from './streaming';

describe('streaming helpers', () => {
  it('generateRoomName returns kalunez-prefixed uuid', () => {
    const name = generateRoomName();
    expect(name).toMatch(/^kalunez-[0-9a-f-]{36}$/);
  });

  it('generateRoomName produces unique values', () => {
    expect(generateRoomName()).not.toBe(generateRoomName());
  });

  it('getMuxHlsUrl builds correct HLS URL', () => {
    expect(getMuxHlsUrl('abc123')).toBe('https://stream.mux.com/abc123.m3u8');
  });

  it('getMuxHlsUrl returns null without playback id', () => {
    expect(getMuxHlsUrl(null)).toBeNull();
    expect(getMuxHlsUrl('')).toBeNull();
  });
});

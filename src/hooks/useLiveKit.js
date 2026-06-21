import { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { getLiveKitCredentials } from '@/lib/streaming';

export function useLiveKitPublisher({ roomName, streamId, mediaStream, enabled, onError }) {
  const roomRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!enabled || !mediaStream) return;

    let cancelled = false;

    const run = async () => {
      setConnecting(true);
      try {
        const { token, url } = await getLiveKitCredentials(roomName, 'publisher', streamId);
        if (cancelled) return;

        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;
        room.on(RoomEvent.Disconnected, () => setConnected(false));
        await room.connect(url, token);

        const videoTrack = mediaStream.getVideoTracks()[0];
        const audioTrack = mediaStream.getAudioTracks()[0];
        if (videoTrack) await room.localParticipant.publishTrack(videoTrack, { name: 'camera' });
        if (audioTrack) await room.localParticipant.publishTrack(audioTrack, { name: 'microphone' });

        if (!cancelled) setConnected(true);
      } catch (err) {
        if (!cancelled) onError?.(err.message || 'Failed to connect to LiveKit');
      } finally {
        if (!cancelled) setConnecting(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      setConnected(false);
    };
  }, [enabled, mediaStream, roomName, streamId, onError]);

  return { connected, connecting };
}

export function useLiveKitViewer({ roomName, streamId, videoContainerRef, enabled, onViewerCount }) {
  const roomRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !roomName) return;

    let cancelled = false;
    const room = new Room({ adaptiveStream: true });

    const connect = async () => {
      try {
        const { token, url } = await getLiveKitCredentials(roomName, 'viewer', streamId);
        if (cancelled) return;

        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
            const el = track.attach();
            el.className = track.kind === Track.Kind.Video
              ? 'w-full h-full object-cover'
              : 'hidden';
            videoContainerRef.current?.appendChild(el);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          track.detach().forEach(el => el.remove());
        });

        room.on(RoomEvent.ParticipantConnected, () => {
          const viewers = room.remoteParticipants.size;
          onViewerCount?.(viewers);
        });

        room.on(RoomEvent.ParticipantDisconnected, () => {
          const viewers = room.remoteParticipants.size;
          onViewerCount?.(viewers);
        });

        await room.connect(url, token);
        if (!cancelled) setConnected(true);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to join stream');
      }
    };

    connect();

    return () => {
      cancelled = true;
      room.disconnect();
      roomRef.current = null;
      if (videoContainerRef.current) {
        videoContainerRef.current.innerHTML = '';
      }
    };
  }, [roomName, streamId, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { connected, error };
}

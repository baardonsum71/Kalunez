import { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { subscribePlayer, getPlayerState, setPlayerState, togglePlay } from '@/lib/playerStore';

async function lightHaptic() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Optional.
  }
}

export default function FloatingPlayer() {
  const [state, setState] = useState(getPlayerState());
  const audioRef = useRef(null);

  useEffect(() => subscribePlayer(setState), []);

  // Handle track changes
  useEffect(() => {
    if (!state.track?.audio_url) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = state.track.audio_url;
    audio.currentTime = 0;
    if (state.playing) audio.play().catch(() => {});
  }, [state.track?.id]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.track) return;
    if (state.playing) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [state.playing]);

  // Lock screen / Control Center (Media Session) — native-feel for Guideline 4.2
  useEffect(() => {
    if (!state.track || typeof navigator === 'undefined' || !navigator.mediaSession) return;

    const artwork = state.track.cover_url
      ? [{ src: state.track.cover_url, sizes: '512x512', type: 'image/jpeg' }]
      : [];

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: state.track.title || 'Kalunez',
        artist: state.track.artist || 'Kalunez',
        album: 'Kalunez',
        artwork,
      });
      navigator.mediaSession.playbackState = state.playing ? 'playing' : 'paused';
    } catch {
      // Media Session unsupported in this WebView build.
    }

    const audio = audioRef.current;

    try {
      navigator.mediaSession.setActionHandler('play', () => setPlayerState({ playing: true }));
      navigator.mediaSession.setActionHandler('pause', () => setPlayerState({ playing: false }));
      navigator.mediaSession.setActionHandler('stop', () => setPlayerState({ track: null, playing: false }));
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (!audio || details.seekTime == null) return;
        audio.currentTime = details.seekTime;
        setPlayerState({ currentTime: details.seekTime });
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (!audio) return;
        const offset = details.seekOffset || 10;
        audio.currentTime = Math.max(0, audio.currentTime - offset);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (!audio) return;
        const offset = details.seekOffset || 10;
        const max = audio.duration || Number.POSITIVE_INFINITY;
        audio.currentTime = Math.min(max, audio.currentTime + offset);
      });
    } catch {
      // Some handlers may be unsupported.
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('stop', null);
        navigator.mediaSession.setActionHandler('seekto', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      } catch {
        // ignore
      }
    };
  }, [state.track?.id, state.track?.title, state.track?.artist, state.track?.cover_url, state.playing]);

  useEffect(() => {
    if (!navigator.mediaSession || !state.duration) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: state.duration,
        playbackRate: 1,
        position: Math.min(state.currentTime || 0, state.duration),
      });
    } catch {
      // Position state may be unsupported.
    }
  }, [state.currentTime, state.duration]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setPlayerState({ currentTime: audio.currentTime, duration: audio.duration || 0 });
  };

  const handleEnded = () => setPlayerState({ playing: false, currentTime: 0 });

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !state.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * state.duration;
  };

  const close = () => setPlayerState({ track: null, playing: false });

  const onTogglePlay = async () => {
    await lightHaptic();
    togglePlay();
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!state.track) return null;

  const progress = state.duration ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div
          className="h-1 bg-white/10 cursor-pointer"
          onClick={handleSeek}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={state.duration || 0}
          aria-valuenow={state.currentTime || 0}
        >
          <div
            className="h-full gradient-bg transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-2 max-w-7xl mx-auto">
          <Link to={`/track/${state.track.id}`} className="shrink-0">
            <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden shrink-0 ring-1 ring-white/10">
              {state.track.cover_url ? (
                <img src={state.track.cover_url} alt={state.track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgba(200,245,66,0.15)] to-[rgba(255,45,149,0.2)]">
                  <Music className="w-4 h-4 text-white/50" />
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <Link to={`/track/${state.track.id}`} className="text-white text-sm font-semibold truncate block hover:text-[var(--lime)] transition-colors">
              {state.track.title}
            </Link>
            <p className="text-muted-foreground text-xs truncate">{state.track.artist}</p>
          </div>

          <span className="text-muted-foreground text-xs shrink-0 hidden sm:block">
            {fmt(state.currentTime)} / {fmt(state.duration)}
          </span>

          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={state.playing ? 'Pause' : 'Play'}
            className="w-9 h-9 gradient-bg rounded-full flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
          >
            {state.playing
              ? <Pause className="w-4 h-4" />
              : <Play className="w-4 h-4 ml-0.5" />
            }
          </button>

          <button
            type="button"
            onClick={close}
            aria-label="Close player"
            className="text-muted-foreground hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

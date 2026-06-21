import { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Music, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscribePlayer, getPlayerState, setPlayerState, togglePlay } from '@/lib/playerStore';

export default function FloatingPlayer() {
  const [state, setState] = useState(getPlayerState());
  const audioRef = useRef(null);
  const wasPlayingRef = useRef(false);

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
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Progress bar */}
        <div
          className="h-1 bg-secondary cursor-pointer"
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
          {/* Cover */}
          <Link to={`/track/${state.track.id}`} className="shrink-0">
            <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden shrink-0">
              {state.track.cover_url ? (
                <img src={state.track.cover_url} alt={state.track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-pink-900/30">
                  <Music className="w-4 h-4 text-purple-400/60" />
                </div>
              )}
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link to={`/track/${state.track.id}`} className="text-white text-sm font-semibold truncate block hover:text-purple-400 transition-colors">
              {state.track.title}
            </Link>
            <p className="text-muted-foreground text-xs truncate">{state.track.artist}</p>
          </div>

          {/* Time */}
          <span className="text-muted-foreground text-xs shrink-0 hidden sm:block">
            {fmt(state.currentTime)} / {fmt(state.duration)}
          </span>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={state.playing ? 'Pause' : 'Play'}
            className="w-9 h-9 gradient-bg rounded-full flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
          >
            {state.playing
              ? <Pause className="w-4 h-4 text-white" />
              : <Play className="w-4 h-4 text-white ml-0.5" />
            }
          </button>

          {/* Close */}
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
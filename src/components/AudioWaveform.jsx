import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

export default function AudioWaveform({ audioUrl, height = 120 }) {
  const containerRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#a855f7',
      progressColor: '#d946ef',
      cursorColor: '#ec4899',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: height,
      responsive: true,
      normalize: true,
    });

    ws.load(audioUrl);
    wsRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [audioUrl, height]);

  return (
    <div
      ref={containerRef}
      className="bg-secondary rounded-lg overflow-hidden border border-border"
      style={{ minHeight: `${height}px` }}
    />
  );
}
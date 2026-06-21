import { MessageSquare, X } from 'lucide-react';
import { useState } from 'react';

export default function WaveformFeedback({ duration, feedbacks = [], onAddFeedback, currentTime = 0, audioRef = null }) {
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState('');
  const [timestamp, setTimestamp] = useState(0);

  const handleAddFeedback = async () => {
    if (!note.trim()) return;
    await onAddFeedback(timestamp, note);
    setNote('');
    setShowForm(false);
  };

  const handleClickWaveform = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const time = Math.max(0, Math.min(duration, percent * duration));
    setTimestamp(time);
    if (audioRef?.current) audioRef.current.currentTime = time;
    setShowForm(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Waveform */}
      <div
        onClick={handleClickWaveform}
        className="relative h-24 bg-secondary rounded-lg border border-border cursor-pointer overflow-hidden hover:border-purple-500/50 transition-colors"
      >
        {/* Progress bar */}
        <div
          className="absolute top-0 left-0 h-full bg-purple-500/20 pointer-events-none"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />

        {/* Feedback markers */}
        {feedbacks.map((fb) => (
          <div
            key={fb.id}
            className="absolute top-1/2 -translate-y-1/2 w-1 h-full bg-pink-500/60 hover:bg-pink-500 transition-colors group cursor-pointer"
            style={{ left: `${(fb.timestamp_seconds / duration) * 100}%` }}
            title={`${fb.author_name}: ${fb.note}`}
          >
            <div className="hidden group-hover:block absolute left-0 top-full mt-2 bg-card border border-border rounded-lg p-2 whitespace-nowrap text-xs z-10">
              <p className="font-semibold text-pink-400">{fb.author_name}</p>
              <p className="text-muted-foreground">{formatTime(fb.timestamp_seconds)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {feedbacks.map((fb) => (
          <div key={fb.id} className="bg-secondary border border-border rounded-lg p-3">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-white font-semibold text-sm">{fb.author_name}</p>
                <p className="text-muted-foreground text-xs">{formatTime(fb.timestamp_seconds)}</p>
              </div>
              <span className="text-pink-400 text-xs font-semibold">●</span>
            </div>
            <p className="text-foreground text-sm">{fb.note}</p>
          </div>
        ))}
      </div>

      {/* Add feedback form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              Feedback at {formatTime(timestamp)}
            </p>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add your feedback..."
            className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500 resize-none mb-3"
            rows={3}
            autoFocus
          />
          <button
            onClick={handleAddFeedback}
            disabled={!note.trim()}
            className="gradient-bg text-white text-sm px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 w-full"
          >
            Add Feedback
          </button>
        </div>
      )}
    </div>
  );
}
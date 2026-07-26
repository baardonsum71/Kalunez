import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Users, Music } from 'lucide-react';

function StreamCard({ stream }) {
  return (
    <Link
      to={`/stream/${stream.id}`}
      className="card-lift block bg-card border border-white/10 rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-[var(--magenta)]/40"
    >
      <div className="relative aspect-video bg-secondary">
        {stream.thumbnail_url ? (
          <img
            src={stream.thumbnail_url}
            alt={stream.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgba(255,45,149,0.15)] to-black">
            <Music className="w-10 h-10 text-white/30" />
          </div>
        )}
        {stream.is_live && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[var(--magenta)] text-white text-xs font-bold px-2 py-0.5 rounded-md live-pulse uppercase tracking-wide">
            <Radio className="w-3 h-3" /> Live
          </div>
        )}
        {stream.category && (
          <span className="absolute top-2 right-2 bg-black/70 text-white/80 text-xs px-2 py-0.5 rounded-md">
            {stream.category}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate group-hover:text-[var(--lime)] transition-colors">{stream.title}</h3>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">{stream.artist}</p>
        <div className="flex items-center gap-1 mt-2 text-muted-foreground text-xs">
          <Users className="w-3.5 h-3.5" />
          {stream.viewer_count || 0} viewers
        </div>
      </div>
    </Link>
  );
}

export default memo(StreamCard);

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Users, Music } from 'lucide-react';

function StreamCard({ stream }) {
  return (
    <Link
      to={`/stream/${stream.id}`}
      className="block bg-card border border-border rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/30">
            <Music className="w-10 h-10 text-purple-400/50" />
          </div>
        )}
        {stream.is_live && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
            <Radio className="w-3 h-3" /> LIVE
          </div>
        )}
        {stream.category && (
          <span className="absolute top-2 right-2 bg-black/60 text-purple-300 text-xs px-2 py-0.5 rounded-full">
            {stream.category}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate group-hover:text-purple-300 transition-colors">{stream.title}</h3>
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

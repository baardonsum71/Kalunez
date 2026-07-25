import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, Music } from 'lucide-react';
import { formatTicketPrice } from '@/lib/revenuecat';

function EventCard({ event }) {
  const starts = event.starts_at ? new Date(event.starts_at) : null;
  const when = starts
    ? starts.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'TBA';

  return (
    <Link
      to={`/stream/${event.id}`}
      className="block bg-card border border-border rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group focus:outline-none focus:ring-2 focus:ring-purple-500/50"
    >
      <div className="relative aspect-video bg-secondary">
        {event.thumbnail_url ? (
          <img src={event.thumbnail_url} alt={event.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/30">
            <Music className="w-10 h-10 text-purple-400/50" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          <Calendar className="w-3 h-3" /> UPCOMING
        </div>
        {event.is_paid && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            <Ticket className="w-3 h-3" /> {formatTicketPrice(event.price_cents)}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate group-hover:text-purple-300 transition-colors">{event.title}</h3>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">{event.artist}</p>
        <p className="text-muted-foreground text-xs mt-2">{when}</p>
      </div>
    </Link>
  );
}

export default memo(EventCard);

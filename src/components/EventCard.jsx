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
      className="card-lift block bg-card border border-white/10 rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-[var(--lime)]/40"
    >
      <div className="relative aspect-video bg-secondary">
        {event.thumbnail_url ? (
          <img src={event.thumbnail_url} alt={event.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgba(200,245,66,0.1)] to-[rgba(255,45,149,0.15)]">
            <Music className="w-10 h-10 text-white/30" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 border border-[var(--lime)]/40 text-[var(--lime)] text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
          <Calendar className="w-3 h-3" /> Upcoming
        </div>
        {event.is_paid && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-[var(--magenta)] text-white text-xs font-bold px-2 py-0.5 rounded-md">
            <Ticket className="w-3 h-3" /> {formatTicketPrice(event.price_cents)}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate group-hover:text-[var(--lime)] transition-colors">{event.title}</h3>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">{event.artist}</p>
        <p className="text-muted-foreground text-xs mt-2">{when}</p>
      </div>
    </Link>
  );
}

export default memo(EventCard);

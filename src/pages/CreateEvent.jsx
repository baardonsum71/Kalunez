import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarPlus, Loader2, Ticket } from 'lucide-react';
import { createRow } from '@/lib/db';
import { useAuth } from '@/lib/AuthContext';
import MobileSelect from '@/components/MobileSelect';
import { TICKET_PRICES } from '@/lib/revenuecat';
import { toast } from '@/components/ui/use-toast';

const CATEGORIES = ['Music', 'Electronic', 'Hip Hop', 'Rock', 'Jazz'];

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function CreateEvent() {
  const { user, navigateToLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    artist: user?.artist_name || user?.full_name || '',
    category: 'Music',
    description: '',
    starts_at: toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
    is_paid: false,
    ticket_product_id: 'event_ticket_99',
  });

  if (!user) {
    return (
      <div className="hero-gradient min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <CalendarPlus className="w-12 h-12 text-purple-400 opacity-50" />
        <p className="text-white text-xl font-semibold">Sign in to create an event</p>
        <button type="button" onClick={() => navigateToLogin()} className="gradient-bg text-white px-6 py-3 rounded-xl font-bold">
          Sign In
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.artist.trim() || !form.starts_at) {
      setError('Title, artist, and start time are required.');
      return;
    }
    const startsAt = new Date(form.starts_at);
    if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() < Date.now() - 60_000) {
      setError('Start time must be in the future.');
      return;
    }

    const ticket = form.is_paid ? TICKET_PRICES.find((t) => t.id === form.ticket_product_id) : null;
    if (form.is_paid && !ticket) {
      setError('Choose a ticket price.');
      return;
    }

    setLoading(true);
    try {
      const record = await createRow('live_streams', {
        title: form.title.trim(),
        artist: form.artist.trim(),
        category: form.category,
        description: form.description.trim() || null,
        stream_type: 'Video',
        is_live: false,
        status: 'scheduled',
        starts_at: startsAt.toISOString(),
        is_paid: form.is_paid,
        price_cents: ticket?.price_cents || 0,
        ticket_product_id: ticket?.id || null,
        viewer_count: 0,
        reaction_count: 0,
        created_by: user.email,
      });
      toast({
        title: 'Event published',
        description: form.is_paid ? 'Fans can buy tickets from the Live page.' : 'Fans can find it under Upcoming.',
      });
      navigate(`/stream/${record.id}`);
    } catch (err) {
      setError(err.message || 'Could not create event. Run migration 0002_ticketed_events.sql in Supabase first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-gradient min-h-screen px-4 pt-[calc(2.5rem+var(--safe-top))] pb-[calc(6rem+var(--safe-bottom))]">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
          <CalendarPlus className="w-7 h-7 text-purple-400" /> Create Event
        </h1>
        <p className="text-muted-foreground mb-8">
          Schedule a concert. Keep it free, or set one ticket price. Instant Go Live still works as before.
        </p>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Event title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Living Room Acoustic Night"
              className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Artist name *</label>
            <input
              value={form.artist}
              onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))}
              className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Category</label>
              <MobileSelect value={form.category} onValueChange={(category) => setForm((f) => ({ ...f, category }))} options={CATEGORIES} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Starts at *</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="What fans can expect…"
              className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
            <p className="text-white text-sm font-semibold flex items-center gap-2">
              <Ticket className="w-4 h-4 text-yellow-400" /> Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_paid: false }))}
                className={`rounded-xl border px-3 py-3 text-left text-sm transition-all ${
                  !form.is_paid ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-border text-muted-foreground'
                }`}
              >
                <span className="font-semibold block">Free live</span>
                <span className="text-xs opacity-80">Anyone can watch</span>
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_paid: true }))}
                className={`rounded-xl border px-3 py-3 text-left text-sm transition-all ${
                  form.is_paid ? 'border-yellow-500 bg-yellow-500/10 text-white' : 'border-border text-muted-foreground'
                }`}
              >
                <span className="font-semibold block">Paid ticket</span>
                <span className="text-xs opacity-80">One price per event</span>
              </button>
            </div>
            {form.is_paid && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {TICKET_PRICES.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, ticket_product_id: tier.id }))}
                    className={`rounded-lg border py-2 text-sm font-bold transition-all ${
                      form.ticket_product_id === tier.id
                        ? 'border-yellow-400 bg-yellow-500 text-black'
                        : 'border-border text-foreground hover:border-yellow-500/50'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-bg text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarPlus className="w-5 h-5" />}
            Publish Event
          </button>

          <p className="text-center text-muted-foreground text-xs">
            Prefer to stream right now?{' '}
            <Link to="/go-live" className="text-purple-400 hover:underline">
              Go Live free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

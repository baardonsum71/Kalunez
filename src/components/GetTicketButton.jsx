import { useState } from 'react';
import { Loader2, Lock, Ticket } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { purchaseEventTicket, formatTicketPrice } from '@/lib/revenuecat';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function GetTicketButton({ event, onPurchased }) {
  const { user, navigateToLogin } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (!user) {
      navigateToLogin();
      return;
    }
    if (!event?.ticket_product_id && !event?.price_cents) {
      toast({ title: 'Ticket not configured', description: 'This event has no ticket price.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await purchaseEventTicket(event.id, event.ticket_product_id, event.price_cents);
      await queryClient.invalidateQueries({ queryKey: ['ticket', event.id, user.email] });
      toast({ title: "You're in!", description: 'Ticket purchased. Join when the concert starts.' });
      onPurchased?.();
    } catch (err) {
      toast({ title: 'Purchase failed', description: err.message || 'Could not buy ticket', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBuy}
      disabled={loading}
      className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-3 rounded-xl transition-colors disabled:opacity-50 w-full sm:w-auto"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
      Get Ticket · {formatTicketPrice(event.price_cents)}
    </button>
  );
}

export function TicketLockedOverlay({ event }) {
  return (
    <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-purple-950/80 to-black px-6 text-center gap-3">
      <Lock className="w-12 h-12 text-yellow-400/80" />
      <p className="text-white font-semibold text-lg">Ticket required</p>
      <p className="text-muted-foreground text-sm max-w-sm">
        Buy a ticket to unlock this concert when it goes live. Tips still work after you join.
      </p>
      <GetTicketButton event={event} />
    </div>
  );
}

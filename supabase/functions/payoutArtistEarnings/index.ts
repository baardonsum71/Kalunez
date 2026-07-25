// Pays out an artist's accumulated tip earnings via Stripe Connect Transfer.
// Server-initiated only — the buyer already paid through RevenueCat/IAP;
// this just moves the platform's own funds to the artist's Connect account.
// Call this on a schedule (e.g. Supabase cron) or manually per artist.
import Stripe from 'npm:stripe@14.0.0';
import { requireUser, getServiceClient, jsonResponse } from '../_shared/client.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') ?? '');

Deno.serve(async (req) => {
  try {
    const { user } = await requireUser(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const service = getServiceClient();

    // Only admins can trigger payouts (platform-run job), or an artist can
    // request payout of their own pending balance.
    const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single();
    const { artistEmail } = await req.json().catch(() => ({}));
    const targetEmail = profile?.role === 'admin' && artistEmail ? artistEmail : user.email;

    const { data: account } = await service
      .from('artist_accounts')
      .select('*')
      .eq('user_email', targetEmail)
      .single();

    if (!account?.stripe_connect_account_id) {
      return jsonResponse({ error: 'No payout account on file' }, 400);
    }
    if (!account.charges_enabled || !account.payouts_enabled) {
      return jsonResponse({ error: 'Stripe Connect onboarding incomplete' }, 400);
    }
    if (!account.pending_earnings_cents || account.pending_earnings_cents <= 0) {
      return jsonResponse({ error: 'Nothing to pay out' }, 400);
    }

    const amount = account.pending_earnings_cents;

    const transfer = await stripe.transfers.create({
      amount,
      currency: 'usd',
      destination: account.stripe_connect_account_id,
      metadata: { artist_email: targetEmail },
    });

    await service
      .from('artist_accounts')
      .update({
        pending_earnings_cents: 0,
        total_earnings_cents: (account.total_earnings_cents || 0) + amount,
      })
      .eq('id', account.id);

    return jsonResponse({ transferId: transfer.id, amountCents: amount });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

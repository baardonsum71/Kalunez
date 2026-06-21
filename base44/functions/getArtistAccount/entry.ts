import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const { type = 'status' } = body;

    const accounts = await base44.entities.ArtistAccount.filter({ user_email: user.email }, '-created_date', 1);
    const artistAccount = accounts[0];

    if (type === 'dashboard' && artistAccount?.stripe_connect_account_id) {
      const loginLink = await stripe.accounts.createLoginLink(artistAccount.stripe_connect_account_id);
      return Response.json({ url: loginLink.url });
    }

    if (!artistAccount?.stripe_connect_account_id) {
      return Response.json({ connected: false, account: null });
    }

    const stripeAccount = await stripe.accounts.retrieve(artistAccount.stripe_connect_account_id);
    const updated = {
      charges_enabled: stripeAccount.charges_enabled ?? false,
      payouts_enabled: stripeAccount.payouts_enabled ?? false,
      details_submitted: stripeAccount.details_submitted ?? false,
    };

    await base44.entities.ArtistAccount.update(artistAccount.id, updated);

    const tips = await base44.asServiceRole.entities.Tip.filter(
      { artist_email: user.email, status: 'completed' },
      '-created_date',
      500
    );
    const totalEarnings = tips.reduce(
      (sum, t) => sum + (t.amount_cents - (t.platform_fee_cents || 0)),
      0
    );

    return Response.json({
      connected: true,
      account: { ...artistAccount, ...updated, total_earnings_cents: totalEarnings },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

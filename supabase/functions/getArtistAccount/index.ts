import Stripe from 'npm:stripe@14.0.0';
import { requireUser, getServiceClient, jsonResponse } from '../_shared/client.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') ?? '');

Deno.serve(async (req) => {
  try {
    const { user } = await requireUser(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const { type = 'status' } = body;

    const service = getServiceClient();
    const { data: artistAccount } = await service
      .from('artist_accounts')
      .select('*')
      .eq('user_email', user.email)
      .single();

    if (type === 'dashboard' && artistAccount?.stripe_connect_account_id) {
      const loginLink = await stripe.accounts.createLoginLink(artistAccount.stripe_connect_account_id);
      return jsonResponse({ url: loginLink.url });
    }

    if (!artistAccount?.stripe_connect_account_id) {
      return jsonResponse({ connected: false, account: null });
    }

    const stripeAccount = await stripe.accounts.retrieve(artistAccount.stripe_connect_account_id);
    const updated = {
      charges_enabled: stripeAccount.charges_enabled ?? false,
      payouts_enabled: stripeAccount.payouts_enabled ?? false,
      details_submitted: stripeAccount.details_submitted ?? false,
    };

    await service.from('artist_accounts').update(updated).eq('id', artistAccount.id);

    const { data: tips } = await service
      .from('tips')
      .select('amount_cents, platform_fee_cents')
      .eq('artist_email', user.email)
      .eq('status', 'completed')
      .limit(500);

    const totalEarnings = (tips || []).reduce(
      (sum, t) => sum + (t.amount_cents - (t.platform_fee_cents || 0)),
      0,
    );

    return jsonResponse({
      connected: true,
      account: { ...artistAccount, ...updated, total_earnings_cents: totalEarnings },
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

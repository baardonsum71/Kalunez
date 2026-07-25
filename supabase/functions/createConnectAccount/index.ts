// Sets up a Stripe Connect Express account so an artist can RECEIVE payouts.
// This is not a buyer-facing checkout — buyers pay via RevenueCat/IAP; the
// platform pays artists out separately using this Connect account (see
// payoutArtistEarnings). Kept Apple-compliant: the buyer never touches Stripe.
import Stripe from 'npm:stripe@14.0.0';
import { requireUser, getServiceClient, jsonResponse } from '../_shared/client.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') ?? '');

function getAppUrl() {
  return Deno.env.get('APP_URL') || 'https://www.kalunez.com';
}

Deno.serve(async (req) => {
  try {
    const { user } = await requireUser(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { artistName, country = 'NO' } = await req.json();
    if (!artistName?.trim()) return jsonResponse({ error: 'Missing artistName' }, 400);

    const trimmedName = artistName.trim();
    const appUrl = getAppUrl();
    const service = getServiceClient();

    const { data: existing } = await service
      .from('artist_accounts')
      .select('*')
      .eq('user_email', user.email)
      .single();

    let artistAccount = existing;
    let connectAccountId = artistAccount?.stripe_connect_account_id;

    if (!connectAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country,
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { user_email: user.email ?? '', artist_name: trimmedName },
      });

      connectAccountId = account.id;

      if (artistAccount) {
        await service
          .from('artist_accounts')
          .update({ artist_name: trimmedName, stripe_connect_account_id: connectAccountId })
          .eq('id', artistAccount.id);
      } else {
        const { data: created } = await service
          .from('artist_accounts')
          .insert({
            user_email: user.email,
            artist_name: trimmedName,
            stripe_connect_account_id: connectAccountId,
            charges_enabled: false,
            payouts_enabled: false,
            details_submitted: false,
            total_earnings_cents: 0,
            pending_earnings_cents: 0,
          })
          .select()
          .single();
        artistAccount = created;
      }

      await service.from('profiles').update({ artist_name: trimmedName }).eq('id', user.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: connectAccountId,
      refresh_url: `${appUrl}/artist-dashboard?connect=refresh`,
      return_url: `${appUrl}/artist-dashboard?connect=success`,
      type: 'account_onboarding',
    });

    return jsonResponse({ url: accountLink.url, accountId: connectAccountId, artistName: trimmedName });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

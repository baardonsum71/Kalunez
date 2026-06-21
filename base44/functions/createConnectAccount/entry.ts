import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));

function getAppUrl() {
  return Deno.env.get('BASE44_APP_URL') || 'http://localhost:5173';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { artistName, country = 'NO' } = await req.json();

    if (!artistName?.trim()) {
      return Response.json({ error: 'Missing artistName' }, { status: 400 });
    }

    const trimmedName = artistName.trim();
    const appUrl = getAppUrl();

    let accounts = await base44.entities.ArtistAccount.filter({ user_email: user.email }, '-created_date', 1);
    let artistAccount = accounts[0];
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
        metadata: {
          user_email: user.email,
          artist_name: trimmedName,
        },
      });

      connectAccountId = account.id;

      if (artistAccount) {
        await base44.entities.ArtistAccount.update(artistAccount.id, {
          artist_name: trimmedName,
          stripe_connect_account_id: connectAccountId,
        });
      } else {
        artistAccount = await base44.entities.ArtistAccount.create({
          user_email: user.email,
          artist_name: trimmedName,
          stripe_connect_account_id: connectAccountId,
          charges_enabled: false,
          payouts_enabled: false,
          details_submitted: false,
          total_earnings_cents: 0,
          pending_earnings_cents: 0,
        });
      }

      await base44.asServiceRole.auth.updateUser(user.email, { artist_name: trimmedName });
    }

    const accountLink = await stripe.accountLinks.create({
      account: connectAccountId,
      refresh_url: `${appUrl}/artist-dashboard?connect=refresh`,
      return_url: `${appUrl}/artist-dashboard?connect=success`,
      type: 'account_onboarding',
    });

    return Response.json({
      url: accountLink.url,
      accountId: connectAccountId,
      artistName: trimmedName,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));

function getAppUrl() {
  return Deno.env.get('BASE44_APP_URL') || 'http://localhost:5173';
}

function getPlatformFeePercent() {
  return parseInt(Deno.env.get('STRIPE_PLATFORM_FEE_PERCENT') || '10', 10);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { artistName, amount, currency = 'usd', message = '', returnUrl = '/' } = await req.json();

    if (!artistName || !amount) {
      return Response.json({ error: 'Missing artistName or amount' }, { status: 400 });
    }

    const amountCents = Math.round(Number(amount) * 100);
    if (amountCents < 100 || amountCents > 100000) {
      return Response.json({ error: 'Amount must be between $1 and $1000' }, { status: 400 });
    }

    const accounts = await base44.entities.ArtistAccount.filter({ artist_name: artistName }, '-created_date', 1);
    const artistAccount = accounts[0];

    if (!artistAccount?.stripe_connect_account_id) {
      return Response.json({ error: 'This artist has not set up payouts yet' }, { status: 400 });
    }

    if (!artistAccount.charges_enabled) {
      return Response.json({ error: 'This artist is still completing Stripe onboarding' }, { status: 400 });
    }

    const platformFeeCents = Math.round(amountCents * (getPlatformFeePercent() / 100));
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: `Tip for ${artistName}`,
            description: message || `Support ${artistName} on Kalunez`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: artistAccount.stripe_connect_account_id,
        },
        metadata: {
          type: 'tip',
          artist_name: artistName,
          tipper_email: user.email,
        },
      },
      metadata: {
        type: 'tip',
        artist_name: artistName,
        artist_email: artistAccount.user_email,
        tipper_email: user.email,
        amount_cents: String(amountCents),
        platform_fee_cents: String(platformFeeCents),
        message,
      },
      success_url: `${appUrl}${returnUrl}${returnUrl.includes('?') ? '&' : '?'}tip=success`,
      cancel_url: `${appUrl}${returnUrl}${returnUrl.includes('?') ? '&' : '?'}tip=canceled`,
    });

    await base44.entities.Tip.create({
      tipper_email: user.email,
      artist_name: artistName,
      artist_email: artistAccount.user_email,
      amount_cents: amountCents,
      currency,
      platform_fee_cents: platformFeeCents,
      stripe_checkout_session_id: session.id,
      status: 'pending',
      message,
    });

    return Response.json({ sessionId: session.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

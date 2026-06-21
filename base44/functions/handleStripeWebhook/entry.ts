import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

async function syncSubscription(base44, subscription) {
  const userEmail =
    subscription.metadata?.user_email ||
    (typeof subscription.customer === 'object' ? subscription.customer?.metadata?.user_email : null);

  if (!userEmail) return;

  const price = subscription.items.data[0]?.price;
  const tier = price?.metadata?.tier || 'pro';
  const priceId = price?.id;

  const existing = await base44.asServiceRole.entities.Subscription.filter(
    { user_email: userEmail },
    '-created_date',
    1
  );

  const data = {
    tier,
    status: subscription.status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
    stripe_price_id: priceId,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
  };

  if (existing.length > 0) {
    await base44.asServiceRole.entities.Subscription.update(existing[0].id, data);
  } else {
    await base44.asServiceRole.entities.Subscription.create({ user_email: userEmail, ...data });
  }

  const activeTier = ['active', 'trialing'].includes(subscription.status) ? tier : 'free';
  await base44.asServiceRole.auth.updateUser(userEmail, { subscription_tier: activeTier });
}

async function handleTipCompleted(base44, session) {
  const { artist_name, artist_email, tipper_email, amount_cents, platform_fee_cents } = session.metadata || {};

  if (!artist_name || !amount_cents) return;

  const pendingTips = await base44.asServiceRole.entities.Tip.filter(
    { stripe_checkout_session_id: session.id },
    '-created_date',
    1
  );

  const tipData = {
    status: 'completed',
    stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
  };

  if (pendingTips.length > 0) {
    await base44.asServiceRole.entities.Tip.update(pendingTips[0].id, tipData);
  } else {
    await base44.asServiceRole.entities.Tip.create({
      tipper_email: tipper_email || 'anonymous',
      artist_name,
      artist_email,
      amount_cents: parseInt(amount_cents, 10),
      platform_fee_cents: parseInt(platform_fee_cents || '0', 10),
      stripe_checkout_session_id: session.id,
      ...tipData,
    });
  }

  if (artist_email) {
    const accounts = await base44.asServiceRole.entities.ArtistAccount.filter(
      { user_email: artist_email },
      '-created_date',
      1
    );
    if (accounts.length > 0) {
      const net = parseInt(amount_cents, 10) - parseInt(platform_fee_cents || '0', 10);
      await base44.asServiceRole.entities.ArtistAccount.update(accounts[0].id, {
        total_earnings_cents: (accounts[0].total_earnings_cents || 0) + net,
      });
    }
  }
}

async function syncConnectAccount(base44, account) {
  const userEmail = account.metadata?.user_email;
  if (!userEmail) return;

  const accounts = await base44.asServiceRole.entities.ArtistAccount.filter(
    { user_email: userEmail },
    '-created_date',
    1
  );

  if (accounts.length === 0) return;

  await base44.asServiceRole.entities.ArtistAccount.update(accounts[0].id, {
    charges_enabled: account.charges_enabled ?? false,
    payouts_enabled: account.payouts_enabled ?? false,
    details_submitted: account.details_submitted ?? false,
  });
}

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!signature || !webhookSecret) {
      return Response.json({ error: 'Missing webhook signature or secret' }, { status: 400 });
    }

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    const base44 = createClientFromRequest(req);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.metadata?.type === 'tip') {
          await handleTipCompleted(base44, session);
        }
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await syncSubscription(base44, subscription);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await syncSubscription(base44, event.data.object);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userEmail = subscription.metadata?.user_email;
        if (userEmail) {
          const existing = await base44.asServiceRole.entities.Subscription.filter(
            { user_email: userEmail },
            '-created_date',
            1
          );
          if (existing.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: 'canceled' });
          }
          await base44.asServiceRole.auth.updateUser(userEmail, { subscription_tier: 'free' });
        }
        break;
      }

      case 'account.updated': {
        await syncConnectAccount(base44, event.data.object);
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

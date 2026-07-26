// Receives RevenueCat webhook events and syncs subscriptions/tips.
// Configure in RevenueCat: Project > Integrations > Webhooks
//   URL: https://<project-ref>.functions.supabase.co/handleRevenueCatWebhook
//   Authorization header value must match REVENUECAT_WEBHOOK_AUTH below.
import { getServiceClient, jsonResponse } from '../_shared/client.ts';

// Map RevenueCat product identifiers to Kalunez subscription tiers.
// Keep in sync with src/lib/revenuecat.js SUBSCRIPTION_PLANS.
const PRODUCT_TIER_MAP: Record<string, string> = {
  pro_monthly: 'pro',
  pro_monthly_subscription: 'pro',
  premium_monthly: 'premium',
  premium_monthly_subscription: 'premium',
  premium_podcast_monthly: 'premium_podcast',
  premium_yearly: 'premium',
  premium_podcast_yearly: 'premium_podcast',
};

const TIP_PRODUCT_PREFIX = 'tip_credit';
const TICKET_PRODUCT_PREFIX = 'event_ticket';

function tierForProduct(productId: string): string {
  return PRODUCT_TIER_MAP[productId] || 'pro';
}

async function upsertSubscription(service: ReturnType<typeof getServiceClient>, event: any) {
  const userEmail: string | undefined = event.app_user_id?.includes('@') ? event.app_user_id : event.subscriber_attributes?.['$email']?.value;
  if (!userEmail) return;

  const productId = event.product_id || '';
  const tier = tierForProduct(productId);
  const isActive = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE'].includes(event.type);
  const isEnding = ['CANCELLATION', 'EXPIRATION'].includes(event.type);

  const { data: existing } = await service
    .from('subscriptions')
    .select('id')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const data = {
    tier,
    status: isEnding ? (event.type === 'EXPIRATION' ? 'expired' : 'canceled') : 'active',
    revenuecat_app_user_id: event.app_user_id,
    revenuecat_product_id: productId,
    current_period_end: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
    cancel_at_period_end: event.type === 'CANCELLATION',
  };

  if (existing) {
    await service.from('subscriptions').update(data).eq('id', existing.id);
  } else {
    await service.from('subscriptions').insert({ user_email: userEmail, ...data });
  }

  const activeTier = isActive ? tier : 'free';
  await service.from('profiles').update({ subscription_tier: activeTier }).eq('email', userEmail);
}

async function handleTipPurchase(service: ReturnType<typeof getServiceClient>, event: any) {
  const tipperEmail: string | undefined = event.app_user_id?.includes('@') ? event.app_user_id : undefined;
  const artistName: string | undefined = event.subscriber_attributes?.artistName?.value;
  const amountCents = Math.round((event.price_in_purchased_currency || event.price || 0) * 100);

  if (!artistName || !amountCents) return;

  const { data: artistAccount } = await service
    .from('artist_accounts')
    .select('*')
    .eq('artist_name', artistName)
    .maybeSingle();

  const platformFeeCents = Math.round(amountCents * 0.1);

  await service.from('tips').insert({
    tipper_email: tipperEmail || 'anonymous',
    artist_name: artistName,
    artist_email: artistAccount?.user_email,
    amount_cents: amountCents,
    platform_fee_cents: platformFeeCents,
    revenuecat_transaction_id: event.id || event.transaction_id,
    status: 'completed',
  });

  if (artistAccount) {
    const net = amountCents - platformFeeCents;
    await service
      .from('artist_accounts')
      .update({ pending_earnings_cents: (artistAccount.pending_earnings_cents || 0) + net })
      .eq('id', artistAccount.id);
  }
}

async function handleTicketPurchase(service: ReturnType<typeof getServiceClient>, event: any) {
  const userEmail: string | undefined =
    event.app_user_id?.includes('@') ? event.app_user_id : event.subscriber_attributes?.['$email']?.value;
  const eventId: string | undefined = event.subscriber_attributes?.eventId?.value;
  const productId: string = event.product_id || '';
  const amountCents = Math.round((event.price_in_purchased_currency || event.price || 0) * 100);

  if (!userEmail || !eventId) return;

  const { data: existing } = await service
    .from('tickets')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_email', userEmail)
    .maybeSingle();

  if (existing) return;

  await service.from('tickets').insert({
    event_id: eventId,
    user_email: userEmail,
    amount_cents: amountCents || 0,
    ticket_product_id: productId,
    revenuecat_transaction_id: event.id || event.transaction_id,
  });
}

Deno.serve(async (req) => {
  try {
    const expectedAuth = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');
    const receivedAuth = req.headers.get('Authorization');
    if (expectedAuth && receivedAuth !== expectedAuth) {
      return jsonResponse({ error: 'Invalid webhook signature' }, 401);
    }

    const body = await req.json();
    const event = body?.event;
    if (!event) return jsonResponse({ error: 'Missing event' }, 400);

    const service = getServiceClient();
    const productId: string = event.product_id || '';

    if (productId.startsWith(TIP_PRODUCT_PREFIX) && event.type === 'NON_RENEWING_PURCHASE') {
      await handleTipPurchase(service, event);
    } else if (productId.startsWith(TICKET_PRODUCT_PREFIX) && event.type === 'NON_RENEWING_PURCHASE') {
      await handleTicketPurchase(service, event);
    } else if (
      ['INITIAL_PURCHASE', 'RENEWAL', 'CANCELLATION', 'EXPIRATION', 'UNCANCELLATION', 'PRODUCT_CHANGE'].includes(event.type)
    ) {
      await upsertSubscription(service, event);
    }

    return jsonResponse({ received: true });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

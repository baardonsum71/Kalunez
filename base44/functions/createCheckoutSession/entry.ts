import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));

function getAllowedPrices(): Set<string> {
  const raw = Deno.env.get('STRIPE_ALLOWED_PRICES') || '';
  return new Set(raw.split(',').map(p => p.trim()).filter(Boolean));
}

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

    const { priceId, successPath = '/subscription?success=true', cancelPath = '/subscription?canceled=true' } = await req.json();

    if (!priceId) {
      return Response.json({ error: 'Missing priceId' }, { status: 400 });
    }

    const allowed = getAllowedPrices();
    if (allowed.size > 0 && !allowed.has(priceId)) {
      return Response.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    let customerId = null;
    const existing = await base44.entities.Subscription.filter({ user_email: user.email }, '-created_date', 1);

    if (existing.length > 0 && existing[0].stripe_customer_id) {
      customerId = existing[0].stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || user.email,
        metadata: { user_email: user.email },
      });
      customerId = customer.id;
    }

    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${appUrl}${successPath}`,
      cancel_url: `${appUrl}${cancelPath}`,
      metadata: {
        user_email: user.email,
        type: 'subscription',
      },
      subscription_data: {
        metadata: {
          user_email: user.email,
        },
      },
    });

    return Response.json({ sessionId: session.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';
import Stripe from 'npm:stripe@14.0.0';

function getStripe() {
  const apiKey = Deno.env.get('STRIPE_API_KEY');
  if (!apiKey) {
    throw new Error('STRIPE_API_KEY is missing. Add sk_test_... in Base44 → Secrets.');
  }
  if (apiKey.startsWith('pk_')) {
    throw new Error('STRIPE_API_KEY must be sk_test_... (secret key), not pk_test_...');
  }
  return new Stripe(apiKey);
}

function getAllowedPrices(): Set<string> {
  const raw = Deno.env.get('STRIPE_ALLOWED_PRICES') || '';
  return new Set(raw.split(',').map(p => p.trim()).filter(Boolean));
}

function getAppUrl() {
  return Deno.env.get('BASE44_APP_URL') || 'http://localhost:5173';
}

function fail(message: string, status = 500) {
  return Response.json({ message, error: message }, { status });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.email) {
      return fail('Your account has no email address. Log out and sign in again.', 400);
    }

    const { priceId, successPath = '/subscription?success=true', cancelPath = '/subscription?canceled=true' } = await req.json();

    if (!priceId) {
      return fail('Missing priceId', 400);
    }

    const allowed = getAllowedPrices();
    if (allowed.size > 0 && !allowed.has(priceId)) {
      return fail(`Price not allowed. Add "${priceId}" to STRIPE_ALLOWED_PRICES in Base44 Secrets.`, 400);
    }

    const stripe = getStripe();
    let customerId: string | null = null;

    try {
      const existing = await base44.entities.Subscription.filter({ user_email: user.email }, '-created_date', 1);
      if (existing.length > 0 && existing[0].stripe_customer_id) {
        customerId = existing[0].stripe_customer_id;
      }
    } catch {
      // Subscription entity may not exist yet — checkout still works via customer_email.
    }

    const appUrl = getAppUrl().replace(/\/$/, '');
    const sessionParams = {
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
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return Response.json({ sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return fail(message, 500);
  }
});

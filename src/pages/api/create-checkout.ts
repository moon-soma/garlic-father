import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { shippingFor } from '../../lib/shipping';

interface IncomingItem {
  name: string;
  price: number;   // unit price in cents
  image?: string;
  quantity: number;
}

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
  }

  const stripe = new Stripe(secret);
  const body = await request.json();
  const items: IncomingItem[] = Array.isArray(body?.items) ? body.items : [];

  const valid = items.every(
    (i) =>
      i &&
      typeof i.name === 'string' &&
      typeof i.price === 'number' &&
      i.price > 0 &&
      typeof i.quantity === 'number' &&
      i.quantity > 0
  );

  if (!items.length || !valid) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  const origin = request.headers.get('origin') || 'https://www.thegarlicfather.com';

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map((i) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: i.name,
          images: i.image ? [`${origin}${i.image}`] : [],
        },
        unit_amount: i.price,
      },
      quantity: i.quantity,
    })),
    mode: 'payment',
    shipping_address_collection: { allowed_countries: ['US', 'CA'] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: shipping, currency: 'usd' },
          display_name: shipping === 0 ? 'Free Shipping' : 'Standard Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 10 },
          },
        },
      },
    ],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import ProcessedWebhookEvent from '@/lib/models/ProcessedWebhookEvent';

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const rawBody = await req.text(); // raw string, NOT req.json() — signature needs the exact bytes
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await dbConnect();

  // Idempotency check
  const existing = await ProcessedWebhookEvent.findOne({ stripeEventId: event.id });
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await processStripeEvent(event);
    await ProcessedWebhookEvent.create({ stripeEventId: event.id });
  } catch (err) {
    console.error('Error processing webhook event:', err);
    // Still return 200 — Stripe doesn't need to retry on our internal error,
    // log this for manual review instead
  }

  return NextResponse.json({ received: true });
}

async function processStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      await User.findByIdAndUpdate(userId, {
        subscriptionTier: 'premium',
        creditsTotal: 100, // your new premium limit
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        stripeSubscriptionStatus: 'active',
      });
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      await User.findOneAndUpdate(
        { stripeCustomerId: invoice.customer },
        { creditsUsed: 0, creditsResetAt: new Date(), stripeSubscriptionStatus: 'active' }
      );
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await User.findOneAndUpdate(
        { stripeCustomerId: invoice.customer },
        { stripeSubscriptionStatus: 'past_due' }
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await User.findOneAndUpdate(
        { stripeCustomerId: sub.customer },
        { subscriptionTier: 'free', creditsTotal: 10, stripeSubscriptionStatus: 'canceled' }
      );
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

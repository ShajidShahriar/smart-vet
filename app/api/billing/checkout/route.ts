import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID!, quantity: 1 }],
    client_reference_id: user._id.toString(),
    customer_email: user.email,
    success_url: `${appUrl}/?upgraded=true`, // the dashboard is at root ("/") in this app
    cancel_url: `${appUrl}/`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}

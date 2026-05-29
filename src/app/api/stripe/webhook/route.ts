import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  attachCheckoutToExistingUserByEmail,
  syncBillingFromSubscriptionEvent,
  upsertStripeCheckoutSessionRecord,
} from "@/lib/portal/billing";
import { getPortalRuntime } from "@/lib/portal/env";
import { getStripeClient } from "@/lib/portal/stripe";

export async function POST(request: Request) {
  const runtime = getPortalRuntime();
  const stripe = getStripeClient();
  const db = getDb();

  if (!runtime.stripeConfigured || !db || !stripe) {
    return NextResponse.json(
      { error: "Stripe webhook prerequisites are not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await upsertStripeCheckoutSessionRecord(session);
    await attachCheckoutToExistingUserByEmail(session);
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    await syncBillingFromSubscriptionEvent(subscription);
  }

  return NextResponse.json({ received: true });
}

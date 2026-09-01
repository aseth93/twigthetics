import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { fulfillGuideCheckoutSession } from "@/lib/guide/access";
import { isGuideCheckoutMetadata } from "@/lib/guide/constants";
import { recoverExpiredGuideCheckout } from "@/lib/guide/recovery";
import { recordGuideFunnelEvent } from "@/lib/guide/funnel";
import { sendMetaGuidePurchase } from "@/lib/meta/server";
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
  const db = await getDbReady();

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
    if (isGuideCheckoutMetadata(session.metadata)) {
      const purchase = await fulfillGuideCheckoutSession(session);
      if (purchase) {
        await Promise.allSettled([
          sendMetaGuidePurchase(session, event.created),
          recordGuideFunnelEvent({
            eventName: "purchase",
            visitorId: session.metadata?.visitorId,
            leadId: session.metadata?.leadId,
            email: purchase.email,
            stripeCheckoutSessionId: session.id,
            path: "/signup",
            attribution: {
              source: session.metadata?.attributionSource,
              medium: session.metadata?.attributionMedium,
              campaign: session.metadata?.attributionCampaign,
              content: session.metadata?.attributionContent,
              term: session.metadata?.attributionTerm,
              fbclid: session.metadata?.attributionFbclid,
              landingPath: session.metadata?.attributionLandingPath,
            },
            metadata: { amountTotal: purchase.amountTotal },
          }),
        ]);
      }
    } else {
      await attachCheckoutToExistingUserByEmail(session);
    }
  }

  if (event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (isGuideCheckoutMetadata(session.metadata)) {
      const purchase = await fulfillGuideCheckoutSession(session);
      if (purchase) {
        await Promise.allSettled([
          sendMetaGuidePurchase(session, event.created),
          recordGuideFunnelEvent({
            eventName: "purchase",
            visitorId: session.metadata?.visitorId,
            leadId: session.metadata?.leadId,
            email: purchase.email,
            stripeCheckoutSessionId: session.id,
            path: "/signup",
            attribution: {
              source: session.metadata?.attributionSource,
              medium: session.metadata?.attributionMedium,
              campaign: session.metadata?.attributionCampaign,
              content: session.metadata?.attributionContent,
              term: session.metadata?.attributionTerm,
              fbclid: session.metadata?.attributionFbclid,
              landingPath: session.metadata?.attributionLandingPath,
            },
            metadata: { amountTotal: purchase.amountTotal },
          }),
        ]);
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const storedSession = await upsertStripeCheckoutSessionRecord(session);

    if (storedSession && isGuideCheckoutMetadata(session.metadata)) {
      await recoverExpiredGuideCheckout(session, storedSession.metadata);
    }
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

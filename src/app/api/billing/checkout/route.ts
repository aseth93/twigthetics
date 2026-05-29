import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { billingAccounts } from "@/db/schema";
import { upsertStripeCheckoutSessionRecord } from "@/lib/portal/billing";
import { getPortalViewer } from "@/lib/portal/auth";
import { getSiteOrigin, getStripePriceId } from "@/lib/portal/env";
import { getStripeClient } from "@/lib/portal/stripe";

export async function GET(request: Request) {
  const viewer = await getPortalViewer();
  const origin = getSiteOrigin(new Headers(request.headers));
  const priceId = getStripePriceId();
  const db = getDb();
  const stripe = getStripeClient();

  if (!viewer) {
    return NextResponse.redirect(new URL("/login?next=/member/billing", origin));
  }

  if (viewer.profile.role !== "member") {
    return NextResponse.redirect(new URL("/admin", origin));
  }

  if (!db || !stripe || !priceId) {
    return NextResponse.redirect(new URL("/member/billing?status=unavailable", origin));
  }

  const [billingAccount] = await db
    .select({ stripeCustomerId: billingAccounts.stripeCustomerId })
    .from(billingAccounts)
    .where(eq(billingAccounts.memberId, viewer.profile.id))
    .limit(1);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    client_reference_id: viewer.profile.id,
    customer: billingAccount?.stripeCustomerId || undefined,
    customer_email: billingAccount?.stripeCustomerId ? undefined : viewer.profile.email,
    success_url: `${origin}/member/billing?checkout=success`,
    cancel_url: `${origin}/member/billing?checkout=cancelled`,
    metadata: {
      memberId: viewer.profile.id,
      source: "member-portal-billing",
      priceId,
      email: viewer.profile.email,
    },
    subscription_data: {
      metadata: {
        memberId: viewer.profile.id,
        source: "member-portal-billing",
        priceId,
        email: viewer.profile.email,
      },
    },
  });

  await upsertStripeCheckoutSessionRecord(session as Stripe.Checkout.Session);

  return NextResponse.redirect(session.url!, 303);
}

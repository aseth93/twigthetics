import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPortalRuntime } from "@/lib/portal/env";
import { getStripeClient } from "@/lib/portal/stripe";

function getSubscriptionStatus(input: unknown) {
  return typeof input === "string" ? input : "inactive";
}

export async function POST(request: Request) {
  const runtime = getPortalRuntime();
  const stripe = getStripeClient();
  const supabaseAdmin = createSupabaseAdminClient();

  if (!runtime.stripeConfigured || !runtime.serviceRoleConfigured || !stripe || !supabaseAdmin) {
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
    const memberId = session.metadata?.memberId || session.client_reference_id;

    if (memberId) {
      await supabaseAdmin.from("billing_accounts").upsert({
        member_id: memberId,
        stripe_customer_id:
          typeof session.customer === "string" ? session.customer : null,
        stripe_subscription_id:
          typeof session.subscription === "string" ? session.subscription : null,
        status: "active",
        plan_name: "Twigthetics Online Coaching",
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const currentPeriodEndRaw = (subscription as unknown as Record<string, unknown>)
      .current_period_end;
    const currentPeriodEnd =
      typeof currentPeriodEndRaw === "number"
        ? new Date(currentPeriodEndRaw * 1000).toISOString()
        : null;

    await supabaseAdmin
      .from("billing_accounts")
      .update({
        stripe_customer_id:
          typeof subscription.customer === "string" ? subscription.customer : null,
        stripe_subscription_id: subscription.id,
        status: getSubscriptionStatus(subscription.status),
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}

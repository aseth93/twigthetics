import { NextResponse } from "next/server";
import { getPortalViewer } from "@/lib/portal/auth";
import { getPortalRuntime, getSiteOrigin, getStripePriceId } from "@/lib/portal/env";
import { getStripeClient } from "@/lib/portal/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const viewer = await getPortalViewer();
  const runtime = getPortalRuntime();
  const origin = getSiteOrigin(new Headers(request.headers));
  const priceId = getStripePriceId();

  if (!viewer) {
    return NextResponse.redirect(new URL("/login?next=/member/billing", origin));
  }

  if (viewer.profile.role !== "member") {
    return NextResponse.redirect(new URL("/admin", origin));
  }

  if (
    viewer.mode === "demo" ||
    !runtime.supabaseConfigured ||
    !runtime.stripeConfigured ||
    !runtime.stripePriceConfigured ||
    !priceId
  ) {
    return NextResponse.redirect(new URL("/member/billing?staged=1", origin));
  }

  const supabase = await createSupabaseServerClient();
  const stripe = getStripeClient();

  if (!supabase || !stripe) {
    return NextResponse.redirect(new URL("/member/billing?staged=1", origin));
  }

  const { data: billingAccount } = await supabase
    .from("billing_accounts")
    .select("stripe_customer_id")
    .eq("member_id", viewer.profile.id)
    .maybeSingle();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    client_reference_id: viewer.profile.id,
    customer: billingAccount?.stripe_customer_id || undefined,
    customer_email: billingAccount?.stripe_customer_id ? undefined : viewer.profile.email,
    success_url: `${origin}/member/billing?checkout=success`,
    cancel_url: `${origin}/member/billing?checkout=cancelled`,
    metadata: {
      memberId: viewer.profile.id,
    },
  });

  return NextResponse.redirect(session.url!);
}

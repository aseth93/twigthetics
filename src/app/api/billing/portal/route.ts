import { NextResponse } from "next/server";
import { getPortalViewer } from "@/lib/portal/auth";
import { getPortalRuntime, getSiteOrigin } from "@/lib/portal/env";
import { getStripeClient } from "@/lib/portal/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const viewer = await getPortalViewer();
  const runtime = getPortalRuntime();
  const origin = getSiteOrigin(new Headers(request.headers));

  if (!viewer) {
    return NextResponse.redirect(new URL("/login?next=/member/billing", origin));
  }

  if (viewer.profile.role !== "member") {
    return NextResponse.redirect(new URL("/admin", origin));
  }

  if (viewer.mode === "demo" || !runtime.stripeConfigured || !runtime.supabaseConfigured) {
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

  if (!billingAccount?.stripe_customer_id) {
    return NextResponse.redirect(new URL("/member/billing?staged=1", origin));
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: billingAccount.stripe_customer_id,
    return_url: `${origin}/member/billing`,
  });

  return NextResponse.redirect(session.url);
}

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { billingAccounts } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";
import { getSiteOrigin } from "@/lib/portal/env";
import { getStripeClient } from "@/lib/portal/stripe";

export async function GET(request: Request) {
  const viewer = await getPortalViewer();
  const origin = getSiteOrigin(new Headers(request.headers));
  const db = await getDbReady();
  const stripe = getStripeClient();

  if (!viewer) {
    return NextResponse.redirect(new URL("/login?next=/member/billing", origin));
  }

  if (viewer.profile.role !== "member") {
    return NextResponse.redirect(new URL("/admin", origin));
  }

  if (!db || !stripe) {
    return NextResponse.redirect(new URL("/member/billing?status=unavailable", origin));
  }

  const [billingAccount] = await db
    .select({ stripeCustomerId: billingAccounts.stripeCustomerId })
    .from(billingAccounts)
    .where(eq(billingAccounts.memberId, viewer.profile.id))
    .limit(1);

  if (!billingAccount?.stripeCustomerId) {
    return NextResponse.redirect(new URL("/member/billing?status=missing", origin));
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: billingAccount.stripeCustomerId,
    return_url: `${origin}/member/billing`,
  });

  return NextResponse.redirect(session.url);
}

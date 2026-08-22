import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import {
  GUIDE_CURRENCY,
  GUIDE_ID,
  GUIDE_PRICE_CENTS,
  GUIDE_PRODUCT_TYPE,
  GUIDE_TITLE,
  GUIDE_VERSION,
} from "@/lib/guide/constants";
import { getGuidePurchaseForMember } from "@/lib/guide/access";
import { upsertStripeCheckoutSessionRecord } from "@/lib/portal/billing";
import { getSiteOrigin } from "@/lib/portal/env";
import { getStripeClient } from "@/lib/portal/stripe";

export async function GET(request: NextRequest) {
  const origin = getSiteOrigin(new Headers(request.headers));
  const stripe = getStripeClient();

  if (!stripe) {
    return NextResponse.redirect(new URL("/?guide_checkout=unavailable#guide", origin));
  }

  const authSession = await getAuthSession();
  const sessionUser = authSession?.user as
    | { id?: string; email?: string | null }
    | undefined;

  if (sessionUser?.id) {
    const existingPurchase = await getGuidePurchaseForMember(sessionUser.id);

    if (existingPurchase) {
      return NextResponse.redirect(new URL("/member/guide", origin));
    }
  }

  try {
    const marketingConsent = request.cookies.get("tw_marketing_consent")?.value;
    const metaAttribution =
      marketingConsent === "granted"
        ? {
            metaTrackingConsent: "granted",
            ...(request.cookies.get("_fbp")?.value
              ? { fbp: request.cookies.get("_fbp")!.value }
              : {}),
            ...(request.cookies.get("_fbc")?.value
              ? { fbc: request.cookies.get("_fbc")!.value }
              : {}),
          }
        : {};
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "pay",
      payment_method_types: ["card"],
      customer_creation: "always",
      customer_email: sessionUser?.email || undefined,
      billing_address_collection: "auto",
      line_items: [
        {
          price_data: {
            currency: GUIDE_CURRENCY,
            unit_amount: GUIDE_PRICE_CENTS,
            product_data: {
              name: GUIDE_TITLE,
              description:
                "A complete science-based system for getting lean, building muscle, or recomposing with practical calculators, nutrition guidance, and training plans.",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        source: "public-guide-checkout",
        productType: GUIDE_PRODUCT_TYPE,
        guideId: GUIDE_ID,
        guideVersion: GUIDE_VERSION,
        priceId: `guide:${GUIDE_ID}:v${GUIDE_VERSION}`,
        ...metaAttribution,
      },
      payment_intent_data: {
        metadata: {
          source: "public-guide-checkout",
          productType: GUIDE_PRODUCT_TYPE,
          guideId: GUIDE_ID,
          guideVersion: GUIDE_VERSION,
        },
      },
      success_url: `${origin}/signup?session_id={CHECKOUT_SESSION_ID}&purchase=guide`,
      cancel_url: `${origin}/?guide_checkout=cancelled#guide`,
    });

    await upsertStripeCheckoutSessionRecord(checkoutSession);

    return NextResponse.redirect(checkoutSession.url!, 303);
  } catch {
    return NextResponse.redirect(new URL("/?guide_checkout=error#guide", origin), 303);
  }
}

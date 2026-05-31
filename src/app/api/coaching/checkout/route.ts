import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/portal/env";
import { upsertStripeCheckoutSessionRecord } from "@/lib/portal/billing";
import { FRIEND_DISCOUNT_CODE } from "@/lib/portal/discount-codes";
import {
  ensureFriendDiscountPromotionCode,
} from "@/lib/portal/discounts";

function getTrimmedEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export async function GET(request: Request) {
  const origin = getSiteOrigin(new Headers(request.headers));
  const stripeKey = getTrimmedEnv("STRIPE_SECRET_KEY");
  const priceId = getTrimmedEnv("STRIPE_COACHING_PRICE_ID");
  const requestUrl = new URL(request.url);
  const customerEmail = requestUrl.searchParams.get("email")?.trim() || "";
  const submittedDiscountCode =
    requestUrl.searchParams.get("discountCode")?.trim().toUpperCase() || "";

  if (!stripeKey || !priceId) {
    return NextResponse.redirect(new URL("/#coaching", origin));
  }

  const stripe = new Stripe(stripeKey);

  try {
    const appliedDiscountCode =
      submittedDiscountCode === FRIEND_DISCOUNT_CODE ? FRIEND_DISCOUNT_CODE : "";
    const promotionCodeId = appliedDiscountCode
      ? await ensureFriendDiscountPromotionCode(stripe)
      : "";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      discounts: promotionCodeId
        ? [
            {
              promotion_code: promotionCodeId,
            },
          ]
        : undefined,
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: true,
      },
      customer_email: customerEmail || undefined,
      metadata: {
        source: "public-coaching-checkout",
        priceId,
        discountCode: appliedDiscountCode,
      },
      subscription_data: {
        metadata: {
          source: "public-coaching-checkout",
          priceId,
          discountCode: appliedDiscountCode,
        },
      },
      success_url: `${origin}/signup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled#coaching`,
    });

    await upsertStripeCheckoutSessionRecord(session);

    return NextResponse.redirect(session.url!, 303);
  } catch {
    return NextResponse.redirect(new URL("/?checkout=error#coaching", origin), 303);
  }
}

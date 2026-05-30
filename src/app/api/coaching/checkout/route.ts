import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/portal/env";
import { upsertStripeCheckoutSessionRecord } from "@/lib/portal/billing";

function getTrimmedEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export async function GET(request: Request) {
  const origin = getSiteOrigin(new Headers(request.headers));
  const stripeKey = getTrimmedEnv("STRIPE_SECRET_KEY");
  const priceId = getTrimmedEnv("STRIPE_COACHING_PRICE_ID");
  const requestUrl = new URL(request.url);
  const customerEmail = requestUrl.searchParams.get("email")?.trim() || "";

  if (!stripeKey || !priceId) {
    return NextResponse.redirect(new URL("/#coaching", origin));
  }

  const stripe = new Stripe(stripeKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: true,
      },
      customer_email: customerEmail || undefined,
      metadata: {
        source: "public-coaching-checkout",
        priceId,
      },
      subscription_data: {
        metadata: {
          source: "public-coaching-checkout",
          priceId,
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

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/portal/env";

function getTrimmedEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export async function GET(request: Request) {
  const origin = getSiteOrigin(new Headers(request.headers));
  const stripeKey = getTrimmedEnv("STRIPE_SECRET_KEY");
  const priceId = getTrimmedEnv("STRIPE_COACHING_PRICE_ID");

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
      success_url: `${origin}/?checkout=success#coaching`,
      cancel_url: `${origin}/?checkout=cancelled#coaching`,
    });

    return NextResponse.redirect(session.url!, 303);
  } catch {
    return NextResponse.redirect(new URL("/?checkout=error#coaching", origin), 303);
  }
}

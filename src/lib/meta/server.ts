import "server-only";

import { createHash } from "crypto";
import type Stripe from "stripe";
import {
  GUIDE_ID,
  GUIDE_PRICE_CENTS,
  GUIDE_TITLE,
} from "@/lib/guide/constants";

function hash(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function getCheckoutEmail(session: Stripe.Checkout.Session) {
  return session.customer_details?.email || session.customer_email || null;
}

export async function sendMetaGuidePurchase(
  session: Stripe.Checkout.Session,
  eventTime = Math.floor(Date.now() / 1000),
) {
  const pixelId =
    process.env.META_PIXEL_ID?.trim() ||
    process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN?.trim();
  const email = getCheckoutEmail(session);

  if (
    !pixelId ||
    !accessToken ||
    !email ||
    session.metadata?.metaTrackingConsent !== "granted"
  ) {
    return false;
  }

  const nameParts = (session.customer_details?.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.at(-1) : undefined;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    "https://twigthetics.com";

  const userData: Record<string, string | string[]> = {
    em: [hash(email)],
  };

  if (firstName) {
    userData.fn = [hash(firstName)];
  }

  if (lastName) {
    userData.ln = [hash(lastName)];
  }

  if (session.metadata?.fbp) {
    userData.fbp = session.metadata.fbp;
  }

  if (session.metadata?.fbc) {
    userData.fbc = session.metadata.fbc;
  }

  const response = await fetch(
    `https://graph.facebook.com/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: "Purchase",
            event_time: eventTime,
            event_id: session.id,
            event_source_url: `${siteUrl}/signup?session_id=${encodeURIComponent(session.id)}`,
            action_source: "website",
            user_data: userData,
            custom_data: {
              currency: (session.currency || "usd").toUpperCase(),
              value: (session.amount_total || GUIDE_PRICE_CENTS) / 100,
              content_name: GUIDE_TITLE,
              content_type: "product",
              contents: [
                {
                  id: GUIDE_ID,
                  quantity: 1,
                  item_price: (session.amount_total || GUIDE_PRICE_CENTS) / 100,
                },
              ],
            },
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    console.error("Meta purchase event failed", response.status, message);
    return false;
  }

  return true;
}

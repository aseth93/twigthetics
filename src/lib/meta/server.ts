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

function getMetaRuntime() {
  return {
    pixelId:
      process.env.META_PIXEL_ID?.trim() ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim(),
    accessToken: process.env.META_CONVERSIONS_API_ACCESS_TOKEN?.trim(),
  };
}

function getSessionUserData(session: Stripe.Checkout.Session) {
  const email = getCheckoutEmail(session);
  const nameParts = (session.customer_details?.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.at(-1) : undefined;
  const userData: Record<string, string | string[]> = {};

  if (email) {
    userData.em = [hash(email)];
  }

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

  return userData;
}

async function sendMetaGuideEvent(options: {
  session: Stripe.Checkout.Session;
  eventName: "InitiateCheckout" | "Purchase";
  eventId: string;
  eventSourceUrl: string;
  eventTime: number;
}) {
  const { pixelId, accessToken } = getMetaRuntime();
  const userData = getSessionUserData(options.session);

  if (
    !pixelId ||
    !accessToken ||
    options.session.metadata?.metaTrackingConsent !== "granted" ||
    Object.keys(userData).length === 0
  ) {
    return false;
  }

  const response = await fetch(
    `https://graph.facebook.com/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: options.eventName,
            event_time: options.eventTime,
            event_id: options.eventId,
            event_source_url: options.eventSourceUrl,
            action_source: "website",
            user_data: userData,
            custom_data: {
              currency: (options.session.currency || "usd").toUpperCase(),
              value:
                (options.session.amount_total || GUIDE_PRICE_CENTS) / 100,
              content_name: GUIDE_TITLE,
              content_type: "product",
              contents: [
                {
                  id: GUIDE_ID,
                  quantity: 1,
                  item_price:
                    (options.session.amount_total || GUIDE_PRICE_CENTS) / 100,
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
    console.error(
      `Meta ${options.eventName} event failed`,
      response.status,
      message,
    );
    return false;
  }

  return true;
}

export async function sendMetaGuideInitiateCheckout(
  session: Stripe.Checkout.Session,
  eventSourceUrl: string,
) {
  return sendMetaGuideEvent({
    session,
    eventName: "InitiateCheckout",
    eventId:
      session.metadata?.metaInitiateCheckoutEventId ||
      `guide-checkout-${session.id}`,
    eventSourceUrl,
    eventTime: Math.floor(Date.now() / 1000),
  });
}

export async function sendMetaGuidePurchase(
  session: Stripe.Checkout.Session,
  eventTime = Math.floor(Date.now() / 1000),
) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    "https://twigthetics.com";

  return sendMetaGuideEvent({
    session,
    eventName: "Purchase",
    eventId: session.id,
    eventSourceUrl: `${siteUrl}/signup?session_id=${encodeURIComponent(session.id)}&purchase=guide`,
    eventTime,
  });
}

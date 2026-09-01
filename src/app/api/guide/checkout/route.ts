import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import {
  GUIDE_CURRENCY,
  GUIDE_ID,
  GUIDE_PRODUCT_TYPE,
  GUIDE_TITLE,
  GUIDE_VERSION,
  getGuideOffer,
} from "@/lib/guide/constants";
import { getGuidePurchaseForMember } from "@/lib/guide/access";
import { recordGuideFunnelEvent } from "@/lib/guide/funnel";
import { upsertStripeCheckoutSessionRecord } from "@/lib/portal/billing";
import { sendMetaGuideInitiateCheckout } from "@/lib/meta/server";
import { getSiteOrigin } from "@/lib/portal/env";
import { getStripeClient } from "@/lib/portal/stripe";

type CheckoutResponseMode = "json" | "redirect";

function checkoutResponse(url: string, mode: CheckoutResponseMode) {
  return mode === "json"
    ? NextResponse.json({ url })
    : NextResponse.redirect(url, 303);
}

async function createGuideCheckout(
  request: NextRequest,
  mode: CheckoutResponseMode,
) {
  const origin = getSiteOrigin(new Headers(request.headers));
  const stripe = getStripeClient();
  const offer = getGuideOffer();

  if (!stripe) {
    return checkoutResponse(
      new URL("/?guide_checkout=unavailable#guide", origin).toString(),
      mode,
    );
  }

  const authSession = await getAuthSession();
  const sessionUser = authSession?.user as
    | { id?: string; email?: string | null }
    | undefined;

  if (sessionUser?.id) {
    const existingPurchase = await getGuidePurchaseForMember(sessionUser.id);

    if (existingPurchase) {
      return checkoutResponse(new URL("/member/guide", origin).toString(), mode);
    }
  }

  try {
    const readAttribution = (key: string) =>
      request.nextUrl.searchParams.get(key)?.trim().slice(0, 200) || undefined;
    const checkoutAttribution = {
      ...(readAttribution("utm_source")
        ? { attributionSource: readAttribution("utm_source")! }
        : {}),
      ...(readAttribution("utm_medium")
        ? { attributionMedium: readAttribution("utm_medium")! }
        : {}),
      ...(readAttribution("utm_campaign")
        ? { attributionCampaign: readAttribution("utm_campaign")! }
        : {}),
      ...(readAttribution("utm_content")
        ? { attributionContent: readAttribution("utm_content")! }
        : {}),
      ...(readAttribution("utm_term")
        ? { attributionTerm: readAttribution("utm_term")! }
        : {}),
      ...(readAttribution("fbclid")
        ? { attributionFbclid: readAttribution("fbclid")! }
        : {}),
      ...(readAttribution("landing_path")
        ? { attributionLandingPath: readAttribution("landing_path")! }
        : {}),
    };
    const funnelAttribution = {
      source: readAttribution("utm_source"),
      medium: readAttribution("utm_medium"),
      campaign: readAttribution("utm_campaign"),
      content: readAttribution("utm_content"),
      term: readAttribution("utm_term"),
      fbclid: readAttribution("fbclid"),
      landingPath: readAttribution("landing_path"),
    };
    const visitorId = readAttribution("visitor_id");
    const leadId = readAttribution("lead_id");
    const marketingConsent = request.cookies.get("tw_marketing_consent")?.value;
    const metaInitiateCheckoutEventId = request.nextUrl.searchParams
      .get("meta_event_id")
      ?.trim()
      .slice(0, 200);
    const metaAttribution =
      marketingConsent === "granted"
        ? {
            metaTrackingConsent: "granted",
            ...(metaInitiateCheckoutEventId
              ? { metaInitiateCheckoutEventId }
              : {}),
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
      expires_at: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
      payment_method_types: ["card"],
      customer_creation: "always",
      customer_email: sessionUser?.email || undefined,
      billing_address_collection: "auto",
      after_expiration: {
        recovery: {
          enabled: true,
        },
      },
      line_items: [
        {
          price_data: {
            currency: GUIDE_CURRENCY,
            unit_amount: offer.priceCents,
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
        listPriceCents: String(offer.listPriceCents),
        chargedPriceCents: String(offer.priceCents),
        offerCode: offer.offerCode || "standard",
        offerEndsAt: offer.offerEndsAt,
        ...(visitorId ? { visitorId } : {}),
        ...(leadId ? { leadId } : {}),
        ...checkoutAttribution,
        ...metaAttribution,
      },
      payment_intent_data: {
        metadata: {
          source: "public-guide-checkout",
          productType: GUIDE_PRODUCT_TYPE,
          guideId: GUIDE_ID,
          guideVersion: GUIDE_VERSION,
          chargedPriceCents: String(offer.priceCents),
          offerCode: offer.offerCode || "standard",
          ...checkoutAttribution,
        },
      },
      success_url: `${origin}/signup?session_id={CHECKOUT_SESSION_ID}&purchase=guide`,
      cancel_url: `${origin}/guide?checkout=cancelled`,
    });

    const checkoutSideEffects = await Promise.allSettled([
      upsertStripeCheckoutSessionRecord(checkoutSession),
      sendMetaGuideInitiateCheckout(
        checkoutSession,
        `${origin}/guide${request.nextUrl.search}`,
      ),
      recordGuideFunnelEvent({
        eventName: "checkout_started",
        visitorId,
        leadId,
        stripeCheckoutSessionId: checkoutSession.id,
        path: readAttribution("landing_path") || "/guide",
        attribution: funnelAttribution,
        metadata: {
          priceCents: offer.priceCents,
          offerCode: offer.offerCode || "standard",
        },
      }),
    ]);

    for (const result of checkoutSideEffects) {
      if (result.status === "rejected") {
        console.error("Guide checkout side effect failed", result.reason);
      }
    }

    return checkoutResponse(checkoutSession.url!, mode);
  } catch (error) {
    console.error("Guide checkout creation failed", error);
    return checkoutResponse(
      new URL("/?guide_checkout=error#guide", origin).toString(),
      mode,
    );
  }
}

export async function POST(request: NextRequest) {
  return createGuideCheckout(request, "json");
}

export async function GET(request: NextRequest) {
  // Old cached pages used a GET link. Only honor hydrated links carrying both
  // browser-generated values; bare crawler requests return to the guide page.
  if (
    !request.nextUrl.searchParams.has("landing_path") ||
    !request.nextUrl.searchParams.has("meta_event_id")
  ) {
    const origin = getSiteOrigin(new Headers(request.headers));
    return NextResponse.redirect(new URL("/guide", origin), 303);
  }

  return createGuideCheckout(request, "redirect");
}

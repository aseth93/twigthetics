import { NextRequest, NextResponse } from "next/server";
import {
  markGuidePreviewDelivered,
  recordGuideFunnelEvent,
  upsertGuideLead,
} from "@/lib/guide/funnel";
import {
  scheduleGuidePreviewFollowUps,
  sendGuidePreviewDeliveryEmail,
} from "@/lib/guide/email";
import { getSiteOrigin } from "@/lib/portal/env";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const originHeader = request.headers.get("origin");

  if (originHeader && new URL(originHeader).host !== requestUrl.host) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        firstName?: string;
        email?: string;
        marketingConsent?: boolean;
        website?: string;
        visitorId?: string;
        attribution?: Record<string, unknown>;
      }
    | null;
  const email = payload?.email?.trim().toLowerCase().slice(0, 255) || "";
  const firstName = payload?.firstName?.trim().slice(0, 100) || "";

  if (payload?.website) {
    return NextResponse.json({ ok: true });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const lead = await upsertGuideLead({
    email,
    firstName,
    marketingConsent: Boolean(payload?.marketingConsent),
    attribution: payload?.attribution,
  });

  if (!lead) {
    return NextResponse.json(
      { error: "Preview delivery is temporarily unavailable." },
      { status: 503 },
    );
  }

  const siteOrigin = getSiteOrigin(new Headers(request.headers));

  try {
    await sendGuidePreviewDeliveryEmail({ recipient: lead, siteOrigin });
    const sequenceEmailIds =
      lead.marketingConsent && !lead.sequenceEmailIds.length
        ? await scheduleGuidePreviewFollowUps({ recipient: lead, siteOrigin })
        : lead.sequenceEmailIds;

    await markGuidePreviewDelivered(lead.id, sequenceEmailIds);
    await recordGuideFunnelEvent({
      eventName: "preview_requested",
      visitorId: payload?.visitorId,
      leadId: lead.id,
      email: lead.email,
      path: "/guide#free-preview",
      attribution: payload?.attribution,
      metadata: { marketingConsent: lead.marketingConsent },
    }).catch((eventError) => {
      console.error("Guide preview analytics failed", eventError);
    });
  } catch (error) {
    console.error("Guide preview delivery failed", error);
    return NextResponse.json(
      { error: "The email could not be sent. Please try again shortly." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    leadId: lead.id,
    downloadUrl: "/downloads/twigthetics-guide-preview.pdf",
  });
}

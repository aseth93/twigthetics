import { NextResponse } from "next/server";
import {
  isGuideFunnelEventName,
  recordGuideFunnelEvent,
} from "@/lib/guide/funnel";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");

  if (origin && new URL(origin).host !== requestUrl.host) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        eventName?: string;
        visitorId?: string;
        path?: string;
        attribution?: Record<string, unknown>;
      }
    | null;
  const eventName = payload?.eventName?.trim() || "";
  const visitorId = payload?.visitorId?.trim().slice(0, 120) || "";

  if (!isGuideFunnelEventName(eventName) || eventName !== "view_content") {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }

  if (!visitorId) {
    return NextResponse.json({ error: "Visitor ID is required." }, { status: 400 });
  }

  await recordGuideFunnelEvent({
    eventName,
    visitorId,
    path: payload?.path,
    attribution: payload?.attribution,
  });

  return NextResponse.json({ ok: true });
}

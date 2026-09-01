import { NextRequest, NextResponse } from "next/server";
import { cancelGuideSequenceEmails } from "@/lib/guide/email";
import { unsubscribeGuideLead } from "@/lib/guide/funnel";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? ((await request.json().catch(() => null)) as { token?: string } | null)
    : null;
  const token =
    payload?.token?.trim() || request.nextUrl.searchParams.get("token")?.trim() || "";
  const lead = await unsubscribeGuideLead(token);

  if (!lead) {
    return NextResponse.json({ error: "That unsubscribe link is invalid." }, { status: 404 });
  }

  if (lead.sequenceEmailIds.length) {
    await cancelGuideSequenceEmails(lead.sequenceEmailIds);
  }

  return new NextResponse(null, { status: 200 });
}

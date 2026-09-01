import { NextResponse } from "next/server";
import { getGuidePurchaseForMember } from "@/lib/guide/access";
import { submitGuideTestimonial } from "@/lib/guide/funnel";
import { getPortalViewer } from "@/lib/portal/auth";

export async function POST(request: Request) {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "member") {
    return NextResponse.json({ error: "Member access required." }, { status: 403 });
  }

  const purchase = await getGuidePurchaseForMember(viewer.profile.id);

  if (!purchase) {
    return NextResponse.json({ error: "Guide purchase required." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { displayName?: string; quote?: string; rating?: string | number }
    | null;
  const displayName = payload?.displayName?.trim().slice(0, 120) || "";
  const quote = payload?.quote?.trim().slice(0, 2000) || "";
  const rating = Number(payload?.rating);

  if (!displayName || quote.length < 20 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Add your name, a rating, and at least 20 characters of feedback." },
      { status: 400 },
    );
  }

  const testimonial = await submitGuideTestimonial({
    memberId: viewer.profile.id,
    email: viewer.profile.email,
    displayName,
    quote,
    rating,
    status: "pending",
    source: "member_portal",
  });

  if (!testimonial) {
    return NextResponse.json({ error: "Unable to save feedback." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}

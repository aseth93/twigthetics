import { NextResponse } from "next/server";
import {
  submitGuideTestimonial,
  updateGuideTestimonialStatus,
} from "@/lib/guide/funnel";
import { getPortalViewer } from "@/lib/portal/auth";

async function getAdmin() {
  const viewer = await getPortalViewer();
  return viewer?.profile.role === "coach_admin" ? viewer : null;
}

export async function POST(request: Request) {
  const viewer = await getAdmin();

  if (!viewer) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { displayName?: string; quote?: string; rating?: string | number }
    | null;
  const displayName = payload?.displayName?.trim().slice(0, 120) || "";
  const quote = payload?.quote?.trim().slice(0, 2000) || "";
  const rating = Number(payload?.rating);

  if (!displayName || quote.length < 20 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Valid feedback is required." }, { status: 400 });
  }

  const testimonial = await submitGuideTestimonial({
    displayName,
    quote,
    rating,
    status: "published",
    source: "admin_verified",
  });

  return NextResponse.json({ ok: Boolean(testimonial) });
}

export async function PATCH(request: Request) {
  const viewer = await getAdmin();

  if (!viewer) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { testimonialId?: string; status?: string }
    | null;
  const testimonialId = payload?.testimonialId?.trim() || "";
  const status = payload?.status === "published" ? "published" : "pending";

  if (!testimonialId) {
    return NextResponse.json({ error: "Feedback ID is required." }, { status: 400 });
  }

  const testimonial = await updateGuideTestimonialStatus(testimonialId, status);
  return NextResponse.json({ ok: Boolean(testimonial) });
}

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { users } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";

export async function POST() {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "member") {
    return NextResponse.json({ error: "Member access required." }, { status: 403 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  await db
    .update(users)
    .set({
      memberOnboardingSeenAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, viewer.profile.id));

  return NextResponse.json({
    ok: true,
    message: "Member onboarding marked as seen.",
  });
}

import { and, eq, inArray, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { memberPlanUpdates } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";

export async function POST(request: Request) {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "member") {
    return NextResponse.json({ error: "Member access required." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { updateIds?: unknown }
    | null;
  const updateIds = Array.isArray(payload?.updateIds)
    ? payload.updateIds.filter((id): id is string => typeof id === "string")
    : [];

  if (!updateIds.length) {
    return NextResponse.json(
      { error: "At least one update ID is required." },
      { status: 400 },
    );
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  await db
    .update(memberPlanUpdates)
    .set({
      seenAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(memberPlanUpdates.memberId, viewer.profile.id),
        isNull(memberPlanUpdates.seenAt),
        inArray(memberPlanUpdates.id, updateIds),
      ),
    );

  return NextResponse.json({ ok: true });
}

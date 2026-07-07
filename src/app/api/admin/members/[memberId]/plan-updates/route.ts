import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { memberPlanUpdates, users } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";

type RouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

function normalizeItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export async function POST(request: Request, context: RouteContext) {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "coach_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        title?: string;
        summary?: string;
        items?: unknown;
      }
    | null;

  const title = payload?.title?.trim() || "Your coaching plan was updated";
  const summary = payload?.summary?.trim() || "";
  const items = normalizeItems(payload?.items);

  if (!items.length) {
    return NextResponse.json(
      { error: "At least one update item is required." },
      { status: 400 },
    );
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const { memberId } = await context.params;
  const [member] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, memberId))
    .limit(1);

  if (!member || member.role !== "member") {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  const existingRows = await db
    .select()
    .from(memberPlanUpdates)
    .where(
      and(
        eq(memberPlanUpdates.memberId, memberId),
        eq(memberPlanUpdates.title, title),
        eq(memberPlanUpdates.summary, summary),
        isNull(memberPlanUpdates.seenAt),
      ),
    )
    .orderBy(desc(memberPlanUpdates.createdAt))
    .limit(10);
  const matchingExisting = existingRows.find(
    (row) => JSON.stringify(row.items) === JSON.stringify(items),
  );

  if (matchingExisting) {
    return NextResponse.json({
      ok: true,
      message: "Matching unseen update already exists.",
      updateId: matchingExisting.id,
    });
  }

  const [insertedUpdate] = await db
    .insert(memberPlanUpdates)
    .values({
      memberId,
      createdByUserId: viewer.profile.id,
      title,
      summary,
      items,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: memberPlanUpdates.id });

  if (!insertedUpdate) {
    return NextResponse.json({ error: "Unable to create plan update." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Plan update created.",
    updateId: insertedUpdate.id,
  });
}

import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { planAssignments, plans } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";
import {
  serializePlanSections,
  type PlanSections,
} from "@/lib/portal/plan-sections";

export async function POST(request: Request) {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "coach_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        title?: string;
      summary?: string;
      cadence?: string;
      body?: string;
      sections?: Partial<PlanSections>;
      memberId?: string;
      startsOn?: string;
      notes?: string;
    }
    | null;

  const structuredBody = payload?.sections
    ? serializePlanSections(payload.sections)
    : payload?.body?.trim() || "";
  const hasContent =
    Boolean(payload?.body?.trim()) ||
    Boolean(
      payload?.sections &&
        Object.values(payload.sections).some(
          (value) => typeof value === "string" && value.trim().length,
        ),
    );

  if (!payload?.title?.trim() || !hasContent) {
    return NextResponse.json(
      { error: "Title and at least one plan section are required." },
      { status: 400 },
    );
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const insertedPlans = await db
    .insert(plans)
    .values({
      coachId: viewer.profile.id,
      title: payload.title.trim(),
      summary: payload.summary?.trim() || "",
      cadence: payload.cadence?.trim() || "",
      body: structuredBody,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  const plan = insertedPlans[0];

  if (!plan) {
    return NextResponse.json({ error: "Unable to save the plan." }, { status: 500 });
  }

  const memberId = payload.memberId?.trim() || "";

  if (memberId) {
    await db.insert(planAssignments).values({
      memberId,
      planId: plan.id,
      assignedByUserId: viewer.profile.id,
      status: "active",
      startsOn: payload.startsOn?.trim() || null,
      notes: payload.notes?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return NextResponse.json({
    ok: true,
    message: memberId ? "Plan saved and assigned." : "Plan saved.",
  });
}

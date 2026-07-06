import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { memberPlanUpdates, planAssignments, plans } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";
import {
  PLAN_SECTION_KEYS,
  PLAN_SECTION_LABELS,
  parsePlanSections,
  serializePlanSections,
  type PlanSections,
} from "@/lib/portal/plan-sections";

function summarizePlanSection(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177).trim()}...`;
}

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
    const [assignment] = await db
      .insert(planAssignments)
      .values({
        memberId,
        planId: plan.id,
        assignedByUserId: viewer.profile.id,
        status: "active",
        startsOn: payload.startsOn?.trim() || null,
        notes: payload.notes?.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: planAssignments.id });

    const parsedSections = parsePlanSections(structuredBody).sections;
    const updateItems = PLAN_SECTION_KEYS.flatMap((key) => {
      const value = parsedSections[key]?.trim() || "";

      if (!value) {
        return [];
      }

      return [`${PLAN_SECTION_LABELS[key]}: ${summarizePlanSection(value)}`];
    });

    if (assignment && updateItems.length) {
      await db.insert(memberPlanUpdates).values({
        memberId,
        planAssignmentId: assignment.id,
        createdByUserId: viewer.profile.id,
        title: "New coaching plan assigned",
        summary: "Review the key sections before your next workout or check-in.",
        items: updateItems,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    message: memberId ? "Plan saved and assigned." : "Plan saved.",
  });
}

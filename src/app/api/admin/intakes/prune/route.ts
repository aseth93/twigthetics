import { asc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { coachingApplications } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";

function normalizeName(value?: string | null) {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export async function POST() {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "coach_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const applicationRows = await db
    .select()
    .from(coachingApplications)
    .orderBy(asc(coachingApplications.submittedAt), asc(coachingApplications.createdAt));

  const cutoffIndex = applicationRows.findIndex(
    (row) => normalizeName(row.fullName) === "leonard bonus",
  );

  if (cutoffIndex === -1) {
    return NextResponse.json(
      { error: "Could not find Leonard Bonus in the intake queue." },
      { status: 404 },
    );
  }

  const rowsToDelete = applicationRows.slice(0, cutoffIndex);

  if (!rowsToDelete.length) {
    return NextResponse.json({
      ok: true,
      deletedCount: 0,
      deletedNames: [],
      message: "There were no intakes before Leonard Bonus.",
    });
  }

  const idsToDelete = rowsToDelete.map((row) => row.id);

  await db
    .delete(coachingApplications)
    .where(inArray(coachingApplications.id, idsToDelete));

  return NextResponse.json({
    ok: true,
    deletedCount: rowsToDelete.length,
    deletedNames: rowsToDelete.map((row) => row.fullName || "Unnamed applicant"),
  });
}

import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { dailyCheckins } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";

type RouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

function parseIsoDate(value: string) {
  const normalized = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export async function DELETE(request: Request, context: RouteContext) {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "coach_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        checkinDate?: string;
      }
    | null;

  const checkinDate = parseIsoDate(payload?.checkinDate || "");

  if (!checkinDate) {
    return NextResponse.json({ error: "A valid check-in date is required." }, { status: 400 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const { memberId } = await context.params;
  const deletedRows = await db
    .delete(dailyCheckins)
    .where(
      and(
        eq(dailyCheckins.memberId, memberId),
        eq(dailyCheckins.checkinDate, checkinDate),
      ),
    )
    .returning({
      id: dailyCheckins.id,
    });

  if (!deletedRows.length) {
    return NextResponse.json({ error: "Check-in not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    message: "Check-in deleted.",
    deletedCount: deletedRows.length,
    checkinDate,
    memberId,
  });
}

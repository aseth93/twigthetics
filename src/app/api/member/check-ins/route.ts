import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { dailyCheckins } from "@/db/schema";
import {
  computeWeeklyWeightAverages,
  getTodayIsoDate,
} from "@/lib/portal/checkin-stats";
import { getPortalViewer } from "@/lib/portal/auth";

function parseIsoDate(value: string) {
  const normalized = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function parseWeightTenths(value: unknown) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1000) {
    return null;
  }

  return Math.round(parsed * 10);
}

function parseHydrationOunces(value: unknown) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return { value: null, isInvalid: false };
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 512 || !Number.isInteger(parsed)) {
    return { value: null, isInvalid: true };
  }

  return { value: parsed, isInvalid: false };
}

function parseSleepTenths(value: unknown) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return { value: null, isInvalid: false };
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 24) {
    return { value: null, isInvalid: true };
  }

  return { value: Math.round(parsed * 10), isInvalid: false };
}

export async function GET() {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "member") {
    return NextResponse.json({ error: "Member access required." }, { status: 403 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const rows = await db
    .select()
    .from(dailyCheckins)
    .where(eq(dailyCheckins.memberId, viewer.profile.id))
    .orderBy(desc(dailyCheckins.checkinDate), desc(dailyCheckins.updatedAt));

  const checkins = rows.map((row) => ({
    id: row.id,
    memberId: row.memberId,
    checkinDate: row.checkinDate,
    weightPounds:
      typeof row.weightTenths === "number" ? row.weightTenths / 10 : null,
    hydrationOunces: row.hydrationOunces,
    sleepHours: typeof row.sleepTenths === "number" ? row.sleepTenths / 10 : null,
    workoutNotes: row.workoutNotes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));

  return NextResponse.json({
    ok: true,
    checkins,
    weeklyWeightAverages: computeWeeklyWeightAverages(checkins),
  });
}

export async function POST(request: Request) {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "member") {
    return NextResponse.json({ error: "Member access required." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        checkinDate?: string;
        weightPounds?: string | number;
        hydrationOunces?: string | number;
        sleepHours?: string | number;
        workoutNotes?: string;
      }
    | null;

  const checkinDate = parseIsoDate(payload?.checkinDate || "");
  const weightTenths = parseWeightTenths(payload?.weightPounds);
  const hydrationOunces = parseHydrationOunces(payload?.hydrationOunces);
  const sleepTenths = parseSleepTenths(payload?.sleepHours);
  const workoutNotes = String(payload?.workoutNotes || "").trim();

  if (!checkinDate) {
    return NextResponse.json({ error: "A valid check-in date is required." }, { status: 400 });
  }

  if (checkinDate > getTodayIsoDate()) {
    return NextResponse.json(
      { error: "Future check-ins are not allowed." },
      { status: 400 },
    );
  }

  if (weightTenths === null) {
    return NextResponse.json(
      { error: "Enter a valid bodyweight to save the check-in." },
      { status: 400 },
    );
  }

  if (hydrationOunces.isInvalid) {
    return NextResponse.json(
      { error: "Enter hydration as a whole number of ounces." },
      { status: 400 },
    );
  }

  if (sleepTenths.isInvalid) {
    return NextResponse.json(
      { error: "Enter sleep in hours using a value between 0 and 24." },
      { status: 400 },
    );
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  await db
    .insert(dailyCheckins)
    .values({
      memberId: viewer.profile.id,
      checkinDate,
      weightTenths,
      hydrationOunces: hydrationOunces.value,
      sleepTenths: sleepTenths.value,
      workoutNotes: workoutNotes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [dailyCheckins.memberId, dailyCheckins.checkinDate],
      set: {
        weightTenths,
        hydrationOunces: hydrationOunces.value,
        sleepTenths: sleepTenths.value,
        workoutNotes: workoutNotes || null,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({
    ok: true,
    message: "Daily check-in saved.",
  });
}

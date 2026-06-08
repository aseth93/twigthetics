import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { generateJiteshCoachingPackForMember } from "@/lib/coaching/jitesh-pack";
import { getPortalViewer } from "@/lib/portal/auth";

type RouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "coach_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  try {
    const { memberId } = await context.params;
    const result = await generateJiteshCoachingPackForMember({
      db,
      memberId,
      coachId: viewer.profile.id,
    });

    return NextResponse.json({
      ok: true,
      message: "Coaching pack generated.",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate the coaching pack.",
      },
      { status: 400 },
    );
  }
}

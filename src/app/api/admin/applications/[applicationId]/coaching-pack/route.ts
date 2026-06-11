import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import {
  DEFAULT_GENERATED_MEMBER_PASSWORD,
  generateCoachingPack,
} from "@/lib/coaching/coaching-pack";
import { getPortalViewer } from "@/lib/portal/auth";

type RouteContext = {
  params: Promise<{
    applicationId: string;
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
    const { applicationId } = await context.params;
    const result = await generateCoachingPack({
      db,
      applicationId,
      coachId: viewer.profile.id,
      tempPassword: DEFAULT_GENERATED_MEMBER_PASSWORD,
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

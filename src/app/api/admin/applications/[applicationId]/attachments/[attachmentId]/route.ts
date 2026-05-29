import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { coachingApplicationAttachments } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";

type RouteContext = {
  params: Promise<{
    applicationId: string;
    attachmentId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const viewer = await getPortalViewer();

  if (!viewer) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  if (viewer.profile.role !== "coach_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const { applicationId, attachmentId } = await context.params;
  const [attachment] = await db
    .select()
    .from(coachingApplicationAttachments)
    .where(
      and(
        eq(coachingApplicationAttachments.applicationId, applicationId),
        eq(coachingApplicationAttachments.id, attachmentId),
      ),
    )
    .limit(1);

  if (!attachment) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  return new Response(new Uint8Array(attachment.fileBlob), {
    headers: {
      "Content-Type": attachment.mimeType || "application/octet-stream",
      "Content-Length": String(attachment.sizeBytes || attachment.fileBlob.length),
      "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.fileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

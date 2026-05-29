import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { documentAccess, documents } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const viewer = await getPortalViewer();

  if (!viewer) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const { documentId } = await context.params;
  const [document] =
    viewer.profile.role === "coach_admin"
      ? await db.select().from(documents).where(eq(documents.id, documentId)).limit(1)
      : await db
          .select({
            id: documents.id,
            coachId: documents.coachId,
            title: documents.title,
            description: documents.description,
            fileName: documents.fileName,
            mimeType: documents.mimeType,
            sizeBytes: documents.sizeBytes,
            fileBlob: documents.fileBlob,
            createdAt: documents.createdAt,
            updatedAt: documents.updatedAt,
          })
          .from(documentAccess)
          .innerJoin(documents, eq(documentAccess.documentId, documents.id))
          .where(
            and(
              eq(documentAccess.memberId, viewer.profile.id),
              eq(documentAccess.documentId, documentId),
            ),
          )
          .limit(1);

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  return new Response(new Uint8Array(document.fileBlob), {
    headers: {
      "Content-Type": document.mimeType || "application/octet-stream",
      "Content-Length": String(document.sizeBytes || document.fileBlob.length),
      "Content-Disposition": `inline; filename="${encodeURIComponent(document.fileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

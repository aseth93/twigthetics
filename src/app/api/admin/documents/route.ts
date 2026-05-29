import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { documentAccess, documents } from "@/db/schema";
import { PLAN_SECTION_KEYS, type PlanSectionKey } from "@/lib/portal/plan-sections";
import { getPortalViewer } from "@/lib/portal/auth";

const maxDocumentBytes = 15 * 1024 * 1024;

export async function POST(request: Request) {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "coach_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const requestedSection = String(formData.get("section") || "").trim();
  const memberIds = String(formData.get("memberIds") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const section = (
    PLAN_SECTION_KEYS.includes(requestedSection as PlanSectionKey)
      ? requestedSection
      : "misc"
  ) as PlanSectionKey;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "Document title is required." }, { status: 400 });
  }

  if (file.size > maxDocumentBytes) {
    return NextResponse.json(
      { error: "Document uploads are capped at 15 MB for now." },
      { status: 400 },
    );
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const fileBlob = Buffer.from(await file.arrayBuffer());
  const insertedDocuments = await db
    .insert(documents)
    .values({
      coachId: viewer.profile.id,
      title,
      description: description || null,
      section,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      fileBlob,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: documents.id });

  const document = insertedDocuments[0];

  if (!document) {
    return NextResponse.json({ error: "Unable to save the document." }, { status: 500 });
  }

  if (memberIds.length) {
    await db.insert(documentAccess).values(
      memberIds.map((memberId) => ({
        documentId: document.id,
        memberId,
        createdAt: new Date(),
      })),
    );
  }

  return NextResponse.json({ ok: true, message: "Document uploaded." });
}

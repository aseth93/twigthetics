import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import {
  coachingApplicationAttachments,
  coachingApplications,
} from "@/db/schema";

const maxAttachmentBytes = 15 * 1024 * 1024;

function readString(payload: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key]?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json({ error: "Invalid application payload." }, { status: 400 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json(
      {
        error: "Application submissions are not connected yet. Add DATABASE_URL to activate the form.",
      },
      { status: 503 },
    );
  }

  const payload: Record<string, string> = {};
  const attachments: Array<{
    fieldName: string;
    file: File;
  }> = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.size > 0) {
        if (value.size > maxAttachmentBytes) {
          return NextResponse.json(
            { error: `${value.name} is too large. Keep each image under 15 MB.` },
            { status: 400 },
          );
        }

        attachments.push({
          fieldName: key,
          file: value,
        });
      }

      continue;
    }

    payload[key] = value;
  }

  const fullName = readString(payload, ["fullName", "name"]);
  const email = readString(payload, ["email"]);

  if (!fullName || !email) {
    return NextResponse.json(
      { error: "Full name and email are required." },
      { status: 400 },
    );
  }

  await db.transaction(async (tx) => {
    const insertedApplications = await tx
      .insert(coachingApplications)
      .values({
        fullName,
        email,
        instagramHandle: readString(payload, ["instagramHandle", "instagram"]) || null,
        status: "new",
        payload,
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: coachingApplications.id });

    const application = insertedApplications[0];

    if (!application) {
      throw new Error("Unable to save the intake.");
    }

    if (attachments.length) {
      const attachmentRows = await Promise.all(
        attachments.map(async ({ fieldName, file }) => ({
          applicationId: application.id,
          fieldName,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          fileBlob: Buffer.from(await file.arrayBuffer()),
          createdAt: new Date(),
        })),
      );

      await tx.insert(coachingApplicationAttachments).values(attachmentRows);
    }
  });

  return NextResponse.json({ ok: true });
}

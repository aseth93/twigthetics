import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getPortalViewer } from "@/lib/portal/auth";
import { getPortalRuntime } from "@/lib/portal/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const documentBucket = "member-documents";

export async function POST(request: Request) {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "coach_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const memberIds = String(formData.get("memberIds") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "Document title is required." }, { status: 400 });
  }

  const runtime = getPortalRuntime();

  if (!runtime.supabaseConfigured || viewer.mode === "demo") {
    return NextResponse.json({
      ok: true,
      message:
        "Document upload previewed successfully. Live storage starts once Supabase is connected.",
    });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const filePath = `${viewer.profile.id}/${randomUUID()}-${file.name}`;
  const uploadBuffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(documentBucket)
    .upload(filePath, uploadBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: documentRow, error: documentError } = await supabase
    .from("documents")
    .insert({
      coach_id: viewer.profile.id,
      title,
      description,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      bucket: documentBucket,
      path: filePath,
    })
    .select("id")
    .single();

  if (documentError || !documentRow) {
    return NextResponse.json(
      { error: documentError?.message || "Unable to save document metadata." },
      { status: 500 },
    );
  }

  if (memberIds.length) {
    const { error: accessError } = await supabase.from("document_access").insert(
      memberIds.map((memberId) => ({
        document_id: documentRow.id,
        member_id: memberId,
      })),
    );

    if (accessError) {
      return NextResponse.json({ error: accessError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, message: "Document uploaded." });
}

import { NextResponse } from "next/server";
import { getPortalViewer } from "@/lib/portal/auth";
import { getPortalRuntime, getSiteOrigin } from "@/lib/portal/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ documentId: string }> },
) {
  const viewer = await getPortalViewer();

  if (!viewer) {
    return NextResponse.redirect(new URL("/login?next=/member/documents", request.url));
  }

  const runtime = getPortalRuntime();
  const origin = getSiteOrigin(new Headers(request.headers));

  if (!runtime.supabaseConfigured || viewer.mode === "demo") {
    return NextResponse.redirect(new URL("/member/documents?staged=1", origin));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/member/documents?staged=1", origin));
  }

  const { documentId } = await context.params;
  const { data: documentAccess } =
    viewer.profile.role === "coach_admin"
      ? await supabase
          .from("documents")
          .select("bucket, path")
          .eq("id", documentId)
          .maybeSingle()
      : await supabase
          .from("document_access")
          .select("document:documents(bucket, path)")
          .eq("document_id", documentId)
          .eq("member_id", viewer.profile.id)
          .maybeSingle();

  const documentRow =
    viewer.profile.role === "coach_admin"
      ? (documentAccess as { bucket?: string; path?: string } | null)
      : ((documentAccess as { document?: { bucket?: string; path?: string } | null } | null)
          ?.document ?? null);

  if (!documentRow?.bucket || !documentRow.path) {
    return NextResponse.redirect(new URL("/member/documents?missing=1", origin));
  }

  const { data: signedUrlData, error } = await supabase.storage
    .from(documentRow.bucket)
    .createSignedUrl(documentRow.path, 60);

  if (error || !signedUrlData?.signedUrl) {
    return NextResponse.redirect(new URL("/member/documents?missing=1", origin));
  }

  return NextResponse.redirect(signedUrlData.signedUrl);
}

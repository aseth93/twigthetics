import { NextResponse } from "next/server";
import { getPortalViewer } from "@/lib/portal/auth";
import { getPortalRuntime } from "@/lib/portal/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "coach_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        title?: string;
        summary?: string;
        cadence?: string;
        body?: string;
      }
    | null;

  if (!payload?.title?.trim() || !payload?.body?.trim()) {
    return NextResponse.json(
      { error: "Title and body are required to create a plan." },
      { status: 400 },
    );
  }

  const runtime = getPortalRuntime();

  if (!runtime.supabaseConfigured || viewer.mode === "demo") {
    return NextResponse.json({
      ok: true,
      message: "Plan saved in demo mode. Live persistence starts once Supabase is connected.",
    });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const { error } = await supabase.from("plans").insert({
    coach_id: viewer.profile.id,
    title: payload.title.trim(),
    summary: payload.summary?.trim() || "",
    cadence: payload.cadence?.trim() || "",
    body: payload.body.trim(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Plan saved." });
}

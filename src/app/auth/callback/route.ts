import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPortalRuntime } from "@/lib/portal/env";

export async function GET(request: Request) {
  const runtime = getPortalRuntime();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const redirectTo = next?.startsWith("/") ? next : "/member";

  if (!runtime.supabaseConfigured || !code) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const supabase = await createSupabaseServerClient();
  await supabase?.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(new URL(redirectTo, origin));
}

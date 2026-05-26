import { NextResponse } from "next/server";
import { getDemoCookieName } from "@/lib/portal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPortalRuntime } from "@/lib/portal/env";

export async function POST() {
  const runtime = getPortalRuntime();

  if (runtime.supabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getDemoCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

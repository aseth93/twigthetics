import { NextResponse } from "next/server";
import { getDemoCookieName } from "@/lib/portal/auth";
import { getPortalRuntime } from "@/lib/portal/env";

export async function POST(request: Request) {
  const runtime = getPortalRuntime();

  if (!runtime.demoMode) {
    return NextResponse.json(
      { error: "Demo portal access is disabled once the live backend is enabled." },
      { status: 403 },
    );
  }

  const payload = (await request.json().catch(() => null)) as
    | { role?: string }
    | null;

  const role = payload?.role === "coach_admin" ? "coach_admin" : "member";
  const redirectTo = role === "coach_admin" ? "/admin" : "/member";
  const response = NextResponse.json({ ok: true, redirectTo });

  response.cookies.set(getDemoCookieName(), role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { users } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";
import { hashPassword } from "@/lib/portal/users";

type RouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

const minimumPasswordLength = 8;

export async function POST(request: Request, context: RouteContext) {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "coach_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        password?: string;
      }
    | null;

  const password = payload?.password?.trim() || "";

  if (password.length < minimumPasswordLength) {
    return NextResponse.json(
      { error: `Password must be at least ${minimumPasswordLength} characters.` },
      { status: 400 },
    );
  }

  const { memberId } = await context.params;
  const passwordHash = await hashPassword(password);

  const updatedUsers = await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, memberId))
    .returning({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
    });

  const updatedUser = updatedUsers[0];

  if (!updatedUser) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    member: updatedUser,
    message: "Password reset.",
  });
}

import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { users } from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";
import { hashPassword } from "@/lib/portal/users";

type ChangePasswordPayload = {
  currentPassword?: string;
  newPassword?: string;
};

export async function POST(request: Request) {
  const viewer = await getPortalViewer();

  if (!viewer) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  let payload: ChangePasswordPayload;

  try {
    payload = (await request.json()) as ChangePasswordPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const currentPassword = payload.currentPassword?.trim() || "";
  const newPassword = payload.newPassword?.trim() || "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Current password and new password are required." },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, viewer.profile.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const isValidCurrentPassword = await compare(currentPassword, user.passwordHash);

  if (!isValidCurrentPassword) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return NextResponse.json({
    ok: true,
    message: "Password updated.",
  });
}

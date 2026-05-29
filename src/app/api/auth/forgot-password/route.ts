import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDbReady } from "@/db";
import { passwordResetTokens } from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/portal/email";
import { getSiteOrigin } from "@/lib/portal/env";
import { createOpaqueToken, hashOpaqueToken } from "@/lib/portal/tokens";
import { ensureBootstrapAdmin, findUserByEmail, normalizeEmail } from "@/lib/portal/users";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = normalizeEmail(payload?.email || "");

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json(
      { error: "Password reset is not configured yet." },
      { status: 503 },
    );
  }

  await ensureBootstrapAdmin();
  const user = await findUserByEmail(email);

  if (!user) {
    return NextResponse.json({
      ok: true,
      message: "If that email exists, a reset link has been sent.",
    });
  }

  const token = createOpaqueToken();
  const tokenHash = hashOpaqueToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, user.id));

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
    createdAt: new Date(),
  });

  const origin = getSiteOrigin(new Headers(request.headers));
  const resetUrl = `${origin}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail({
      email: user.email,
      fullName: user.fullName,
      resetUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send a password reset email right now.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "If that email exists, a reset link has been sent.",
  });
}

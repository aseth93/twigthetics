import { NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDbReady } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { hashOpaqueToken } from "@/lib/portal/tokens";
import { hashPassword } from "@/lib/portal/users";

const minimumPasswordLength = 8;

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {
        token?: string;
        password?: string;
      }
    | null;

  const token = payload?.token?.trim() || "";
  const password = payload?.password || "";

  if (!token) {
    return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
  }

  if (password.length < minimumPasswordLength) {
    return NextResponse.json(
      { error: `Password must be at least ${minimumPasswordLength} characters.` },
      { status: 400 },
    );
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json(
      { error: "Password reset is not configured yet." },
      { status: 503 },
    );
  }

  const tokenHash = hashOpaqueToken(token);
  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!resetToken) {
    return NextResponse.json(
      { error: "That reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, resetToken.userId));

    await tx
      .update(passwordResetTokens)
      .set({
        usedAt: new Date(),
      })
      .where(eq(passwordResetTokens.id, resetToken.id));
  });

  return NextResponse.json({ ok: true });
}

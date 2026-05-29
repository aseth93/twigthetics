import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDbReady } from "@/db";
import { users } from "@/db/schema";
import type { PortalProfile } from "@/types/portal";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function mapUserToPortalProfile(user: typeof users.$inferSelect): PortalProfile {
  return {
    id: user.id,
    role: user.role === "coach_admin" ? "coach_admin" : "member",
    fullName: user.fullName,
    email: user.email,
    instagramHandle: user.instagramHandle,
    avatarUrl: user.avatarUrl,
    joinedAt: user.joinedAt.toISOString(),
  };
}

export async function findUserByEmail(email: string) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);

  return user || null;
}

export async function findUserById(userId: string) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  return user || null;
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function ensureBootstrapAdmin() {
  const db = await getDbReady();
  const email = normalizeEmail(process.env.BOOTSTRAP_ADMIN_EMAIL || "");
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim() || "";
  const fullName = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "Twigthetics Admin";

  if (!db || !email || !password) {
    return;
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return;
  }

  const passwordHash = await hashPassword(password);

  await db
    .insert(users)
    .values({
      email,
      fullName,
      passwordHash,
      role: "coach_admin",
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing({
      target: users.email,
    });
}

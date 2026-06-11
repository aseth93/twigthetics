import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import type { AppDb } from "@/db";
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
    memberOnboardingSeenAt: user.memberOnboardingSeenAt?.toISOString() || null,
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

export async function ensureMemberUser(options: {
  db: AppDb;
  email: string;
  fullName: string;
  password: string;
  instagramHandle?: string | null;
}) {
  const email = normalizeEmail(options.email);
  const fullName = options.fullName.trim() || email;
  const instagramHandle = options.instagramHandle?.trim() || null;
  const [existingUser] = await options.db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    if (existingUser.role !== "member") {
      throw new Error("A non-member account already exists with this email.");
    }

    const shouldUpdate =
      existingUser.fullName !== fullName ||
      (instagramHandle && existingUser.instagramHandle !== instagramHandle);

    if (!shouldUpdate) {
      return {
        user: existingUser,
        created: false,
      };
    }

    const [updatedUser] = await options.db
      .update(users)
      .set({
        fullName,
        instagramHandle: instagramHandle || existingUser.instagramHandle,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id))
      .returning();

    return {
      user: updatedUser || existingUser,
      created: false,
    };
  }

  const passwordHash = await hashPassword(options.password);
  const [createdUser] = await options.db
    .insert(users)
    .values({
      email,
      fullName,
      passwordHash,
      role: "member",
      instagramHandle,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (!createdUser) {
    throw new Error("Unable to create the member account.");
  }

  return {
    user: createdUser,
    created: true,
  };
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

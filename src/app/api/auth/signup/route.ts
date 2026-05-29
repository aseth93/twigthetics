import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { billingAccounts, stripeCheckoutSessions, users } from "@/db/schema";
import { getCoachingPlanName, getStripeSignupContext } from "@/lib/portal/billing";
import { getStripeClient } from "@/lib/portal/stripe";
import { hashPassword, normalizeEmail } from "@/lib/portal/users";

const minimumPasswordLength = 8;

function getSubscriptionStatus(input: unknown) {
  return typeof input === "string" ? input : "active";
}

function toDateFromUnix(timestamp: unknown) {
  return typeof timestamp === "number" ? new Date(timestamp * 1000) : null;
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {
        sessionId?: string;
        fullName?: string;
        instagramHandle?: string;
        password?: string;
      }
    | null;

  const sessionId = payload?.sessionId?.trim() || "";
  const fullName = payload?.fullName?.trim() || "";
  const instagramHandle = payload?.instagramHandle?.trim() || null;
  const password = payload?.password || "";

  if (!sessionId) {
    return NextResponse.json({ error: "Checkout session is required." }, { status: 400 });
  }

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }

  if (password.length < minimumPasswordLength) {
    return NextResponse.json(
      { error: `Password must be at least ${minimumPasswordLength} characters.` },
      { status: 400 },
    );
  }

  const db = getDb();
  const stripe = getStripeClient();

  if (!db || !stripe) {
    return NextResponse.json(
      { error: "Portal signup is not configured yet." },
      { status: 503 },
    );
  }

  const signupContext = await getStripeSignupContext(sessionId);

  if (!signupContext.valid || !signupContext.email) {
    return NextResponse.json(
      { error: signupContext.message || "That checkout session is not eligible for signup." },
      { status: 400 },
    );
  }

  const normalizedEmail = normalizeEmail(signupContext.email);
  const existingUser = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser[0]) {
    const [localSession] = await db
      .select()
      .from(stripeCheckoutSessions)
      .where(eq(stripeCheckoutSessions.id, sessionId))
      .limit(1);

    if (localSession?.claimedByUserId !== existingUser[0].id) {
      await db
        .update(stripeCheckoutSessions)
        .set({
          claimedByUserId: existingUser[0].id,
          claimedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(stripeCheckoutSessions.id, sessionId),
            isNull(stripeCheckoutSessions.claimedByUserId),
          ),
        );
    }

    return NextResponse.json(
      { error: "An account with that checkout email already exists. Sign in instead." },
      { status: 409 },
    );
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  const passwordHash = await hashPassword(password);

  try {
    let redirectTo = "/member";

    await db.transaction(async (tx) => {
      const insertedUsers = await tx
        .insert(users)
        .values({
          email: normalizedEmail,
          fullName,
          passwordHash,
          instagramHandle,
          role: "member",
          joinedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({
          id: users.id,
          role: users.role,
        });

      const insertedUser = insertedUsers[0];

      if (!insertedUser) {
        throw new Error("Unable to create the user account.");
      }

      const claimedSessions = await tx
        .update(stripeCheckoutSessions)
        .set({
          claimedByUserId: insertedUser.id,
          claimedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(stripeCheckoutSessions.id, sessionId),
            isNull(stripeCheckoutSessions.claimedByUserId),
          ),
        )
        .returning({ id: stripeCheckoutSessions.id });

      if (!claimedSessions[0]) {
        throw new Error("That checkout session has already been claimed.");
      }

      const subscription =
        typeof checkoutSession.subscription === "string" ? null : checkoutSession.subscription;
      const currentPeriodEnd = subscription
        ? toDateFromUnix(
            (subscription as unknown as Record<string, unknown>).current_period_end,
          )
        : null;
      const cancelAtPeriodEnd = subscription?.cancel_at_period_end || false;

      await tx
        .insert(billingAccounts)
        .values({
          memberId: insertedUser.id,
          stripeCustomerId:
            typeof checkoutSession.customer === "string" ? checkoutSession.customer : null,
          stripeSubscriptionId:
            typeof checkoutSession.subscription === "string"
              ? checkoutSession.subscription
              : checkoutSession.subscription?.id || null,
          status: subscription
            ? getSubscriptionStatus(subscription.status)
            : "active",
          planName: getCoachingPlanName(),
          currentPeriodEnd,
          cancelAtPeriodEnd,
          lastCheckoutSessionId: checkoutSession.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: billingAccounts.memberId,
          set: {
            stripeCustomerId:
              typeof checkoutSession.customer === "string" ? checkoutSession.customer : null,
            stripeSubscriptionId:
              typeof checkoutSession.subscription === "string"
                ? checkoutSession.subscription
                : checkoutSession.subscription?.id || null,
            status: subscription
              ? getSubscriptionStatus(subscription.status)
              : "active",
            planName: getCoachingPlanName(),
            currentPeriodEnd,
            cancelAtPeriodEnd,
            lastCheckoutSessionId: checkoutSession.id,
            updatedAt: new Date(),
          },
        });

      redirectTo = insertedUser.role === "coach_admin" ? "/admin" : "/member";
    });

    return NextResponse.json({
      ok: true,
      email: normalizedEmail,
      redirectTo,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to finish portal signup right now.",
      },
      { status: 500 },
    );
  }
}

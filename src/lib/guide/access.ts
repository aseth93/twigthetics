import "server-only";

import Stripe from "stripe";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { getDbReady } from "@/db";
import {
  billingAccounts,
  guidePurchases,
  planAssignments,
} from "@/db/schema";
import { claimStripeCheckoutSessionForUser, upsertStripeCheckoutSessionRecord } from "@/lib/portal/billing";
import { getStripeClient } from "@/lib/portal/stripe";
import { findUserByEmail, normalizeEmail } from "@/lib/portal/users";
import {
  GUIDE_CURRENCY,
  GUIDE_ID,
  GUIDE_PRICE_CENTS,
  GUIDE_VERSION,
  isAcceptedGuideCheckoutAmount,
  isGuideCheckoutMetadata,
} from "./constants";

function extractCheckoutEmail(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email || session.customer_email;
  return typeof email === "string" ? normalizeEmail(email) : null;
}

function getStripeId(value: string | { id: string } | null) {
  return typeof value === "string" ? value : value?.id || null;
}

export function isPaidGuideCheckout(session: Stripe.Checkout.Session) {
  return (
    isGuideCheckoutMetadata(session.metadata) &&
    session.mode === "payment" &&
    session.status === "complete" &&
    session.payment_status !== "unpaid" &&
    isAcceptedGuideCheckoutAmount(session.amount_total, session.metadata) &&
    session.currency === GUIDE_CURRENCY
  );
}

export async function fulfillGuideCheckoutSession(session: Stripe.Checkout.Session) {
  if (!isPaidGuideCheckout(session)) {
    return null;
  }

  const db = await getDbReady();
  const email = extractCheckoutEmail(session);

  if (!db || !email) {
    return null;
  }

  await upsertStripeCheckoutSessionRecord(session);

  const user = await findUserByEmail(email);
  const stripePaymentIntentId = getStripeId(session.payment_intent);
  const stripeCustomerId = getStripeId(session.customer);
  const now = new Date();
  const updateValues = {
    stripePaymentIntentId,
    stripeCustomerId,
    email,
    customerName: session.customer_details?.name || null,
    guideId: GUIDE_ID,
    guideVersion: GUIDE_VERSION,
    amountTotal: session.amount_total || GUIDE_PRICE_CENTS,
    currency: session.currency || GUIDE_CURRENCY,
    paymentStatus: session.payment_status,
    accessStatus: "active",
    purchasedAt: now,
    updatedAt: now,
    ...(user ? { memberId: user.id } : {}),
  };

  await db
    .insert(guidePurchases)
    .values({
      stripeCheckoutSessionId: session.id,
      memberId: user?.id || null,
      ...updateValues,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: guidePurchases.stripeCheckoutSessionId,
      set: updateValues,
    });

  if (user) {
    await claimStripeCheckoutSessionForUser(session.id, user.id);
  }

  const [purchase] = await db
    .select()
    .from(guidePurchases)
    .where(eq(guidePurchases.stripeCheckoutSessionId, session.id))
    .limit(1);

  return purchase || null;
}

export async function fulfillGuideCheckoutBySessionId(sessionId: string) {
  const stripe = getStripeClient();

  if (!stripe || !sessionId) {
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    return fulfillGuideCheckoutSession(session);
  } catch {
    return null;
  }
}

export async function claimGuidePurchaseForUser(options: {
  sessionId: string;
  userId: string;
  email: string;
}) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const [purchase] = await db
    .update(guidePurchases)
    .set({
      memberId: options.userId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(guidePurchases.stripeCheckoutSessionId, options.sessionId),
        eq(guidePurchases.email, normalizeEmail(options.email)),
        or(
          isNull(guidePurchases.memberId),
          eq(guidePurchases.memberId, options.userId),
        ),
      ),
    )
    .returning();

  return purchase || null;
}

export async function getGuidePurchaseForMember(memberId: string) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const [purchase] = await db
    .select()
    .from(guidePurchases)
    .where(
      and(
        eq(guidePurchases.memberId, memberId),
        eq(guidePurchases.accessStatus, "active"),
      ),
    )
    .orderBy(desc(guidePurchases.purchasedAt))
    .limit(1);

  return purchase || null;
}

export async function hasCoachingPortalAccess(memberId: string) {
  const db = await getDbReady();

  if (!db) {
    return false;
  }

  const [assignment, billing] = await Promise.all([
    db
      .select({ id: planAssignments.id })
      .from(planAssignments)
      .where(eq(planAssignments.memberId, memberId))
      .limit(1),
    db
      .select({ id: billingAccounts.id })
      .from(billingAccounts)
      .where(eq(billingAccounts.memberId, memberId))
      .limit(1),
  ]);

  return Boolean(assignment[0] || billing[0]);
}

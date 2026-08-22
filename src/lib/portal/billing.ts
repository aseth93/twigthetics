import Stripe from "stripe";
import { and, eq, isNull, or } from "drizzle-orm";
import { getDbReady } from "@/db";
import { billingAccounts, stripeCheckoutSessions } from "@/db/schema";
import {
  GUIDE_CURRENCY,
  GUIDE_PRICE_CENTS,
  isGuideCheckoutMetadata,
} from "@/lib/guide/constants";
import { getStripeClient } from "./stripe";
import { findUserByEmail, normalizeEmail } from "./users";

const coachingPlanName = "Twigthetics Online Coaching";

function toDateFromUnix(timestamp: unknown) {
  return typeof timestamp === "number" ? new Date(timestamp * 1000) : null;
}

function serializeStripeObject(value: unknown) {
  return JSON.parse(JSON.stringify(value || {})) as Record<string, unknown>;
}

function extractCheckoutEmail(session: Stripe.Checkout.Session) {
  const customerDetails = session.customer_details;
  const customerEmail =
    typeof customerDetails?.email === "string"
      ? customerDetails.email
      : typeof session.customer_email === "string"
        ? session.customer_email
        : null;

  return customerEmail ? normalizeEmail(customerEmail) : null;
}

function extractCheckoutPriceId(session: Stripe.Checkout.Session) {
  const lineItems = (session as Stripe.Checkout.Session & {
    line_items?: {
      data?: Array<{
        price?: {
          id?: string | null;
        } | null;
      }>;
    };
  }).line_items?.data;

  const expandedPriceId = lineItems?.[0]?.price?.id;

  if (expandedPriceId) {
    return expandedPriceId;
  }

  if (typeof session.metadata?.priceId === "string") {
    return session.metadata.priceId;
  }

  if (isGuideCheckoutMetadata(session.metadata)) {
    return `guide:${session.metadata?.guideId || "digital-guide"}`;
  }

  return process.env.STRIPE_COACHING_PRICE_ID?.trim() || null;
}

function getSubscriptionStatus(input: unknown) {
  return typeof input === "string" ? input : "inactive";
}

export async function upsertStripeCheckoutSessionRecord(session: Stripe.Checkout.Session) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const email = extractCheckoutEmail(session);
  const priceId = extractCheckoutPriceId(session);
  const customerName =
    typeof session.customer_details?.name === "string" ? session.customer_details.name : null;
  const phoneNumber =
    typeof session.customer_details?.phone === "string"
      ? session.customer_details.phone
      : null;
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : null;
  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : null;
  const completedAt = session.status === "complete" ? new Date() : null;

  await db
    .insert(stripeCheckoutSessions)
    .values({
      id: session.id,
      email,
      customerName,
      phoneNumber,
      stripeCustomerId,
      stripeSubscriptionId,
      paymentStatus: session.payment_status || null,
      status: session.status || "open",
      mode: session.mode,
      priceId,
      metadata: session.metadata || {},
      rawPayload: serializeStripeObject(session),
      completedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: stripeCheckoutSessions.id,
      set: {
        email,
        customerName,
        phoneNumber,
        stripeCustomerId,
        stripeSubscriptionId,
        paymentStatus: session.payment_status || null,
        status: session.status || "open",
        mode: session.mode,
        priceId,
        metadata: session.metadata || {},
        rawPayload: serializeStripeObject(session),
        completedAt,
        updatedAt: new Date(),
      },
    });

  const [storedSession] = await db
    .select()
    .from(stripeCheckoutSessions)
    .where(eq(stripeCheckoutSessions.id, session.id))
    .limit(1);

  return storedSession || null;
}

export async function resolveMemberIdForBilling(options: {
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  fallbackEmail?: string | null;
}) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  if (options.stripeSubscriptionId) {
    const [accountBySubscription] = await db
      .select({ memberId: billingAccounts.memberId })
      .from(billingAccounts)
      .where(eq(billingAccounts.stripeSubscriptionId, options.stripeSubscriptionId))
      .limit(1);

    if (accountBySubscription) {
      return accountBySubscription.memberId;
    }

    const [sessionBySubscription] = await db
      .select({ claimedByUserId: stripeCheckoutSessions.claimedByUserId })
      .from(stripeCheckoutSessions)
      .where(eq(stripeCheckoutSessions.stripeSubscriptionId, options.stripeSubscriptionId))
      .limit(1);

    if (sessionBySubscription?.claimedByUserId) {
      return sessionBySubscription.claimedByUserId;
    }
  }

  if (options.stripeCustomerId) {
    const [accountByCustomer] = await db
      .select({ memberId: billingAccounts.memberId })
      .from(billingAccounts)
      .where(eq(billingAccounts.stripeCustomerId, options.stripeCustomerId))
      .limit(1);

    if (accountByCustomer) {
      return accountByCustomer.memberId;
    }

    const [sessionByCustomer] = await db
      .select({ claimedByUserId: stripeCheckoutSessions.claimedByUserId })
      .from(stripeCheckoutSessions)
      .where(eq(stripeCheckoutSessions.stripeCustomerId, options.stripeCustomerId))
      .limit(1);

    if (sessionByCustomer?.claimedByUserId) {
      return sessionByCustomer.claimedByUserId;
    }
  }

  if (options.fallbackEmail) {
    const user = await findUserByEmail(options.fallbackEmail);
    return user?.id || null;
  }

  return null;
}

export async function upsertBillingAccountForMember(options: {
  memberId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  sessionId?: string | null;
  subscription?: Stripe.Subscription | null;
}) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  let subscription = options.subscription || null;
  const stripe = getStripeClient();

  if (!subscription && options.stripeSubscriptionId && stripe) {
    try {
      subscription = await stripe.subscriptions.retrieve(options.stripeSubscriptionId);
    } catch {
      subscription = null;
    }
  }

  const status = subscription ? getSubscriptionStatus(subscription.status) : "active";
  const currentPeriodEnd = subscription
    ? toDateFromUnix(
        (subscription as unknown as Record<string, unknown>).current_period_end,
      )
    : null;
  const cancelAtPeriodEnd = subscription?.cancel_at_period_end || false;
  const stripeCustomerId =
    options.stripeCustomerId ||
    (typeof subscription?.customer === "string" ? subscription.customer : null);
  const stripeSubscriptionId = options.stripeSubscriptionId || subscription?.id || null;

  await db
    .insert(billingAccounts)
    .values({
      memberId: options.memberId,
      stripeCustomerId,
      stripeSubscriptionId,
      status,
      planName: coachingPlanName,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      lastCheckoutSessionId: options.sessionId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: billingAccounts.memberId,
      set: {
        stripeCustomerId,
        stripeSubscriptionId,
        status,
        planName: coachingPlanName,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        lastCheckoutSessionId: options.sessionId || null,
        updatedAt: new Date(),
      },
    });

  const [billingAccount] = await db
    .select()
    .from(billingAccounts)
    .where(eq(billingAccounts.memberId, options.memberId))
    .limit(1);

  return billingAccount || null;
}

export async function claimStripeCheckoutSessionForUser(sessionId: string, userId: string) {
  const db = await getDbReady();

  if (!db) {
    return { ok: false as const, reason: "db-not-configured" };
  }

  const updatedRows = await db
    .update(stripeCheckoutSessions)
    .set({
      claimedByUserId: userId,
      claimedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(stripeCheckoutSessions.id, sessionId),
        or(
          isNull(stripeCheckoutSessions.claimedByUserId),
          eq(stripeCheckoutSessions.claimedByUserId, userId),
        ),
      ),
    )
    .returning();

  if (updatedRows[0]) {
    return { ok: true as const, session: updatedRows[0] };
  }

  const [existing] = await db
    .select()
    .from(stripeCheckoutSessions)
    .where(eq(stripeCheckoutSessions.id, sessionId))
    .limit(1);

  if (!existing) {
    return { ok: false as const, reason: "not-found" };
  }

  return { ok: false as const, reason: "already-claimed", session: existing };
}

export async function getStripeSignupContext(sessionId: string) {
  const stripe = getStripeClient();

  if (!sessionId || !stripe) {
    return {
      valid: false,
      email: null,
      customerName: null,
      existingUserExists: false,
      alreadyClaimed: false,
      purchaseType: null,
      message: "Stripe checkout is not connected.",
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    await upsertStripeCheckoutSessionRecord(session);

    const db = await getDbReady();
    const email = extractCheckoutEmail(session);
    const [localSession] =
      db && sessionId
        ? await db
            .select()
            .from(stripeCheckoutSessions)
            .where(eq(stripeCheckoutSessions.id, sessionId))
            .limit(1)
        : [];
    const existingUser = email ? await findUserByEmail(email) : null;
    const purchaseType = isGuideCheckoutMetadata(session.metadata)
      ? ("guide" as const)
      : ("coaching" as const);

    if (!email) {
      return {
        valid: false,
        email: null,
        customerName: null,
        existingUserExists: false,
        alreadyClaimed: false,
        purchaseType,
        message: "Stripe checkout did not return an email address.",
      };
    }

    const isEligibleGuidePurchase =
      purchaseType === "guide" &&
      session.mode === "payment" &&
      session.status === "complete" &&
      session.payment_status !== "unpaid" &&
      session.amount_total === GUIDE_PRICE_CENTS &&
      session.currency === GUIDE_CURRENCY;
    const isEligibleCoachingPurchase =
      purchaseType === "coaching" &&
      session.mode === "subscription" &&
      session.status === "complete";

    if (!isEligibleGuidePurchase && !isEligibleCoachingPurchase) {
      return {
        valid: false,
        email,
        customerName: session.customer_details?.name || localSession?.customerName || null,
        existingUserExists: Boolean(existingUser),
        alreadyClaimed: Boolean(localSession?.claimedByUserId),
        purchaseType,
        message: "That checkout is not complete yet.",
      };
    }

    return {
      valid: true,
      email,
      customerName: session.customer_details?.name || localSession?.customerName || null,
      existingUserExists: Boolean(existingUser),
      alreadyClaimed: Boolean(localSession?.claimedByUserId),
      purchaseType,
      message: null,
    };
  } catch {
    return {
      valid: false,
      email: null,
      customerName: null,
      existingUserExists: false,
      alreadyClaimed: false,
      purchaseType: null,
      message: "That checkout session could not be verified.",
    };
  }
}

export async function syncBillingFromSubscriptionEvent(subscription: Stripe.Subscription) {
  const emailFromMetadata =
    typeof subscription.metadata?.email === "string"
      ? normalizeEmail(subscription.metadata.email)
      : null;
  const memberId = await resolveMemberIdForBilling({
    stripeCustomerId:
      typeof subscription.customer === "string" ? subscription.customer : null,
    stripeSubscriptionId: subscription.id,
    fallbackEmail: emailFromMetadata,
  });

  if (!memberId) {
    return null;
  }

  return upsertBillingAccountForMember({
    memberId,
    stripeCustomerId:
      typeof subscription.customer === "string" ? subscription.customer : null,
    stripeSubscriptionId: subscription.id,
    subscription,
  });
}

export async function attachCheckoutToExistingUserByEmail(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") {
    return null;
  }

  const email = extractCheckoutEmail(session);

  if (!email) {
    return null;
  }

  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  await claimStripeCheckoutSessionForUser(session.id, user.id);

  return upsertBillingAccountForMember({
    memberId: user.id,
    stripeCustomerId:
      typeof session.customer === "string" ? session.customer : null,
    stripeSubscriptionId:
      typeof session.subscription === "string" ? session.subscription : null,
    sessionId: session.id,
  });
}

export async function getExistingStripeCheckoutSession(sessionId: string) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const [session] = await db
    .select()
    .from(stripeCheckoutSessions)
    .where(eq(stripeCheckoutSessions.id, sessionId))
    .limit(1);

  return session || null;
}

export function getCoachingPlanName() {
  return coachingPlanName;
}

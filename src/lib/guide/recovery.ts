import "server-only";

import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getDbReady } from "@/db";
import { stripeCheckoutSessions } from "@/db/schema";
import { sendGuideCheckoutRecoveryEmail } from "@/lib/portal/email";

const recoverySentKey = "guideRecoveryEmailSentAt";

export async function recoverExpiredGuideCheckout(
  session: Stripe.Checkout.Session,
  storedMetadata: Record<string, string>,
) {
  const recoveryUrl = session.after_expiration?.recovery?.url;
  const email = session.customer_details?.email || session.customer_email;

  if (
    session.consent?.promotions !== "opt_in" ||
    !recoveryUrl ||
    !email ||
    storedMetadata[recoverySentKey]
  ) {
    return false;
  }

  const db = await getDbReady();

  if (!db) {
    return false;
  }

  const firstName = session.customer_details?.name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)[0];

  await sendGuideCheckoutRecoveryEmail({
    email,
    firstName,
    recoveryUrl,
  });

  await db
    .update(stripeCheckoutSessions)
    .set({
      metadata: {
        ...storedMetadata,
        [recoverySentKey]: new Date().toISOString(),
      },
      updatedAt: new Date(),
    })
    .where(eq(stripeCheckoutSessions.id, session.id));

  return true;
}

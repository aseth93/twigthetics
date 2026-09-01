import "server-only";

import { randomUUID } from "crypto";
import { desc, eq, gte } from "drizzle-orm";
import { getDbReady } from "@/db";
import {
  guideFunnelEvents,
  guideLeads,
  guidePurchases,
  guideTestimonials,
} from "@/db/schema";
import { normalizeEmail } from "@/lib/portal/users";

export const GUIDE_FUNNEL_EVENT_NAMES = [
  "view_content",
  "preview_requested",
  "checkout_started",
  "purchase",
] as const;

export type GuideFunnelEventName = (typeof GUIDE_FUNNEL_EVENT_NAMES)[number];

export type GuideAttribution = Partial<{
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  fbclid: string;
  landingPath: string;
}>;

function cleanValue(value: unknown, maxLength = 200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanUuid(value: unknown) {
  const cleaned = cleanValue(value, 36);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    cleaned,
  )
    ? cleaned
    : null;
}

export function cleanGuideAttribution(input: Record<string, unknown> | null | undefined) {
  const attribution: Record<string, string> = {};

  for (const key of [
    "source",
    "medium",
    "campaign",
    "content",
    "term",
    "fbclid",
    "landingPath",
  ]) {
    const value = cleanValue(input?.[key]);

    if (value) {
      attribution[key] = value;
    }
  }

  return attribution;
}

export function isGuideFunnelEventName(value: string): value is GuideFunnelEventName {
  return GUIDE_FUNNEL_EVENT_NAMES.includes(value as GuideFunnelEventName);
}

export async function recordGuideFunnelEvent(options: {
  eventName: GuideFunnelEventName;
  visitorId?: string | null;
  leadId?: string | null;
  email?: string | null;
  stripeCheckoutSessionId?: string | null;
  path?: string | null;
  attribution?: Record<string, unknown> | null;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const [event] = await db
    .insert(guideFunnelEvents)
    .values({
      eventName: options.eventName,
      visitorId: cleanValue(options.visitorId, 120) || null,
      leadId: cleanUuid(options.leadId),
      email: options.email ? normalizeEmail(options.email) : null,
      stripeCheckoutSessionId:
        cleanValue(options.stripeCheckoutSessionId, 255) || null,
      path: cleanValue(options.path, 500) || null,
      attribution: cleanGuideAttribution(options.attribution),
      metadata: options.metadata || {},
      createdAt: new Date(),
    })
    .returning();

  return event || null;
}

export async function upsertGuideLead(options: {
  email: string;
  firstName?: string | null;
  marketingConsent: boolean;
  attribution?: Record<string, unknown> | null;
}) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const email = normalizeEmail(options.email);
  const firstName = cleanValue(options.firstName, 100) || null;
  const now = new Date();

  const [lead] = await db
    .insert(guideLeads)
    .values({
      email,
      firstName,
      marketingConsent: options.marketingConsent,
      status: options.marketingConsent ? "active" : "preview_only",
      unsubscribeToken: randomUUID(),
      attribution: cleanGuideAttribution(options.attribution),
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: guideLeads.email,
      set: {
        firstName,
        marketingConsent: options.marketingConsent,
        status: options.marketingConsent ? "active" : "preview_only",
        unsubscribedAt: null,
        attribution: cleanGuideAttribution(options.attribution),
        updatedAt: now,
      },
    })
    .returning();

  return lead || null;
}

export async function markGuidePreviewDelivered(
  leadId: string,
  sequenceEmailIds: string[],
) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const [lead] = await db
    .update(guideLeads)
    .set({
      previewDeliveredAt: new Date(),
      ...(sequenceEmailIds.length ? { sequenceEmailIds } : {}),
      updatedAt: new Date(),
    })
    .where(eq(guideLeads.id, leadId))
    .returning();

  return lead || null;
}

export async function unsubscribeGuideLead(token: string) {
  const db = await getDbReady();

  if (!db || !token) {
    return null;
  }

  const [lead] = await db
    .update(guideLeads)
    .set({
      marketingConsent: false,
      status: "unsubscribed",
      unsubscribedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(guideLeads.unsubscribeToken, token))
    .returning();

  return lead || null;
}

export async function getPublishedGuideTestimonials() {
  try {
    const db = await getDbReady();

    if (!db) {
      return [];
    }

    return db
      .select()
      .from(guideTestimonials)
      .where(eq(guideTestimonials.status, "published"))
      .orderBy(desc(guideTestimonials.createdAt));
  } catch (error) {
    console.error("Guide testimonials could not be loaded", error);
    return [];
  }
}

export async function submitGuideTestimonial(options: {
  memberId?: string | null;
  email?: string | null;
  displayName: string;
  quote: string;
  rating?: number | null;
  status?: "pending" | "published";
  source?: string;
}) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const [testimonial] = await db
    .insert(guideTestimonials)
    .values({
      memberId: options.memberId || null,
      email: options.email ? normalizeEmail(options.email) : null,
      displayName: cleanValue(options.displayName, 120),
      quote: cleanValue(options.quote, 2000),
      rating: options.rating || null,
      status: options.status || "pending",
      source: cleanValue(options.source, 40) || "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return testimonial || null;
}

export async function updateGuideTestimonialStatus(
  testimonialId: string,
  status: "pending" | "published",
) {
  const db = await getDbReady();

  if (!db) {
    return null;
  }

  const [testimonial] = await db
    .update(guideTestimonials)
    .set({ status, updatedAt: new Date() })
    .where(eq(guideTestimonials.id, testimonialId))
    .returning();

  return testimonial || null;
}

export async function getGuideFunnelDashboard(days = 30) {
  const db = await getDbReady();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  if (!db) {
    return null;
  }

  const [events, leads, purchases, testimonials] = await Promise.all([
    db
      .select()
      .from(guideFunnelEvents)
      .where(gte(guideFunnelEvents.createdAt, cutoff))
      .orderBy(desc(guideFunnelEvents.createdAt)),
    db
      .select()
      .from(guideLeads)
      .where(gte(guideLeads.createdAt, cutoff))
      .orderBy(desc(guideLeads.createdAt)),
    db
      .select()
      .from(guidePurchases)
      .where(gte(guidePurchases.purchasedAt, cutoff))
      .orderBy(desc(guidePurchases.purchasedAt)),
    db.select().from(guideTestimonials).orderBy(desc(guideTestimonials.createdAt)),
  ]);

  const eventRows = (eventName: GuideFunnelEventName) =>
    events.filter((event) => event.eventName === eventName);
  const uniqueEvents = (eventName: GuideFunnelEventName) =>
    new Set(
      eventRows(eventName).map(
        (event) =>
          event.visitorId || event.stripeCheckoutSessionId || event.email || event.id,
      ),
    ).size;
  const views = uniqueEvents("view_content");
  const previewLeads = leads.length;
  const checkoutStarts = uniqueEvents("checkout_started");
  const purchaseCount = purchases.length;
  const revenueCents = purchases.reduce(
    (total, purchase) => total + purchase.amountTotal,
    0,
  );
  const sourceCounts = new Map<string, number>();

  for (const event of eventRows("checkout_started")) {
    const source = event.attribution.source || "direct / unknown";
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
  }

  return {
    days,
    views,
    previewLeads,
    checkoutStarts,
    purchaseCount,
    revenueCents,
    viewToLeadRate: views ? previewLeads / views : 0,
    viewToCheckoutRate: views ? checkoutStarts / views : 0,
    checkoutToPurchaseRate: checkoutStarts ? purchaseCount / checkoutStarts : 0,
    sources: Array.from(sourceCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
    recentEvents: events.slice(0, 30),
    recentLeads: leads.slice(0, 30),
    recentPurchases: purchases.slice(0, 30),
    testimonials,
  };
}

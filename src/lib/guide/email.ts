import "server-only";

import { getGuideOffer } from "@/lib/guide/constants";
import { getResendClient } from "@/lib/portal/email";

type GuideLeadEmailRecipient = {
  id: string;
  email: string;
  firstName: string | null;
  unsubscribeToken: string;
};

function getEmailRuntime() {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!resend || !from) {
    throw new Error("Email delivery is not configured.");
  }

  return { resend, from };
}

function greeting(firstName: string | null) {
  return firstName ? `Hi ${firstName},` : "Hi,";
}

function guideUrl(siteOrigin: string, content: string) {
  const url = new URL("/guide", siteOrigin);
  url.searchParams.set("utm_source", "guide_preview_email");
  url.searchParams.set("utm_medium", "email");
  url.searchParams.set("utm_campaign", "guide_preview_sequence");
  url.searchParams.set("utm_content", content);
  return url.toString();
}

function marketingFooter(siteOrigin: string, unsubscribeToken: string) {
  return `

You asked to receive these guide emails when you requested the preview.
Unsubscribe: ${siteOrigin}/guide/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
}

async function sendScheduledEmail(options: {
  recipient: GuideLeadEmailRecipient;
  siteOrigin: string;
  subject: string;
  text: string;
  scheduledAt: Date;
}) {
  const { resend, from } = getEmailRuntime();
  const unsubscribeUrl = `${options.siteOrigin}/api/guide/unsubscribe?token=${encodeURIComponent(options.recipient.unsubscribeToken)}`;
  const response = await resend.emails.send({
    from,
    to: options.recipient.email,
    subject: options.subject,
    text:
      options.text +
      marketingFooter(options.siteOrigin, options.recipient.unsubscribeToken),
    scheduledAt: options.scheduledAt.toISOString(),
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    tags: [
      { name: "campaign", value: "guide_preview_sequence" },
      { name: "lead_id", value: options.recipient.id.replace(/-/g, "_") },
    ],
  });

  if (response.error || !response.data?.id) {
    throw new Error(response.error?.message || "Unable to schedule guide email.");
  }

  return response.data.id;
}

export async function sendGuidePreviewDeliveryEmail(options: {
  recipient: GuideLeadEmailRecipient;
  siteOrigin: string;
}) {
  const { resend, from } = getEmailRuntime();
  const previewUrl = `${options.siteOrigin}/downloads/twigthetics-guide-preview.pdf`;
  const response = await resend.emails.send({
    from,
    to: options.recipient.email,
    subject: "Your free Twigthetics guide preview",
    text: `${greeting(options.recipient.firstName)}

Here is your free five-page preview of The Lean, Athletic Physique Guide:
${previewUrl}

It includes real pages from the guide so you can see the calorie and macro setup, meal framework, calculator, and training structure before buying.

The complete guide is here:
${guideUrl(options.siteOrigin, "preview_delivery")}

- Abe Seth
IFBB Pro`,
    tags: [
      { name: "campaign", value: "guide_preview_delivery" },
      { name: "lead_id", value: options.recipient.id.replace(/-/g, "_") },
    ],
  });

  if (response.error || !response.data?.id) {
    throw new Error(response.error?.message || "Unable to deliver guide preview.");
  }

  return response.data.id;
}

export async function scheduleGuidePreviewFollowUps(options: {
  recipient: GuideLeadEmailRecipient;
  siteOrigin: string;
}) {
  const scheduledEmailIds: string[] = [];
  const now = Date.now();
  const emails = [
    {
      delayHours: 24,
      subject: "Pick the right path before changing calories",
      content: "goal_path",
      body: `The first decision is not which calculator to use. It is whether your current situation calls for fat loss, muscle gain, or recomposition.

The guide gives you a decision tree, then the exact calorie, protein, and macro setup for that path. It also shows what to measure so you are not reacting to random scale changes.`,
    },
    {
      delayHours: 48,
      subject: "What the full 43-page guide gives you",
      content: "inside_guide",
      body: `The full guide is designed so a beginner can run the process without guessing:

- calorie, protein, and macro formulas
- fat-loss, muscle-gain, and recomposition pathways
- repeatable meal templates and high-volume food lists
- complete efficient training routines
- progression, plateaus, recovery, supplements, and maintenance

It is the knowledge side of coaching organized into one system.`,
    },
    {
      delayHours: 72,
      subject: "A complete plan without an ongoing coaching bill",
      content: "offer_and_guarantee",
      body: `If you want accountability and individual oversight, coaching is valuable. If the missing piece is knowing exactly what to do, the guide is the more direct option.

Read it, apply it, and if you are dissatisfied within 14 days, reply to the purchase email or DM @twigthetics for a refund.`,
    },
  ];

  for (const email of emails) {
    const scheduledAt = new Date(now + email.delayHours * 60 * 60 * 1000);
    const offer = getGuideOffer(scheduledAt.getTime());
    const offerLine = offer.isLaunchOfferActive
      ? `

The launch price is ${offer.formattedPrice} (normally ${offer.formattedListPrice}) through September 7 at 11:59 PM Pacific.`
      : `

The complete guide is ${offer.formattedPrice} as a one-time purchase.`;
    try {
      const id = await sendScheduledEmail({
        recipient: options.recipient,
        siteOrigin: options.siteOrigin,
        subject: email.subject,
        text: `${greeting(options.recipient.firstName)}

${email.body}${offerLine}

See the complete guide:
${guideUrl(options.siteOrigin, email.content)}

- Abe Seth
IFBB Pro`,
        scheduledAt,
      });
      scheduledEmailIds.push(id);
    } catch (error) {
      console.error("Guide follow-up scheduling failed", error);
    }
  }

  return scheduledEmailIds;
}

export async function cancelGuideSequenceEmails(emailIds: string[]) {
  const { resend } = getEmailRuntime();

  await Promise.allSettled(emailIds.map((emailId) => resend.emails.cancel(emailId)));
}

import "server-only";

import {
  and,
  desc,
  eq,
  gte,
  inArray,
  lte,
  ne,
} from "drizzle-orm";
import type { AppDb } from "@/db";
import {
  coachingApplications,
  documentAccess,
  documents,
  memberWorkoutScheduleEntries,
  planAssignments,
  plans,
  users,
} from "@/db/schema";
import {
  type PlanSectionKey,
  type PlanSections,
  serializePlanSections,
} from "@/lib/portal/plan-sections";
import { ensureMemberUser, normalizeEmail } from "@/lib/portal/users";
import {
  JITESH_MEMBER_ID,
  generateJiteshCoachingPackForMember,
} from "./jitesh-pack";
import {
  type CoachingPdfDefinition,
  type CoachingPdfMetric,
  type CoachingPdfSection,
  renderCoachingPdf,
} from "./jitesh-pack-pdf";

export const DEFAULT_GENERATED_MEMBER_PASSWORD = "Temppass1029!";

const DEFAULT_PACK_WEEKS = 6;
const TWIGTHETICS_BRAND_EYEBROW = "Twigthetics coaching";
const VOLUME_EATING_GUIDE_URL = "https://health.clevelandclinic.org/volume-eating";
const FILLING_FOODS_GUIDE_URL =
  "https://health.clevelandclinic.org/healthy-and-filling-foods";

type PackSource = {
  member: typeof users.$inferSelect;
  application: typeof coachingApplications.$inferSelect;
};

type ScheduleTemplate = {
  title: string;
  dayType: string;
  summary: string;
  details: string[];
};

type MacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type SupplementItem = {
  name: string;
  dose: string;
  timing: string;
  purpose: string;
};

type PdfDocumentSpec = {
  title: string;
  description: string;
  section: PlanSectionKey;
  fileName: string;
  definition: CoachingPdfDefinition;
};

type GeneratedDocument = {
  title: string;
  description: string;
  section: PlanSectionKey;
  fileName: string;
  mimeType: string;
  fileBuffer: Buffer;
};

type GeneratedScheduledWorkout = {
  scheduledDate: string;
  title: string;
  dayType: string;
  summary: string;
  details: string;
};

type GeneratedPlan = {
  title: string;
  legacyTitles?: string[];
  summary: string;
  cadence: string;
  body: string;
  sections: PlanSections;
  startsOn: string;
  notes: string;
};

type GeneratedCoachingPack = {
  plan: GeneratedPlan;
  documents: GeneratedDocument[];
  scheduledWorkouts: GeneratedScheduledWorkout[];
  rangeStart: string;
  rangeEnd: string;
};

type ClientPackProfile = {
  planTitleSuffix: string;
  planSummary: string;
  cadence: string;
  notes: string;
  startDate: string;
  quickSections: PlanSections;
  scheduleTemplates: ScheduleTemplate[];
  trainingSubtitle: string;
  trainingMetrics: CoachingPdfMetric[];
  trainingSections: CoachingPdfSection[];
  nutritionSubtitle: string;
  nutritionModeLabel: string;
  macroTargets: MacroTargets;
  nutritionSections: CoachingPdfSection[];
  supplementSubtitle: string;
  supplementMetrics: CoachingPdfMetric[];
  supplementSections: CoachingPdfSection[];
  instructionSubtitle: string;
  instructionSections: CoachingPdfSection[];
  weekCount?: number;
};

export type CoachingPackGenerationResult = {
  memberId: string;
  memberCreated: boolean;
  memberEmail: string;
  memberName: string;
  planAssignmentId: string;
  planId: string;
  createdDocuments: number;
  updatedDocuments: number;
  scheduledWorkoutCount: number;
  rangeStart: string;
  rangeEnd: string;
  planTitle: string;
};

function addDays(isoDate: string, offset: number) {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatMacroTargets(targets: MacroTargets) {
  return `${targets.calories} kcal | ${targets.protein}P / ${targets.carbs}C / ${targets.fats}F`;
}

function formatScheduleDetails(details: string[]) {
  return details.map((item) => `• ${item}`).join("\n");
}

function buildScheduledWorkouts(
  startDate: string,
  weekCount: number,
  scheduleTemplates: ScheduleTemplate[],
) {
  const scheduledWorkouts: GeneratedScheduledWorkout[] = [];

  for (let dayIndex = 0; dayIndex < weekCount * 7; dayIndex += 1) {
    const template = scheduleTemplates[dayIndex % scheduleTemplates.length];
    scheduledWorkouts.push({
      scheduledDate: addDays(startDate, dayIndex),
      title: template.title,
      dayType: template.dayType,
      summary: template.summary,
      details: formatScheduleDetails(template.details),
    });
  }

  return scheduledWorkouts;
}

function buildDocumentFileName(memberName: string, suffix: string) {
  return `${slugify(memberName)}-${suffix}.pdf`;
}

async function renderDocumentSpecs(documentSpecs: PdfDocumentSpec[]) {
  const rendered = await Promise.all(
    documentSpecs.map(async (document) => ({
      title: document.title,
      description: document.description,
      section: document.section,
      fileName: document.fileName,
      mimeType: "application/pdf",
      fileBuffer: await renderCoachingPdf(document.definition),
    })),
  );

  return rendered;
}

function buildPdfDocumentSpecs(
  source: PackSource,
  profile: ClientPackProfile,
): PdfDocumentSpec[] {
  const memberName = source.member.fullName;

  return [
    {
      title: `${memberName} | Training Plan | Weeks 1-6`,
      description: "Structured 6-week training block with weekly rhythm, exercise detail, and progression rules.",
      section: "training",
      fileName: buildDocumentFileName(memberName, "training-plan-weeks-1-6"),
      definition: {
        title: "Training Plan | Weeks 1-6",
        eyebrow: TWIGTHETICS_BRAND_EYEBROW,
        subtitle: profile.trainingSubtitle,
        memberName,
        metrics: profile.trainingMetrics,
        sections: profile.trainingSections,
      },
    },
    {
      title: `${memberName} | Nutrition Plan + Backup Macros`,
      description: "Primary nutrition system, starting calories and macros, sample meals, and execution notes.",
      section: "nutrition",
      fileName: buildDocumentFileName(memberName, "nutrition-plan-backup-macros"),
      definition: {
        title: "Nutrition Plan + Backup Macros",
        eyebrow: TWIGTHETICS_BRAND_EYEBROW,
        subtitle: profile.nutritionSubtitle,
        memberName,
        metrics: [
          { label: "Primary system", value: profile.nutritionModeLabel },
          { label: "Starting target", value: `${profile.macroTargets.calories} kcal` },
          { label: "Protein", value: `${profile.macroTargets.protein} g` },
          {
            label: "Carbs / fats",
            value: `${profile.macroTargets.carbs} g / ${profile.macroTargets.fats} g`,
          },
        ],
        sections: profile.nutritionSections,
      },
    },
    {
      title: `${memberName} | Supplement Protocol`,
      description: "Daily supplement stack, hydration guardrails, and recovery support instructions.",
      section: "supplements",
      fileName: buildDocumentFileName(memberName, "supplement-protocol"),
      definition: {
        title: "Supplement Protocol",
        eyebrow: TWIGTHETICS_BRAND_EYEBROW,
        subtitle: profile.supplementSubtitle,
        memberName,
        metrics: profile.supplementMetrics,
        sections: profile.supplementSections,
      },
    },
    {
      title: `${memberName} | Coaching Platform Instructions`,
      description: "Portal walkthrough, daily logging expectations, calendar use, and messaging rules.",
      section: "misc",
      fileName: buildDocumentFileName(memberName, "coaching-platform-instructions"),
      definition: {
        title: "Coaching Platform Instructions",
        eyebrow: TWIGTHETICS_BRAND_EYEBROW,
        subtitle: profile.instructionSubtitle,
        memberName,
        metrics: [
          { label: "Daily logging", value: "Weight, water, sleep, workout notes" },
          { label: "Calendar", value: "Planned workout + actual notes" },
          { label: "Messaging", value: "Use the in-portal thread when something changes" },
          { label: "Review lens", value: "Weekly averages over single-day swings" },
        ],
        sections: profile.instructionSections,
      },
    },
  ];
}

async function buildGeneratedCoachingPack(
  source: PackSource,
  profile: ClientPackProfile,
): Promise<GeneratedCoachingPack> {
  const memberName = source.member.fullName;
  const planTitle = `${memberName} | ${profile.planTitleSuffix}`;
  const documentSpecs = buildPdfDocumentSpecs(source, profile);
  const renderedDocuments = await renderDocumentSpecs(documentSpecs);
  const weekCount = profile.weekCount || DEFAULT_PACK_WEEKS;
  const scheduledWorkouts = buildScheduledWorkouts(
    profile.startDate,
    weekCount,
    profile.scheduleTemplates,
  );

  return {
    plan: {
      title: planTitle,
      legacyTitles: [],
      summary: profile.planSummary,
      cadence: profile.cadence,
      body: serializePlanSections(profile.quickSections),
      sections: profile.quickSections,
      startsOn: profile.startDate,
      notes: profile.notes,
    },
    documents: renderedDocuments,
    scheduledWorkouts,
    rangeStart: profile.startDate,
    rangeEnd: addDays(profile.startDate, weekCount * 7 - 1),
  };
}

async function findPackSourceForMember(db: AppDb, memberId: string) {
  const [member] = await db
    .select()
    .from(users)
    .where(eq(users.id, memberId))
    .limit(1);

  if (!member || member.role !== "member") {
    throw new Error("Member not found.");
  }

  const [application] = await db
    .select()
    .from(coachingApplications)
    .where(eq(coachingApplications.email, member.email))
    .orderBy(desc(coachingApplications.submittedAt))
    .limit(1);

  if (!application) {
    throw new Error("No intake was found for this member.");
  }

  return {
    source: {
      member,
      application,
    },
    memberCreated: false,
  };
}

async function findPackSourceForApplication(
  db: AppDb,
  applicationId: string,
  tempPassword: string,
) {
  const [application] = await db
    .select()
    .from(coachingApplications)
    .where(eq(coachingApplications.id, applicationId))
    .limit(1);

  if (!application) {
    throw new Error("Intake not found.");
  }

  if (!application.email?.trim()) {
    throw new Error("This intake does not have an email address.");
  }

  const { user, created } = await ensureMemberUser({
    db,
    email: application.email,
    fullName: application.fullName?.trim() || application.email,
    password: tempPassword,
    instagramHandle: application.instagramHandle,
  });

  return {
    source: {
      member: user,
      application,
    },
    memberCreated: created,
  };
}

async function upsertGeneratedPack(options: {
  db: AppDb;
  memberId: string;
  coachId: string;
  pack: GeneratedCoachingPack;
}) {
  const result = await options.db.transaction(async (tx) => {
    const [existingAssignment] = await tx
      .select({
        assignment: planAssignments,
        plan: plans,
      })
      .from(planAssignments)
      .innerJoin(plans, eq(planAssignments.planId, plans.id))
      .where(
        and(
          eq(planAssignments.memberId, options.memberId),
          inArray(plans.title, [
            options.pack.plan.title,
            ...(options.pack.plan.legacyTitles || []),
          ]),
        ),
      )
      .orderBy(desc(planAssignments.createdAt))
      .limit(1);

    let planId = existingAssignment?.plan.id || "";
    let assignmentId = existingAssignment?.assignment.id || "";

    if (existingAssignment) {
      await tx
        .update(plans)
        .set({
          coachId: options.coachId,
          title: options.pack.plan.title,
          summary: options.pack.plan.summary,
          cadence: options.pack.plan.cadence,
          body: options.pack.plan.body,
          updatedAt: new Date(),
        })
        .where(eq(plans.id, existingAssignment.plan.id));

      await tx
        .update(planAssignments)
        .set({
          status: "active",
          startsOn: options.pack.plan.startsOn,
          notes: options.pack.plan.notes,
          assignedByUserId: options.coachId,
          updatedAt: new Date(),
        })
        .where(eq(planAssignments.id, existingAssignment.assignment.id));
    } else {
      const [insertedPlan] = await tx
        .insert(plans)
        .values({
          coachId: options.coachId,
          title: options.pack.plan.title,
          summary: options.pack.plan.summary,
          cadence: options.pack.plan.cadence,
          body: options.pack.plan.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: plans.id });

      if (!insertedPlan) {
        throw new Error("Unable to create the coaching plan.");
      }

      const [insertedAssignment] = await tx
        .insert(planAssignments)
        .values({
          memberId: options.memberId,
          planId: insertedPlan.id,
          assignedByUserId: options.coachId,
          status: "active",
          startsOn: options.pack.plan.startsOn,
          notes: options.pack.plan.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: planAssignments.id });

      if (!insertedAssignment) {
        throw new Error("Unable to assign the coaching plan.");
      }

      planId = insertedPlan.id;
      assignmentId = insertedAssignment.id;
    }

    if (assignmentId) {
      await tx
        .update(planAssignments)
        .set({
          status: "archived",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(planAssignments.memberId, options.memberId),
            ne(planAssignments.id, assignmentId),
            eq(planAssignments.status, "active"),
          ),
        );
    }

    const documentTitles = options.pack.documents.map((document) => document.title);
    const existingDocumentRows = documentTitles.length
      ? await tx
          .select({
            document: documents,
          })
          .from(documentAccess)
          .innerJoin(documents, eq(documentAccess.documentId, documents.id))
          .where(
            and(
              eq(documentAccess.memberId, options.memberId),
              inArray(documents.title, documentTitles),
            ),
          )
      : [];

    const existingDocumentsByTitle = new Map(
      existingDocumentRows.map((row) => [row.document.title, row.document]),
    );

    let createdDocuments = 0;
    let updatedDocuments = 0;

    for (const document of options.pack.documents) {
      const existingDocument = existingDocumentsByTitle.get(document.title);

      if (existingDocument) {
        await tx
          .update(documents)
          .set({
            coachId: options.coachId,
            title: document.title,
            description: document.description,
            section: document.section,
            fileName: document.fileName,
            mimeType: document.mimeType,
            sizeBytes: document.fileBuffer.length,
            fileBlob: document.fileBuffer,
            updatedAt: new Date(),
          })
          .where(eq(documents.id, existingDocument.id));

        await tx
          .insert(documentAccess)
          .values({
            documentId: existingDocument.id,
            memberId: options.memberId,
            createdAt: new Date(),
          })
          .onConflictDoNothing({
            target: [documentAccess.documentId, documentAccess.memberId],
          });

        updatedDocuments += 1;
        continue;
      }

      const [insertedDocument] = await tx
        .insert(documents)
        .values({
          coachId: options.coachId,
          title: document.title,
          description: document.description,
          section: document.section,
          fileName: document.fileName,
          mimeType: document.mimeType,
          sizeBytes: document.fileBuffer.length,
          fileBlob: document.fileBuffer,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: documents.id });

      if (!insertedDocument) {
        throw new Error(`Unable to create document ${document.title}.`);
      }

      await tx.insert(documentAccess).values({
        documentId: insertedDocument.id,
        memberId: options.memberId,
        createdAt: new Date(),
      });

      createdDocuments += 1;
    }

    await tx
      .delete(memberWorkoutScheduleEntries)
      .where(
        and(
          eq(memberWorkoutScheduleEntries.memberId, options.memberId),
          gte(memberWorkoutScheduleEntries.scheduledDate, options.pack.rangeStart),
          lte(memberWorkoutScheduleEntries.scheduledDate, options.pack.rangeEnd),
        ),
      );

    if (options.pack.scheduledWorkouts.length) {
      await tx.insert(memberWorkoutScheduleEntries).values(
        options.pack.scheduledWorkouts.map((entry) => ({
          memberId: options.memberId,
          scheduledDate: entry.scheduledDate,
          title: entry.title,
          dayType: entry.dayType,
          summary: entry.summary,
          details: entry.details,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      );
    }

    return {
      planAssignmentId: assignmentId,
      planId,
      createdDocuments,
      updatedDocuments,
      scheduledWorkoutCount: options.pack.scheduledWorkouts.length,
      rangeStart: options.pack.rangeStart,
      rangeEnd: options.pack.rangeEnd,
      planTitle: options.pack.plan.title,
    };
  });

  return result;
}

function buildSupplementBullets(items: SupplementItem[]) {
  return items.map(
    (item) => `${item.name}: ${item.dose} | ${item.timing} | ${item.purpose}`,
  );
}

function buildCommonInstructionSections(options: {
  memberName: string;
  nutritionModeLabel: string;
  extraBullets: string[];
}) {
  return [
    {
      heading: "How to use the portal",
      paragraphs: [
        `${options.memberName}, everything for this block lives inside the member portal under Plans. The programming tabs break things into training, nutrition, supplements, cardio, and misc so you can find the exact part you need without digging.`,
        "Use the calendar first each day. It shows the planned session, then the same date opens your actual logging area right below it.",
      ],
    },
    {
      heading: "Daily logging rules",
      bullets: [
        "Log bodyweight every morning after using the bathroom and before food or fluids.",
        "Log hydration every day so the weekly average reflects real recovery quality, not guesswork.",
        "Log sleep in hours, not just whether you felt tired.",
        "After every workout, leave short notes on performance, pumps, discomfort, energy, and anything that changed.",
      ],
    },
    {
      heading: "Calendar workflow",
      bullets: [
        "Open the date, read the planned workout, then complete the lift before editing anything.",
        "Use workout notes to report loads, reps, missed sets, exercise swaps, and any pain or equipment issues.",
        "Recovery or cardio days still matter. Leave a quick note if steps, treadmill, or mobility did not happen.",
      ],
    },
    {
      heading: "Nutrition and check-in expectations",
      paragraphs: [
        `Your primary nutrition system for this block is ${options.nutritionModeLabel.toLowerCase()}. Run that system cleanly before asking for changes.`,
        "The weekly average bodyweight matters more than one heavy day, one lean day, or one high-sodium day. Adjustments come from trends plus photos, performance, and adherence.",
      ],
      bullets: [
        "Message immediately if you miss multiple sessions, appetite crashes, digestion gets off, or recovery drops hard.",
        "If a meal or workout goes off plan, log it honestly instead of waiting until the next week.",
        "The fastest path to an update is precise feedback, not vague frustration.",
        ...options.extraBullets,
      ],
    },
  ] satisfies CoachingPdfSection[];
}

function buildHighVolumeFoodSection(options: {
  mode: "macro" | "meal-plan";
}): CoachingPdfSection {
  const leadParagraph =
    options.mode === "meal-plan"
      ? "If hunger is high, keep the meal plan intact and push food volume up with very low-calorie choices before thinking about extra carb portions, extra fats, or off-plan food."
      : "If hunger is high, keep the macro target intact and bias food choices toward high-volume, lower-calorie foods instead of reaching for random extras.";

  const controlRule =
    options.mode === "meal-plan"
      ? "Use these mostly as side-volume foods or approved add-ons to the existing meals, not as free extra meals."
      : "These still count. Fruit, yogurt, and egg whites should still be logged, but they are much easier to fit than random snack foods.";

  return {
    heading: "Low-calorie, high-volume hunger control",
    paragraphs: [
      leadParagraph,
      "The goal is to stay full enough to execute the plan cleanly without turning hunger into unstructured eating.",
    ],
    bullets: [
      "Berries: strawberries, blueberries, raspberries, blackberries.",
      "Fat-free Greek yogurt with Splenda or another zero-calorie sweetener.",
      "Egg whites added to breakfast or used as a later protein top-up.",
      "Big vegetable volume: lettuce, cucumber, zucchini, mushrooms, broccoli, cauliflower, green beans, bell peppers.",
      "Broth-based vegetable soup, salad, or extra steamed vegetables when appetite is high.",
      "Lean protein anchors when needed: chicken breast, deli turkey, tuna, or white fish.",
      controlRule,
      `Reference list: ${VOLUME_EATING_GUIDE_URL}`,
      `Extra filling-food ideas: ${FILLING_FOODS_GUIDE_URL}`,
    ],
  };
}

function buildMacroPrioritySection(): CoachingPdfSection {
  return {
    heading: "Macro priority",
    paragraphs: [
      "The main priorities are staying within the calorie target and hitting the protein goal.",
      "Fats and carbs do not need to land perfectly every day. They can trade off when needed if that is more convenient, as long as total calories and protein are controlled.",
    ],
  };
}

function buildBrendaProfile(source: PackSource): ClientPackProfile {
  const memberName = source.member.fullName;
  const startDate =
    source.application.payload.preferredStartDate?.trim() || "2026-06-15";

  return {
    planTitleSuffix: "6-Week Recomposition Block",
    planSummary:
      "Six-week recomposition block centered on glute growth, cleaner ab definition, macro tracking, and low-cardio sustainability at a commercial gym.",
    cadence:
      "3 mandatory lifting days, 1 optional glute/conditioning session, 10k daily steps, and 2 x 20-minute incline walks or 3k extra steps twice per week.",
    notes:
      "Generated from Brenda's intake with glute growth, moderate ab-definition work, macro tracking, and a low-cardio bias.",
    startDate,
    quickSections: {
      training:
        "Four-day rhythm with two lower-body sessions, two short upper sessions, and an optional Saturday glute pump so glute progress stays the main driver.",
      nutrition:
        "Start at 1,600 kcal with 130 g protein, 145 g carbs, and 55 g fat. Macro tracking is the primary system with repeatable meals built around lower-body training days.",
      supplements:
        "Creatine 5 g daily, multivitamin, optional whey isolate to close protein gaps, and fish oil if fatty fish is low.",
      cardio:
        "Keep 10k steps daily. Add 2 x 20-minute incline walking sessions per week or an extra 3,000 steps outside on top of the 10k baseline.",
      misc:
        "Daily weight, hydration, sleep, and workout notes stay mandatory. Glute performance, waist trend, and weekly average scale change drive adjustments.",
    },
    scheduleTemplates: [
      {
        title: "Lower 1 | Glute + quad priority",
        dayType: "training",
        summary: "Primary lower session for glutes, quads, and the biggest progression lifts of the week.",
        details: [
          "Smith or machine hip thrust 4 x 8-10",
          "Hack squat or heels-elevated smith squat 3 x 8-10",
          "Walking lunges 3 x 10 each leg",
          "Seated leg curl 3 x 10-12",
          "Cable abduction 2 x 15-20",
        ],
      },
      {
        title: "Upper 1 | Balanced push-pull + abs",
        dayType: "training",
        summary: "Short, efficient upper-body session that keeps shape balanced without stealing recovery from lower days.",
        details: [
          "Incline DB or machine press 3 x 8-10",
          "Lat pulldown 3 x 8-12",
          "Chest-supported row 3 x 10-12",
          "Cable lateral raise 3 x 12-20",
          "Cable crunch + dead bug finisher",
        ],
      },
      {
        title: "Recovery walk + mobility",
        dayType: "recovery",
        summary: "Keep steps high, loosen hips, and stay fresh for the second lower session.",
        details: [
          "10k steps minimum",
          "8-10 minutes hip and adductor mobility",
          "Light core bracing work only if energy is good",
        ],
      },
      {
        title: "Lower 2 | Glute + hamstring priority",
        dayType: "training",
        summary: "Posterior-chain lower day that drives glute shape and hamstring detail without junk volume.",
        details: [
          "Romanian deadlift 4 x 8-10",
          "Leg press glute stance 3 x 10-12",
          "Bulgarian split squat 3 x 8-10 each leg",
          "Lying leg curl 3 x 12-15",
          "Glute kickback 3 x 15-20",
        ],
      },
      {
        title: "Upper 2 | Delts, back, arms, abs",
        dayType: "training",
        summary: "Upper-body shaping session with slightly higher reps and another dose of ab work.",
        details: [
          "Neutral-grip pulldown 3 x 10-12",
          "Machine chest press 3 x 10-12",
          "Single-arm cable row 3 x 10-12",
          "Reverse pec deck + cable lateral raise",
          "Hanging knee raise 3 x 10-15",
        ],
      },
      {
        title: "Optional glute pump + incline walk / extra steps",
        dayType: "conditioning",
        summary: "Only run this if recovery is good and the main four sessions were completed cleanly.",
        details: [
          "Hip thrust or glute bridge 3 x 12",
          "Cable abduction 3 x 20",
          "Walking lunge 2 x 12 each leg",
          "Incline walk 20 minutes or 3,000 extra steps above the 10k baseline",
        ],
      },
      {
        title: "Recovery walk + reset",
        dayType: "recovery",
        summary: "Low-stress day to keep the week sustainable and set up the next lower session well.",
        details: [
          "10k steps minimum",
          "Hydration, sleep, and meal structure stay on plan",
          "No makeup lifting",
        ],
      },
    ],
    trainingSubtitle:
      "Glute-focused female recomposition block built for 3-4 training days at LA Fitness without needing excessive cardio to tighten up.",
    trainingMetrics: [
      { label: "Goal", value: "Glutes + cleaner midsection" },
      { label: "Schedule", value: "3 mandatory lifts + 1 optional pump day" },
      { label: "Equipment", value: "Commercial gym / LA Fitness" },
      { label: "Start", value: startDate },
    ],
    trainingSections: [
      {
        heading: "Block objective",
        paragraphs: [
          `${memberName}, the point of this block is not random fatigue. The point is to make your lower-body training productive enough that glutes improve while waist and ab definition tighten gradually.`,
          "Because you chose eat less + do less cardio, the training has to stay high quality and the cardio dose has to stay intentional instead of creeping upward every week.",
        ],
      },
      {
        heading: "Weekly rhythm",
        bullets: [
          "Monday: Lower 1 | glute + quad priority",
          "Tuesday: Upper 1 | balanced push-pull + abs",
          "Wednesday: Recovery walk + mobility",
          "Thursday: Lower 2 | glute + hamstring priority",
          "Friday: Upper 2 | delts, back, arms, abs",
          "Saturday: Optional glute pump + incline walk",
          "Sunday: Recovery walk + reset",
        ],
      },
      {
        heading: "Global execution rules",
        bullets: [
          "Lower-body compounds stop around 1-2 reps in reserve. Glute and isolation work can push to 0-1 RIR on the final set if technique stays clean.",
          "Beat rep targets before adding load. When the whole range is owned cleanly for every set, bump load the following week.",
          "The session cap is roughly 65-75 minutes. If the workout starts to sprawl, trim fluff before you trim the first two lifts.",
          "Abs stay frequent but controlled. Two quality ab slots per week will do more than random burnout circuits.",
          "The optional Saturday piece only runs when Thursday and Friday were executed well and recovery is still solid.",
        ],
      },
      {
        heading: "Day 1 | Lower 1",
        paragraphs: [
          "This is the heaviest glute/quad day of the week. Get the best effort here.",
        ],
        bullets: [
          "Smith or machine hip thrust: 4 x 8-10",
          "Hack squat or heels-elevated smith squat: 3 x 8-10",
          "Walking lunges: 3 x 10 each leg",
          "Seated leg curl: 3 x 10-12",
          "45-degree back extension, glute bias: 3 x 12-15",
          "Cable abduction: 2 x 15-20",
        ],
      },
      {
        heading: "Day 2 | Upper 1",
        paragraphs: [
          "Keep the upper days efficient. They are there to build shape, not steal recovery from the lower-body goal.",
        ],
        bullets: [
          "Incline DB or machine press: 3 x 8-10",
          "Assisted pull-up or pulldown: 3 x 8-12",
          "Chest-supported row: 3 x 10-12",
          "Cable lateral raise: 3 x 12-20",
          "Rope pressdown: 2 x 12-15",
          "Cable crunch: 3 x 12-15",
          "Dead bug: 2 x 8 each side",
        ],
      },
      {
        heading: "Day 4 | Lower 2",
        paragraphs: [
          "This session shifts the stress slightly more posterior so glutes and hamstrings keep progressing without repeating Monday exactly.",
        ],
        bullets: [
          "Romanian deadlift: 4 x 8-10",
          "Leg press, glute-biased stance: 3 x 10-12",
          "Bulgarian split squat: 3 x 8-10 each leg",
          "Lying or seated leg curl: 3 x 12-15",
          "Cable glute kickback: 3 x 15-20",
          "Standing calf raise: 3 x 10-15",
        ],
      },
      {
        heading: "Day 5 | Upper 2",
        paragraphs: [
          "This is a shaping day. Slightly higher reps, controlled execution, and another focused touch of ab work.",
        ],
        bullets: [
          "Neutral-grip pulldown: 3 x 10-12",
          "Machine chest press: 3 x 10-12",
          "Single-arm cable row: 3 x 10-12 each side",
          "Reverse pec deck: 3 x 15-20",
          "Cable lateral raise: 3 x 15-20",
          "Incline curl + rope overhead extension: 2 x 12-15 each",
          "Hanging knee raise: 3 x 10-15",
        ],
      },
      {
        heading: "Progression and stalls",
        bullets: [
          "Weeks 1-2 establish loads and clean execution. Weeks 3-4 push reps upward. Weeks 5-6 add load where the rep range is already owned.",
          "If a lift stalls for two straight exposures, keep the exercise but shave one set and push the first work set harder the following week.",
        ],
      },
    ],
    nutritionSubtitle:
      "Macro-tracked recomposition setup with enough food to train glutes well while still tightening the waist gradually.",
    nutritionModeLabel: "Macro tracking with MyFitnessPal",
    macroTargets: {
      calories: 1600,
      protein: 130,
      carbs: 145,
      fats: 55,
    },
    nutritionSections: [
      {
        heading: "Starting setup",
        paragraphs: [
          "At 127.4 lb, 5'3, and 3-4 training days with daily steps already in place, the best starting move is a controlled deficit instead of a crash diet.",
          `The opening target is ${formatMacroTargets({
            calories: 1600,
            protein: 130,
            carbs: 145,
            fats: 55,
          })}. That is enough structure to lean out while still keeping lower-body sessions productive.`,
        ],
      },
      {
        heading: "How to run the macros",
        bullets: [
          "Put a decent chunk of carbs in the meals before and after lower-body training days.",
          "Keep fats a little lower around the workout window so digestion stays easy and carbs can do their job.",
          "Track sauces, oils, nut butters, bites, and drinks. Recomp plans get ruined by small misses more than by the big obvious meals.",
        ],
      },
      buildMacroPrioritySection(),
      {
        heading: "Example day",
        bullets: [
          "Meal 1: Greek yogurt or egg-based breakfast, oats or toast, berries or fruit.",
          "Meal 2: Chicken, rice or potatoes, vegetables, and one controlled fat source.",
          "Meal 3: Pre-lift meal with lean protein and a solid carb source.",
          "Meal 4: Salmon, lean beef, turkey, or chicken with potatoes/rice and vegetables.",
          "Protein close-out only if needed to hit the target cleanly, not as an excuse to improvise extra food.",
        ],
      },
      buildHighVolumeFoodSection({ mode: "macro" }),
      {
        heading: "Non-negotiables",
        bullets: [
          "No untracked bites, licks, and tastes.",
          "Weekend meals still live inside the macro target.",
          "If hunger climbs late in the day, use higher-volume vegetables or a lean protein anchor, not free-form eating.",
        ],
      },
    ],
    supplementSubtitle:
      "Simple daily stack for recovery, performance, and consistency without overcomplicating the process.",
    supplementMetrics: [
      { label: "Hydration floor", value: "90-100 oz daily" },
      { label: "Cardio", value: "10k steps + 1-2 short sessions" },
      { label: "Sleep target", value: "7-8 hours" },
      { label: "Nutrition mode", value: "Macro tracking" },
    ],
    supplementSections: [
      {
        heading: "Core stack",
        bullets: buildSupplementBullets([
          {
            name: "Creatine monohydrate",
            dose: "5 g daily",
            timing: "Any consistent time",
            purpose: "Supports training performance and lean-mass retention.",
          },
          {
            name: "Multivitamin",
            dose: "1 serving daily",
            timing: "With a meal",
            purpose: "Fills small dietary gaps while food intake is controlled.",
          },
          {
            name: "Whey isolate",
            dose: "1 scoop as needed",
            timing: "Only when food alone will not cover protein",
            purpose: "Keeps the protein target clean and convenient.",
          },
          {
            name: "Fish oil",
            dose: "1-2 g combined EPA/DHA",
            timing: "With meals",
            purpose: "Good insurance if fatty fish intake stays low.",
          },
        ]),
      },
      {
        heading: "Hydration and recovery",
        bullets: [
          "Hit 90-100 oz water daily and keep sodium reasonably consistent across the week.",
          "Creatine works better when hydration is stable instead of wildly different day to day.",
          "Moderate stress plus 7-8 hours sleep is workable. Do not let bedtime drift because steps and training are already doing enough work.",
        ],
      },
      {
        heading: "Optional extras",
        bullets: [
          "A simple caffeine dose pre-lift is fine if energy is low, but keep it early enough that sleep quality stays intact.",
          "No supplement fixes inconsistent food tracking. Supplements only support clean execution.",
        ],
      },
    ],
    instructionSubtitle:
      "Use the portal daily so the plan can be adjusted from real trend data rather than guesses.",
    instructionSections: buildCommonInstructionSections({
      memberName,
      nutritionModeLabel: "Macro tracking with MyFitnessPal",
      extraBullets: [
        "Use the workout notes to mention whether glute-focused exercises were hitting correctly or whether setup changes are needed.",
        "If the optional Saturday session starts feeling required just to stay on track, that means weekly recovery or food structure needs attention.",
      ],
    }),
  };
}

function buildDanielProfile(source: PackSource): ClientPackProfile {
  const memberName = source.member.fullName;
  const startDate =
    source.application.payload.preferredStartDate?.trim() || "2026-06-15";

  return {
    planTitleSuffix: "6-Week Lean-Out Block",
    planSummary:
      "Six-week male lean-out phase aimed at dropping 5-10 lb while keeping training efficient, athletic, and realistic inside four 50-minute sessions.",
    cadence:
      "4 lifting days, 3 cardio exposures, and a steady 10k-step floor to keep fat loss moving without making the gym schedule unmanageable.",
    notes:
      "Generated from Daniel's intake with a 4-day schedule, 50-minute sessions, macro tracking, and the preference for slightly more cardio rather than aggressively low food.",
    startDate,
    quickSections: {
      training:
        "Four structured 50-minute lifts: upper 1, lower 1, upper 2, lower 2. The goal is better tone, cleaner execution, and predictable weekly output.",
      nutrition:
        "Start at 1,900 kcal with 170 g protein, 180 g carbs, and 55 g fat. Macro tracking stays primary, with carbs clustered around training and cardio days kept productive.",
      supplements:
        "Creatine 5 g daily, whey isolate only as needed, optional caffeine pre-lift, and basic hydration support.",
      cardio:
        "Keep 10k steps daily and add 3 x 25-minute incline or bike sessions each week. Cardio supports the pace instead of replacing diet control.",
      misc:
        "Daily weight, hydration, sleep, and session notes stay logged. Adjustments come from weekly average bodyweight plus waist look and workout quality.",
    },
    scheduleTemplates: [
      {
        title: "Upper 1 | Press-row base",
        dayType: "training",
        summary: "Heavy enough to matter, short enough to finish in about 50 minutes.",
        details: [
          "Incline press 3 x 6-8",
          "Chest-supported row 3 x 8-10",
          "Flat press 3 x 8-10",
          "Lat pulldown 3 x 8-12",
          "Lateral raise + rope pressdown",
        ],
      },
      {
        title: "Lower 1 | Squat hinge base",
        dayType: "training",
        summary: "Lower-body base day built around simple compounds and enough posterior-chain work to keep shape balanced.",
        details: [
          "Hack squat or leg press 4 x 8-10",
          "Romanian deadlift 3 x 8-10",
          "Leg curl 3 x 10-12",
          "Walking lunge 2 x 10 each leg",
          "Cable crunch 3 x 12-15",
        ],
      },
      {
        title: "LISS + mobility",
        dayType: "conditioning",
        summary: "Moderate cardio day to support the fat-loss pace without beating up leg recovery.",
        details: [
          "25 minutes incline treadmill or bike",
          "10k steps floor",
          "5-8 minutes of hip, ankle, and thoracic mobility",
        ],
      },
      {
        title: "Upper 2 | Hypertrophy and shape",
        dayType: "training",
        summary: "Slightly higher-rep upper day to improve tone and keep volume balanced.",
        details: [
          "Machine chest press 3 x 10-12",
          "Neutral pulldown 3 x 10-12",
          "Single-arm cable row 3 x 10-12",
          "Machine shoulder press 2 x 8-10",
          "Rear delt + curl + pressdown finish",
        ],
      },
      {
        title: "Lower 2 | Single-leg + posterior chain",
        dayType: "training",
        summary: "Lower-body follow-up day with slightly less loading and better recovery control heading into the weekend.",
        details: [
          "Smith squat or pendulum/hack variation 3 x 8-10",
          "Back extension or hip hinge 3 x 10-12",
          "Split squat 3 x 8 each leg",
          "Seated leg curl 3 x 12-15",
          "Calf raise 3 x 10-15",
        ],
      },
      {
        title: "LISS + steps",
        dayType: "conditioning",
        summary: "Second intentional cardio slot of the week. Keep it moderate and repeatable.",
        details: [
          "25 minutes incline treadmill or bike",
          "10k steps minimum",
          "Short mobility reset if lower body feels stiff",
        ],
      },
      {
        title: "Recovery walk",
        dayType: "recovery",
        summary: "Keep movement up without forcing a makeup session.",
        details: [
          "10k steps minimum",
          "Hydration and meal structure stay on plan",
          "No random extra conditioning",
        ],
      },
    ],
    trainingSubtitle:
      "Four 50-minute sessions built to tighten the waist, improve overall tone, and make progress predictable rather than random.",
    trainingMetrics: [
      { label: "Goal", value: "Lose 5-10 lb while keeping shape" },
      { label: "Schedule", value: "4 lifts + 3 cardio exposures" },
      { label: "Equipment", value: "Commercial gym / LA Fitness" },
      { label: "Start", value: startDate },
    ],
    trainingSections: [
      {
        heading: "Block objective",
        paragraphs: [
          `${memberName}, the target here is simple: drop 5-10 lb, look tighter, and do it through a schedule you can actually repeat instead of constantly starting over.`,
          "You already move a decent amount. The main upgrade is turning your four full-body sessions into a cleaner structure that lets you progress and recover better.",
        ],
      },
      {
        heading: "Weekly rhythm",
        bullets: [
          "Monday: Upper 1 | press-row base",
          "Tuesday: Lower 1 | squat hinge base",
          "Wednesday: LISS + mobility",
          "Thursday: Upper 2 | hypertrophy and shape",
          "Friday: Lower 2 | single-leg + posterior chain",
          "Saturday: LISS + steps",
          "Sunday: Recovery walk",
        ],
      },
      {
        heading: "Execution rules",
        bullets: [
          "Stay around 1-2 reps in reserve on the first big press, row, squat, and hinge of the session.",
          "Because sessions are capped around 50 minutes, move efficiently between exercises instead of adding extra fluff work.",
          "Beat the rep range first. Once the full prescribed range is owned for every set, add a small amount of load next exposure.",
          "Cardio days are productive but controlled. They are not punishment sessions.",
        ],
      },
      {
        heading: "Upper 1",
        bullets: [
          "Incline press: 3 x 6-8",
          "Chest-supported row: 3 x 8-10",
          "Flat press: 3 x 8-10",
          "Lat pulldown: 3 x 8-12",
          "Cable lateral raise: 2 x 12-20",
          "Rope pressdown: 3 x 10-15",
          "EZ-bar curl: 3 x 10-12",
        ],
      },
      {
        heading: "Lower 1",
        bullets: [
          "Hack squat or leg press: 4 x 8-10",
          "Romanian deadlift: 3 x 8-10",
          "Leg curl: 3 x 10-12",
          "Walking lunge: 2 x 10 each leg",
          "Standing calf raise: 3 x 10-15",
          "Cable crunch: 3 x 12-15",
        ],
      },
      {
        heading: "Upper 2",
        bullets: [
          "Machine chest press: 3 x 10-12",
          "Neutral-grip pulldown: 3 x 10-12",
          "Single-arm cable row: 3 x 10-12 each side",
          "Machine shoulder press: 2 x 8-10",
          "Reverse pec deck: 2 x 15-20",
          "Cable curl + rope pressdown: 3 x 12-15 each",
        ],
      },
      {
        heading: "Lower 2",
        bullets: [
          "Smith squat or machine squat pattern: 3 x 8-10",
          "Back extension or hinge accessory: 3 x 10-12",
          "Split squat: 3 x 8 each leg",
          "Seated leg curl: 3 x 12-15",
          "Calf raise: 3 x 10-15",
          "Short incline walk finisher only if session time allows",
        ],
      },
      {
        heading: "Progression and coach review",
        bullets: [
          "Keep the assigned structure stable until I update it.",
          "Do not make nutrition or cardio changes on your own. Log the trend and flag it in the portal so I can review the full picture.",
          "If lifts are regressing hard while compliance is good, log the details clearly so recovery can be reviewed.",
        ],
      },
    ],
    nutritionSubtitle:
      "Macro-tracked lean-out setup that supports four solid workouts per week without dragging food lower than needed.",
    nutritionModeLabel: "Macro tracking with MyFitnessPal",
    macroTargets: {
      calories: 1900,
      protein: 170,
      carbs: 180,
      fats: 55,
    },
    nutritionSections: [
      {
        heading: "Starting setup",
        paragraphs: [
          "At 168 lb, 5'9, on your feet often, and already clearing roughly 10k steps, the most useful move is a controlled deficit with moderate cardio rather than an aggressive crash.",
          `The starting target is ${formatMacroTargets({
            calories: 1900,
            protein: 170,
            carbs: 180,
            fats: 55,
          })}. That keeps training performance and adherence in a good place while fat loss runs at a steady pace.`,
        ],
      },
      {
        heading: "Macro execution",
        bullets: [
          "Distribute protein across 4 feedings instead of saving too much for dinner.",
          "Keep a decent share of carbs in the pre- and post-workout meals so the gym sessions stay productive.",
          "Use simpler weekday meals and repeat them. Repetition beats constantly re-entering new foods.",
          "Do not guess on oils, sauces, or restaurant add-ons.",
        ],
      },
      buildMacroPrioritySection(),
      {
        heading: "Example day",
        bullets: [
          "Meal 1: Eggs or egg whites, oats or toast, fruit.",
          "Meal 2: Chicken, rice, vegetables, and one measured fat source.",
          "Meal 3: Lean beef or turkey wrap/bowl with potatoes or rice.",
          "Meal 4: Post-workout or dinner meal with lean protein, carb source, vegetables.",
          "Use whey isolate only if the protein number is short, not as extra casual calories.",
        ],
      },
      buildHighVolumeFoodSection({ mode: "macro" }),
      {
        heading: "Non-negotiables",
        bullets: [
          "No untracked drinks, sauces, or “healthy” snack adds.",
          "Weekend meals still fit the macros.",
          "Cardio does not buy sloppy eating.",
        ],
      },
    ],
    supplementSubtitle:
      "Minimal stack that supports recovery, hydration, and training output without relying on gimmicks.",
    supplementMetrics: [
      { label: "Hydration floor", value: "100-110 oz daily" },
      { label: "Cardio", value: "3 x 25 min + 10k steps" },
      { label: "Sleep target", value: "7 hours whenever possible" },
      { label: "Nutrition mode", value: "Macro tracking" },
    ],
    supplementSections: [
      {
        heading: "Core stack",
        bullets: buildSupplementBullets([
          {
            name: "Creatine monohydrate",
            dose: "5 g daily",
            timing: "Any consistent time",
            purpose: "Supports strength output and lean-mass retention during the cut.",
          },
          {
            name: "Whey isolate",
            dose: "1 scoop as needed",
            timing: "When food alone will not hit protein",
            purpose: "Keeps the 170 g protein target easy to reach.",
          },
          {
            name: "Caffeine",
            dose: "100-200 mg optional",
            timing: "30-45 minutes pre-lift",
            purpose: "Useful on lower-energy days if it does not disrupt sleep.",
          },
          {
            name: "Fish oil",
            dose: "1-2 g EPA/DHA",
            timing: "With meals",
            purpose: "Reasonable insurance if fatty fish intake is inconsistent.",
          },
        ]),
      },
      {
        heading: "Hydration and recovery",
        bullets: [
          "100-110 oz water daily is the floor. Sweat and cardio days may need more.",
          "Sleep was listed at 5-7 hours, so the best recovery upgrade is consistency at night rather than more supplements.",
          "If energy is flat, check hydration and sleep before assuming calories need to change.",
        ],
      },
      {
        heading: "Execution notes",
        bullets: [
          "Take the stack daily. Inconsistent supplementation is just mental clutter.",
          "Do not use pre-workout stimulants to paper over a bad sleep pattern every day.",
        ],
      },
    ],
    instructionSubtitle:
      "Use the portal to keep the plan measurable, quick to review, and easy to adjust.",
    instructionSections: buildCommonInstructionSections({
      memberName,
      nutritionModeLabel: "Macro tracking with MyFitnessPal",
      extraBullets: [
        "When you leave workout notes, include whether the 50-minute cap was realistic or whether one part of the day kept running long.",
        "If workdays on your feet spike higher than usual, mention it so fatigue is interpreted correctly.",
      ],
    }),
  };
}

function buildLeonardProfile(source: PackSource): ClientPackProfile {
  const memberName = source.member.fullName;
  const startDate =
    source.application.payload.preferredStartDate?.trim() || "2026-06-15";

  return {
    planTitleSuffix: "6-Week Fat-Loss Block",
    planSummary:
      "Six-week commercial-gym fat-loss block built around a laid-out meal plan, a physically active job, and a cleaner training structure than the current improvised split.",
    cadence:
      "5 structured training slots, 3 moderate cardio pieces, 10k daily steps minimum, and a meal-plan-first approach with backup macros.",
    notes:
      "Generated from Leonard's intake with a meal-plan preference, on-feet daily activity, and a commercial-gym cut goal.",
    startDate,
    quickSections: {
      training:
        "Five-day rhythm with two upper days, two lower days, and one pull-focused day tied to steady cardio instead of random extra work.",
      nutrition:
        "Primary system is a laid-out meal plan built around roughly 1,950 kcal with a backup target of 180 g protein, 180 g carbs, and 60 g fat.",
      supplements:
        "Creatine 5 g daily, fish oil, multivitamin, and protein powder only as a convenience tool.",
      cardio:
        "10k steps minimum plus 3 x 20-25 minute treadmill LISS sessions each week. Cardio stays moderate and repeatable.",
      misc:
        "Keep meals repetitive, log daily markers, and use the portal calendar to see exactly what training lands each day of the week.",
    },
    scheduleTemplates: [
      {
        title: "Upper 1 | Press emphasis",
        dayType: "training",
        summary: "First upper day of the week focused on controlled pressing, chest fullness, and arm work.",
        details: [
          "Incline machine or smith press 4 x 6-10",
          "Flat machine press 3 x 8-10",
          "Cable fly 2 x 12-15",
          "Lateral raise 3 x 12-20",
          "Pressdown + curl finisher",
        ],
      },
      {
        title: "Lower 1 | Quad-biased",
        dayType: "training",
        summary: "First lower session built around straightforward compounds and controlled fatigue.",
        details: [
          "Hack squat or smith squat 4 x 6-10",
          "Leg press 3 x 10-12",
          "Leg curl 3 x 10-12",
          "Walking lunge 2 x 10 each leg",
          "Standing calf raise 3 x 10-15",
        ],
      },
      {
        title: "Pull + treadmill",
        dayType: "training",
        summary: "Back-focused day followed by the first formal LISS piece of the week.",
        details: [
          "Lat pulldown 4 x 8-12",
          "Seated row 3 x 8-12",
          "Chest-supported row 3 x 10-12",
          "Rear delt work 3 x 15-20",
          "Treadmill LISS 20-25 minutes",
        ],
      },
      {
        title: "Recovery walk + mobility",
        dayType: "recovery",
        summary: "Movement stays high, fatigue stays low, and meal structure remains unchanged.",
        details: [
          "10k steps minimum",
          "Hip and thoracic mobility",
          "No compensation cardio for random scale swings",
        ],
      },
      {
        title: "Upper 2 | Hypertrophy",
        dayType: "training",
        summary: "Second upper day with a slightly higher-rep bias to keep the look full while the cut runs.",
        details: [
          "Machine chest press 3 x 10-12",
          "Neutral pulldown 3 x 10-12",
          "Single-arm cable row 3 x 10-12",
          "Machine shoulder press 2 x 8-10",
          "Arms and rear-delt finish",
        ],
      },
      {
        title: "Lower 2 | Posterior chain + treadmill",
        dayType: "training",
        summary: "Posterior-chain lower session plus the second formal treadmill piece.",
        details: [
          "Romanian deadlift 4 x 8-10",
          "Leg press or split squat 3 x 10-12",
          "Seated leg curl 3 x 12-15",
          "Back extension 3 x 12-15",
          "Treadmill LISS 20-25 minutes",
        ],
      },
      {
        title: "Recovery walk + steps",
        dayType: "conditioning",
        summary: "Third cardio exposure is just a cleaner step day, not a heroic extra workout.",
        details: [
          "10k+ steps",
          "Optional easy treadmill 20 minutes only if step total is low",
          "Food structure stays exactly on plan",
        ],
      },
    ],
    trainingSubtitle:
      "Straightforward cut-phase setup for a commercial gym: more structure than “same as yours,” more consistency than random hard days.",
    trainingMetrics: [
      { label: "Goal", value: "Commercial-gym fat-loss cut" },
      { label: "Schedule", value: "5 sessions + moderate cardio" },
      { label: "Equipment", value: "Commercial gym" },
      { label: "Start", value: startDate },
    ],
    trainingSections: [
      {
        heading: "Block objective",
        paragraphs: [
          `${memberName}, the goal is a clean fat-loss phase, not an overcomplicated prep-style setup. Because you are already on your feet a lot and already doing steps, this plan tightens the structure instead of piling on chaos.`,
          "The gym plan also needs to be more specific than “same as yours.” You should know exactly what the day is and what progression is being chased.",
        ],
      },
      {
        heading: "Weekly rhythm",
        bullets: [
          "Monday: Upper 1 | press emphasis",
          "Tuesday: Lower 1 | quad-biased",
          "Wednesday: Pull + treadmill",
          "Thursday: Recovery walk + mobility",
          "Friday: Upper 2 | hypertrophy",
          "Saturday: Lower 2 | posterior chain + treadmill",
          "Sunday: Recovery walk + steps",
        ],
      },
      {
        heading: "Execution rules",
        bullets: [
          "First compounds live around 1-2 RIR. Isolation work can push harder, especially later in the session.",
          "Because your job already keeps movement high, cardio stays moderate and deliberate instead of aggressive.",
          "Progress reps first. Once the full rep range is owned, increase load slightly the next week.",
          "Keep the exercise menu stable for the full block unless pain or equipment issues force a real change.",
        ],
      },
      {
        heading: "Upper 1",
        bullets: [
          "Incline machine or smith press: 4 x 6-10",
          "Flat machine press: 3 x 8-10",
          "Cable fly: 2 x 12-15",
          "Cable lateral raise: 3 x 12-20",
          "Rope pressdown: 3 x 10-15",
          "EZ-bar curl: 3 x 10-12",
        ],
      },
      {
        heading: "Lower 1",
        bullets: [
          "Hack squat or smith squat: 4 x 6-10",
          "Leg press: 3 x 10-12",
          "Seated leg curl: 3 x 10-12",
          "Walking lunge: 2 x 10 each leg",
          "Standing calf raise: 3 x 10-15",
        ],
      },
      {
        heading: "Pull day",
        bullets: [
          "Lat pulldown: 4 x 8-12",
          "Seated cable row: 3 x 8-12",
          "Chest-supported row: 3 x 10-12",
          "Rear-delt machine or cable: 3 x 15-20",
          "Hammer curl: 2 x 10-12",
          "Treadmill LISS: 20-25 minutes",
        ],
      },
      {
        heading: "Upper 2 and lower 2",
        bullets: [
          "Upper 2 keeps a higher-rep hypertrophy bias to preserve fullness while bodyweight trends down.",
          "Lower 2 is posterior-chain dominant: Romanian deadlift, leg press or split squat, seated curl, back extension.",
          "Saturday also carries the second formal treadmill piece of the week.",
        ],
      },
      {
        heading: "Progression and stalls",
        bullets: [
          "Keep the assigned plan stable instead of reacting to one mirror check or one weigh-in.",
          "Do not make nutrition or cardio changes on your own. Log stalls clearly so I can review the plan.",
          "If work stress or step count spikes hard, report it so fatigue is interpreted correctly during review.",
        ],
      },
    ],
    nutritionSubtitle:
      "Meal-plan-first cut setup built for a physically active day and a straightforward, repeatable food structure.",
    nutritionModeLabel: "Specific meal plan laid out",
    macroTargets: {
      calories: 1950,
      protein: 180,
      carbs: 180,
      fats: 60,
    },
    nutritionSections: [
      {
        heading: "Starting setup",
        paragraphs: [
          "Because you specifically asked for a laid-out meal plan, the exact meals are the primary system and the macros are the backup reference.",
          `The food layout is built around roughly ${formatMacroTargets({
            calories: 1950,
            protein: 180,
            carbs: 180,
            fats: 60,
          })}, which fits a cut for your current body size, on-feet job, and moderate cardio preference.`,
        ],
      },
      {
        heading: "Primary meal plan",
        bullets: [
          "Meal 1: 4 egg whites + 2 whole eggs, 60 g dry oats, berries or fruit.",
          "Meal 2: 6 oz chicken, fish, or goat, 180 g cooked rice, vegetables.",
          "Meal 3: 6 oz chicken, fish, or goat, 250 g potato or 150-180 g cooked rice, vegetables or salad.",
          "Meal 4: Protein shake plus fruit around training if needed for convenience.",
          "Meal 5: 6 oz lean protein, vegetables, and a measured fat source. Keep carbs here lower on non-training evenings if earlier meals already covered them.",
        ],
      },
      {
        heading: "Backup macro target",
        bullets: [
          "If a meal has to change, keep the day near 180 g protein, 180 g carbs, and 60 g fat.",
          "Protein swaps: chicken, white fish, salmon adjusted for fat, goat, extra-lean beef.",
          "Carb swaps: rice, potatoes, oats, sourdough, fruit.",
          "Fat swaps: whole eggs, avocado, olive oil, fattier fish portions.",
        ],
      },
      buildMacroPrioritySection(),
      buildHighVolumeFoodSection({ mode: "meal-plan" }),
      {
        heading: "Non-negotiables",
        bullets: [
          "No off-plan snacks between meals.",
          "Do not let restaurant meals become “close enough” guesses multiple times a week.",
          "Meal repetition is part of the tool here, not a flaw in the plan.",
        ],
      },
    ],
    supplementSubtitle:
      "Straightforward supplement stack that supports the cut without distracting from the real work: training, food, and steps.",
    supplementMetrics: [
      { label: "Hydration floor", value: "110-120 oz daily" },
      { label: "Cardio", value: "10k steps + 3 LISS pieces" },
      { label: "Sleep target", value: "7-8 hours" },
      { label: "Nutrition mode", value: "Meal plan first" },
    ],
    supplementSections: [
      {
        heading: "Core stack",
        bullets: buildSupplementBullets([
          {
            name: "Creatine monohydrate",
            dose: "5 g daily",
            timing: "Any consistent time",
            purpose: "Supports strength and lean-mass retention while bodyweight comes down.",
          },
          {
            name: "Fish oil",
            dose: "1-2 g EPA/DHA",
            timing: "With meals",
            purpose: "Supports general health if fatty fish intake is inconsistent.",
          },
          {
            name: "Multivitamin",
            dose: "1 serving daily",
            timing: "With food",
            purpose: "Simple coverage while the meal plan stays repetitive.",
          },
          {
            name: "Protein powder",
            dose: "1 serving as needed",
            timing: "When convenience matters",
            purpose: "Keeps the meal plan practical without turning into random extra calories.",
          },
        ]),
      },
      {
        heading: "Hydration and execution",
        bullets: [
          "With an on-feet job and 10k steps, hydration needs to be aggressive enough that training quality does not slide.",
          "110-120 oz water daily is the working floor. Salt meals consistently rather than being extremely low one day and very high the next.",
          "Only keep extra calcium in if it was recommended for a specific reason. It is not a required default add-on here.",
        ],
      },
      {
        heading: "Optional support",
        bullets: [
          "A simple caffeine hit pre-lift is fine if sleep quality remains stable.",
          "Do not keep adding supplements when the real issue is food execution or missed cardio.",
        ],
      },
    ],
    instructionSubtitle:
      "Use the portal to keep a repetitive, well-controlled cut even when workdays vary.",
    instructionSections: buildCommonInstructionSections({
      memberName,
      nutritionModeLabel: "Specific meal plan laid out",
      extraBullets: [
        "If a workday changes meal timing, report what moved instead of silently swapping the whole day off plan.",
        "When treadmill work feels harder than expected, note whether the issue was fatigue, sleep, or step count from work.",
      ],
    }),
  };
}

function buildSelenaProfile(source: PackSource): ClientPackProfile {
  const memberName = source.member.fullName;
  const startDate =
    source.application.payload.preferredStartDate?.trim() || "2026-06-22";

  return {
    planTitleSuffix: "6-Week Wedding Lean-Out Block",
    planSummary:
      "Six-week adherence-first fat-loss phase built to tighten things up for Selena's wedding without depending on random vibes or all-or-nothing motivation.",
    cadence:
      "3 lifting days, 3 planned cardio exposures, 8k-10k daily steps, and a simple macro setup that prioritizes consistency over perfectionism.",
    notes:
      "Generated from Selena's intake with a wedding deadline, beginner/inconsistent training background, macro tracking preference, and the choice to lean slightly more on cardio than ultra-low calories.",
    startDate,
    quickSections: {
      training:
        "Three lifting days with a simple full-body/lower/upper split so the schedule feels easy to repeat instead of overwhelming.",
      nutrition:
        "Start at 1,610 kcal with 140 g protein, 155 g carbs, and 50 g fat. Macro tracking stays primary, with repeatable meals and pre-logging used to cut decision fatigue.",
      supplements:
        "Keep the stack minimal: creatine, whey only if needed, multivitamin, and optional magnesium for sleep support.",
      cardio:
        "8k steps minimum moving toward 9-10k, plus 3 x 25-30 minute incline-walk sessions each week.",
      misc:
        "Daily logging and the calendar matter here because consistency, not intensity spikes, is what will tighten things up by the wedding.",
    },
    scheduleTemplates: [
      {
        title: "Full body A",
        dayType: "training",
        summary: "Straightforward whole-body lift to build rhythm and cover the main movement patterns cleanly.",
        details: [
          "Leg press or squat pattern 3 x 8-10",
          "Chest press 3 x 8-10",
          "Pulldown 3 x 10-12",
          "Romanian deadlift 3 x 8-10",
          "Cable lateral raise + cable crunch",
        ],
      },
      {
        title: "Incline walk + core",
        dayType: "conditioning",
        summary: "First formal cardio day. Moderate pace, no burnout approach.",
        details: [
          "Incline treadmill 25-30 minutes",
          "8k-10k total steps",
          "Cable crunch + dead bug or plank",
        ],
      },
      {
        title: "Lower body + glutes",
        dayType: "training",
        summary: "Lower-body emphasis day to build shape while the fat-loss phase runs.",
        details: [
          "Hip thrust or glute bridge 4 x 8-10",
          "Hack squat or goblet/smith squat 3 x 8-10",
          "Split squat 3 x 8 each leg",
          "Leg curl 3 x 10-12",
          "Calf raise 3 x 12-15",
        ],
      },
      {
        title: "Recovery walk",
        dayType: "recovery",
        summary: "Keep movement high and the diet clean without trying to do extra for the sake of it.",
        details: [
          "8k-10k steps",
          "Mobility or easy stretch 5-10 minutes",
          "No skipped meals followed by night snacking",
        ],
      },
      {
        title: "Upper body + glute accessories",
        dayType: "training",
        summary: "Upper-body shaping day with a small glute touch so the week still feels balanced.",
        details: [
          "Machine chest press 3 x 10-12",
          "Seated cable row 3 x 10-12",
          "Shoulder press machine 2 x 8-10",
          "Pulldown 2 x 10-12",
          "Cable kickback + lateral raise finish",
        ],
      },
      {
        title: "Incline walk + mobility",
        dayType: "conditioning",
        summary: "Second formal cardio day with a mobility reset to keep the week sustainable.",
        details: [
          "Incline treadmill 25-30 minutes",
          "8k-10k total steps",
          "5-8 minutes mobility",
        ],
      },
      {
        title: "Recovery or outdoor walk",
        dayType: "conditioning",
        summary: "Low-pressure movement day to keep adherence high.",
        details: [
          "Outdoor walk or light treadmill 30 minutes",
          "Meal plan structure stays intact",
          "Review next week's calendar so nothing is done “on vibes”",
        ],
      },
    ],
    trainingSubtitle:
      "Simple, adherence-first wedding lean-out plan built for someone who needs structure more than complexity.",
    trainingMetrics: [
      { label: "Goal", value: "Wedding-focused fat loss" },
      { label: "Schedule", value: "3 lifts + 3 cardio exposures" },
      { label: "Equipment", value: "Commercial gym" },
      { label: "Start", value: startDate },
    ],
    trainingSections: [
      {
        heading: "Block objective",
        paragraphs: [
          `${memberName}, this block is about getting consistently tighter for the wedding without trying to become a full-time gym person overnight.`,
          "Your intake said training has been done “on vibes.” So the win here is simple repeatability: know the day, hit the day, log the day, repeat the week.",
        ],
      },
      {
        heading: "Weekly rhythm",
        bullets: [
          "Monday: Full body A",
          "Tuesday: Incline walk + core",
          "Wednesday: Lower body + glutes",
          "Thursday: Recovery walk",
          "Friday: Upper body + glute accessories",
          "Saturday: Incline walk + mobility",
          "Sunday: Recovery or outdoor walk",
        ],
      },
      {
        heading: "Execution rules",
        bullets: [
          "Keep compound lifts around 1-2 RIR. This is enough intensity to improve without making consistency harder.",
          "The goal is not to cram in extra exercises because motivation feels high one day.",
          "Every workout should feel clear and finishable. Success here comes from stacking good weeks, not random perfect days.",
          "Cardio stays moderate. It supports the pace, but it should not leave you dreading the week.",
        ],
      },
      {
        heading: "Full body A",
        bullets: [
          "Leg press or squat pattern: 3 x 8-10",
          "Machine chest press: 3 x 8-10",
          "Lat pulldown: 3 x 10-12",
          "Romanian deadlift: 3 x 8-10",
          "Cable lateral raise: 2 x 12-15",
          "Cable crunch: 3 x 12-15",
        ],
      },
      {
        heading: "Lower body + glutes",
        bullets: [
          "Hip thrust or glute bridge: 4 x 8-10",
          "Wide stance leg press: 3 x 8-10",
          "Split squat: 3 x 8 each leg",
          "Leg curl: 3 x 10-12",
          "Calf raise: 3 x 12-15",
        ],
      },
      {
        heading: "Upper body + glute accessories",
        bullets: [
          "Machine chest press: 3 x 10-12",
          "Seated cable row: 3 x 10-12",
          "Machine shoulder press: 2 x 8-10",
          "Neutral pulldown: 2 x 10-12",
          "Cable kickback: 2 x 15-20",
          "Cable lateral raise: 2 x 15-20",
        ],
      },
      {
        heading: "Progression and stalls",
        bullets: [
          "Weeks 1-2 build comfort and consistency. Weeks 3-4 push the rep ranges. Weeks 5-6 add load only where the movement is already owned.",
          "If you're having trouble sticking to the plan, just let me know - we will adjust.",
          "Do not make nutrition or cardio changes on your own. Keep logging cleanly so I can review the plan if needed.",
        ],
      },
    ],
    nutritionSubtitle:
      "Simple macro-tracking setup that reduces decision fatigue and keeps the wedding phase moving without extremes.",
    nutritionModeLabel: "Macro tracking with MyFitnessPal",
    macroTargets: {
      calories: 1610,
      protein: 140,
      carbs: 155,
      fats: 50,
    },
    nutritionSections: [
      {
        heading: "Starting setup",
        paragraphs: [
          "The best starting move here is not a huge calorie drop. It is a clean structure you can actually run consistently.",
          `The opening target is ${formatMacroTargets({
            calories: 1610,
            protein: 140,
            carbs: 155,
            fats: 50,
          })}. That keeps the cut moving while still leaving enough food for lifting and cardio.`,
        ],
      },
      {
        heading: "How to make the macros easier",
        bullets: [
          "Pre-log the day in MyFitnessPal earlier in the day so you are not improvising at night.",
          "Repeat breakfast and one lunch option most weekdays to cut down decisions.",
          "Build meals around lean protein first, then add a measured carb source and vegetables.",
          "If eating out, choose the protein source first and keep extras controlled.",
        ],
      },
      buildMacroPrioritySection(),
      {
        heading: "Example day",
        bullets: [
          "Meal 1: Eggs or Greek yogurt, fruit, and a controlled carb source.",
          "Meal 2: Chicken, rice or potatoes, vegetables.",
          "Meal 3: Lean protein, salad or vegetables, and another measured carb source.",
          "Meal 4: Protein shake or yogurt only if needed to finish the protein target.",
        ],
      },
      buildHighVolumeFoodSection({ mode: "macro" }),
      {
        heading: "Non-negotiables",
        bullets: [
          "No “I was good all day” snacking at night.",
          "Track oils, sauces, coffee add-ins, and restaurant extras.",
          "The wedding timeline is short enough that consistency matters more than variety.",
        ],
      },
    ],
    supplementSubtitle:
      "Minimal, practical supplement setup that supports consistency and recovery without adding complexity.",
    supplementMetrics: [
      { label: "Hydration floor", value: "90-100 oz daily" },
      { label: "Cardio", value: "3 x 25-30 min + 8k-10k steps" },
      { label: "Sleep target", value: "Push toward 7+ hours" },
      { label: "Nutrition mode", value: "Macro tracking" },
    ],
    supplementSections: [
      {
        heading: "Core stack",
        bullets: buildSupplementBullets([
          {
            name: "Creatine monohydrate",
            dose: "5 g daily",
            timing: "Any consistent time",
            purpose: "Supports training performance and lean-mass retention.",
          },
          {
            name: "Whey isolate",
            dose: "1 scoop as needed",
            timing: "Only if the protein target is short",
            purpose: "Makes the 140 g protein target easier to hit cleanly.",
          },
          {
            name: "Multivitamin",
            dose: "1 serving daily",
            timing: "With a meal",
            purpose: "Basic coverage while calories are controlled.",
          },
          {
            name: "Magnesium glycinate",
            dose: "200-400 mg optional",
            timing: "At night",
            purpose: "Can support sleep quality if evenings are inconsistent.",
          },
        ]),
      },
      {
        heading: "Hydration and recovery",
        bullets: [
          "Hydration has to be logged daily. Aim for 90-100 oz and note when that slips.",
          "Because sleep was listed at 5-6 hours, the biggest recovery upgrade is bedtime consistency, not more stimulants.",
          "Cardio gets much harder to recover from when water and sleep are off. Those basics matter here.",
        ],
      },
      {
        heading: "Execution notes",
        bullets: [
          "Keep the stack simple and repeatable.",
          "Do not add random fat burners or detox products. They are not the lever that matters here.",
        ],
      },
    ],
    instructionSubtitle:
      "Use the calendar and daily logs so the wedding phase runs from structure, not guesswork.",
    instructionSections: buildCommonInstructionSections({
      memberName,
      nutritionModeLabel: "Macro tracking with MyFitnessPal",
      extraBullets: [
        "If a week starts feeling too chaotic, message early so the plan can be simplified instead of skipped.",
        "Use workout notes to say whether a session felt clear and manageable or whether the plan felt confusing anywhere.",
      ],
    }),
  };
}

function buildJiteshLegacyMismatchMessage() {
  return "The generic workflow should delegate to the legacy Jitesh generator for this member.";
}

function resolveSupportedProfile(source: PackSource) {
  const email = normalizeEmail(source.member.email);

  if (email === "onopabd@gmail.com") {
    return buildBrendaProfile(source);
  }

  if (email === "dan_r_marks@yahoo.com") {
    return buildDanielProfile(source);
  }

  if (email === "bonusleonard@gmail.com") {
    return buildLeonardProfile(source);
  }

  if (email === "selegarcia59@yahoo.com") {
    return buildSelenaProfile(source);
  }

  throw new Error("No intake-to-pack blueprint is configured for this client yet.");
}

export async function generateCoachingPack(options: {
  db: AppDb;
  coachId: string;
  applicationId?: string;
  memberId?: string;
  tempPassword?: string;
}): Promise<CoachingPackGenerationResult> {
  if (!options.applicationId && !options.memberId) {
    throw new Error("A memberId or applicationId is required.");
  }

  const tempPassword =
    options.tempPassword?.trim() || DEFAULT_GENERATED_MEMBER_PASSWORD;
  const resolved =
    typeof options.applicationId === "string" && options.applicationId.trim().length
      ? await findPackSourceForApplication(
          options.db,
          options.applicationId,
          tempPassword,
        )
      : await findPackSourceForMember(options.db, options.memberId || "");

  if (resolved.source.member.id === JITESH_MEMBER_ID) {
    const legacyResult = await generateJiteshCoachingPackForMember({
      db: options.db,
      memberId: resolved.source.member.id,
      coachId: options.coachId,
    });

    return {
      memberId: resolved.source.member.id,
      memberCreated: resolved.memberCreated,
      memberEmail: resolved.source.member.email,
      memberName: resolved.source.member.fullName,
      ...legacyResult,
    };
  }

  if (options.memberId === JITESH_MEMBER_ID && resolved.source.member.id !== JITESH_MEMBER_ID) {
    throw new Error(buildJiteshLegacyMismatchMessage());
  }

  const profile = resolveSupportedProfile(resolved.source);
  const pack = await buildGeneratedCoachingPack(resolved.source, profile);
  const result = await upsertGeneratedPack({
    db: options.db,
    memberId: resolved.source.member.id,
    coachId: options.coachId,
    pack,
  });

  return {
    memberId: resolved.source.member.id,
    memberCreated: resolved.memberCreated,
    memberEmail: resolved.source.member.email,
    memberName: resolved.source.member.fullName,
    ...result,
  };
}

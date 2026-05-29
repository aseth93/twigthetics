import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import {
  billingAccounts,
  coachingApplicationAttachments,
  coachingApplications,
  conversations,
  documentAccess,
  documents,
  messages,
  planAssignments,
  plans,
  users,
} from "@/db/schema";
import { getPortalViewer } from "@/lib/portal/auth";
import { serializePlanSections } from "@/lib/portal/plan-sections";
import { hashPassword, normalizeEmail } from "@/lib/portal/users";

const demoMemberPassword = "MemberDemo123!";

type DemoMemberSeed = {
  fullName: string;
  email: string;
  instagramHandle: string;
  age: string;
  weight: string;
  height: string;
  gender: string;
  goalDescription: string;
  trainingAvailability: string;
  dailyActivity: string;
  nutritionStyle: string;
  mealPlanFoods?: string;
  cardioPreference: string;
  currentTrainingPlan: string;
  pedHistory: string;
  otcSupplements: string;
  injuriesAndExerciseResponse: string;
  preferredStartDate: string;
  currentCardioAndSteps: string;
  foodRestrictions: string;
  sleepAndStress: string;
  gymAccess: string;
  billingStatus: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  planName: string;
  documentTitle: string;
  documentDescription: string;
  planTitle: string;
  planSummary: string;
  planCadence: string;
  planSections: {
    training: string;
    nutrition: string;
    supplements: string;
    cardio: string;
    misc: string;
  };
  planNotes: string;
  messages: [string, string];
};

const demoMembers: DemoMemberSeed[] = [
  {
    fullName: "Jordan Avery",
    email: "jordan.demo@twigthetics.com",
    instagramHandle: "@jordan.avery",
    age: "29",
    weight: "184 lb",
    height: "5'11\"",
    gender: "Male",
    goalDescription:
      "I want to stay lean year-round, keep visible abs, and look athletic without having to run a hardcore cut every few months.",
    trainingAvailability: "4 days/week, 75 minutes per session",
    dailyActivity: "Some walking during the day",
    nutritionStyle: "Track calories/macros with MyFitnessPal",
    cardioPreference: "Eat more + do more cardio",
    currentTrainingPlan:
      "Upper/lower split with 2 upper sessions, 2 lower sessions, and a separate arm finisher day when time allows.",
    pedHistory: "",
    otcSupplements: "Creatine, whey isolate, caffeine, fish oil, vitamin D",
    injuriesAndExerciseResponse:
      "Right shoulder gets irritated on aggressive overhead pressing. Hack squat and chest-supported row feel best.",
    preferredStartDate: "2026-06-15",
    currentCardioAndSteps: "9-10k steps/day, 2 incline treadmill sessions each week.",
    foodRestrictions:
      "No allergies. Prefer not to rely on dairy-heavy meal plans because digestion gets rough.",
    sleepAndStress:
      "Usually 7 hours. Stress is moderate because of work travel twice a month.",
    gymAccess:
      "Full commercial gym with cables, hack squat, pendulum squat, and cardio machines.",
    billingStatus: "active",
    planName: "Twigthetics Lean Athletic Coaching",
    documentTitle: "Jordan Week 1 Execution Guide",
    documentDescription:
      "Cardio target, check-in format, and first-week training priorities.",
    planTitle: "Jordan Lean Recomp Block",
    planSummary: "Keep him lean while pushing upper-body fullness and leg detail.",
    planCadence: "4 lifts, 2 cardio sessions, 9-10k steps",
    planSections: {
      training:
        "Day 1: Upper strength\nDay 2: Lower bias quads\nDay 3: Rest + steps\nDay 4: Upper pump\nDay 5: Lower posterior chain",
      nutrition:
        "Macro-tracked setup with one free meal. Protein stays high daily and carbs cluster around lifting.",
      supplements:
        "Creatine daily, whey isolate as needed, fish oil, vitamin D, and caffeine pre-lift if helpful.",
      cardio: "2 incline treadmill sessions each week plus 9-10k steps daily.",
      misc:
        "Travel weeks stay on the same food structure. Progress volume before load on pressing to keep the shoulder happy.",
    },
    planNotes: "Keep the shoulder happy. Progress volume before load on pressing.",
    messages: [
      "Welcome in. First priority is getting your food structure and weekly check-in flow tight.",
      "Sounds good. I want to stay lean but still fill out my upper body more.",
    ],
  },
  {
    fullName: "Marco Santos",
    email: "marco.demo@twigthetics.com",
    instagramHandle: "@marcos.training",
    age: "35",
    weight: "198 lb",
    height: "6'0\"",
    gender: "Male",
    goalDescription:
      "I want to get back into shape, tighten my waist, and look healthy and athletic again without feeling like life revolves around prep mode.",
    trainingAvailability: "5 days/week, 60 minutes per session",
    dailyActivity: "Sedentary desk job",
    nutritionStyle: "Specific meal plan laid out for me",
    mealPlanFoods:
      "Chicken, rice, potatoes, eggs, sourdough, Greek yogurt, berries, lean beef, oats.",
    cardioPreference: "Eat less + do less cardio",
    currentTrainingPlan:
      "Push/pull/legs with inconsistent progression. Cardio happens only when motivation is high.",
    pedHistory:
      "TRT only, physician-managed, 140 mg/week for the last 18 months. No other PED history.",
    otcSupplements: "Creatine, electrolyte mix, magnesium glycinate",
    injuriesAndExerciseResponse:
      "Left knee dislikes deep barbell squats. Leg press, split squats, and hamstring curls feel strong.",
    preferredStartDate: "2026-06-22",
    currentCardioAndSteps: "6k steps/day, 1 bike session a week.",
    foodRestrictions:
      "No shellfish. Would rather repeat simple meals than track if possible.",
    sleepAndStress:
      "6.5 hours of sleep on average. Stress has been high because of work and two young kids.",
    gymAccess:
      "Commercial gym, but I sometimes train in the apartment gym when travel gets busy.",
    billingStatus: "trialing",
    planName: "Twigthetics Online Coaching",
    documentTitle: "Marco Nutrition Structure",
    documentDescription:
      "Base meal structure, swap list, and travel guardrails for the first month.",
    planTitle: "Marco Return-to-Shape Phase",
    planSummary: "Waist reduction, movement consistency, and sustainable training rhythm.",
    planCadence: "5 training days, 1-2 cardio sessions, 7-8k steps",
    planSections: {
      training:
        "Day 1: Push\nDay 2: Pull\nDay 3: Legs (knee-friendly)\nDay 4: Upper hypertrophy\nDay 5: Lower + conditioning",
      nutrition:
        "Meal plan with repeated base meals. Breakfast and lunch stay almost identical and dinner uses a swap list.",
      supplements:
        "Creatine, electrolyte mix, and magnesium glycinate. Keep the stack simple and consistent.",
      cardio: "1-2 bike or incline sessions weekly plus a push toward 7-8k steps daily.",
      misc:
        "The goal is rhythm first. Tighten sleep and consistency before pushing fatigue or aggressive deficits.",
    },
    planNotes: "Keep compliance high. Don’t chase aggressive fatigue right away.",
    messages: [
      "We’ll start by making the plan easy to repeat. Consistency first, then tighten the details.",
      "That’s exactly what I need. I just don’t want a plan I can only follow for two weeks.",
    ],
  },
];

function createDemoSvg(label: string, accent: string) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <rect width="900" height="1200" fill="#f5ede2" />
      <rect x="48" y="48" width="804" height="1104" rx="42" fill="#ffffff" stroke="${accent}" stroke-width="10" />
      <text x="450" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" letter-spacing="10" fill="#8d6b3d">TWIGTHETICS</text>
      <text x="450" y="560" text-anchor="middle" font-family="Arial, sans-serif" font-size="82" font-weight="700" fill="#171411">${label}</text>
      <text x="450" y="660" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#5f584f">Demo progress photo for admin testing</text>
    </svg>`,
    "utf8",
  );
}

export async function POST() {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "coach_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const db = await getDbReady();

  if (!db) {
    return NextResponse.json({ error: "Portal backend is not ready yet." }, { status: 503 });
  }

  const passwordHash = await hashPassword(demoMemberPassword);
  const createdNames: string[] = [];

  for (const [index, member] of demoMembers.entries()) {
    const serializedPlanBody = serializePlanSections(member.planSections);
    const email = normalizeEmail(member.email);
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user =
      existingUser ||
      (
        await db
          .insert(users)
          .values({
            email,
            fullName: member.fullName,
            passwordHash,
            role: "member",
            instagramHandle: member.instagramHandle,
            joinedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
      )[0];

    if (!user) {
      continue;
    }

    if (!existingUser) {
      createdNames.push(member.fullName);
    }

    const [existingApplication] = await db
      .select()
      .from(coachingApplications)
      .where(eq(coachingApplications.email, email))
      .limit(1);

    const application =
      existingApplication ||
      (
        await db
          .insert(coachingApplications)
          .values({
            fullName: member.fullName,
            email,
            instagramHandle: member.instagramHandle,
            status: "reviewed",
            payload: {
              fullName: member.fullName,
              email,
              instagramHandle: member.instagramHandle,
              age: member.age,
              weight: member.weight,
              height: member.height,
              gender: member.gender,
              goalDescription: member.goalDescription,
              trainingAvailability: member.trainingAvailability,
              dailyActivity: member.dailyActivity,
              nutritionStyle: member.nutritionStyle,
              mealPlanFoods: member.mealPlanFoods || "",
              cardioPreference: member.cardioPreference,
              currentTrainingPlan: member.currentTrainingPlan,
              pedHistory: member.pedHistory,
              otcSupplements: member.otcSupplements,
              injuriesAndExerciseResponse: member.injuriesAndExerciseResponse,
              preferredStartDate: member.preferredStartDate,
              currentCardioAndSteps: member.currentCardioAndSteps,
              foodRestrictions: member.foodRestrictions,
              sleepAndStress: member.sleepAndStress,
              gymAccess: member.gymAccess,
            },
            submittedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
      )[0];

    if (application) {
      const existingAttachments = await db
        .select({ id: coachingApplicationAttachments.id })
        .from(coachingApplicationAttachments)
        .where(eq(coachingApplicationAttachments.applicationId, application.id));

      if (!existingAttachments.length) {
        await db.insert(coachingApplicationAttachments).values([
          {
            applicationId: application.id,
            fieldName: "frontRelaxedProgressPhoto",
            fileName: "front-relaxed.svg",
            mimeType: "image/svg+xml",
            sizeBytes: createDemoSvg("FRONT", "#8d6b3d").length,
            fileBlob: createDemoSvg("FRONT", "#8d6b3d"),
            createdAt: new Date(),
          },
          {
            applicationId: application.id,
            fieldName: "rearRelaxedProgressPhoto",
            fileName: "rear-relaxed.svg",
            mimeType: "image/svg+xml",
            sizeBytes: createDemoSvg("REAR", "#273127").length,
            fileBlob: createDemoSvg("REAR", "#273127"),
            createdAt: new Date(),
          },
          {
            applicationId: application.id,
            fieldName: "sideRelaxedProgressPhoto",
            fileName: "side-relaxed.svg",
            mimeType: "image/svg+xml",
            sizeBytes: createDemoSvg("SIDE", "#c9a874").length,
            fileBlob: createDemoSvg("SIDE", "#c9a874"),
            createdAt: new Date(),
          },
        ]);
      }
    }

    const [existingBilling] = await db
      .select()
      .from(billingAccounts)
      .where(eq(billingAccounts.memberId, user.id))
      .limit(1);

    if (!existingBilling) {
      await db.insert(billingAccounts).values({
        memberId: user.id,
        stripeCustomerId: `demo_customer_${index + 1}`,
        stripeSubscriptionId: `demo_subscription_${index + 1}`,
        status: member.billingStatus,
        planName: member.planName,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const [existingPlan] = await db
      .select()
      .from(plans)
      .where(eq(plans.title, member.planTitle))
      .limit(1);

    const plan = existingPlan
      ? (
          await db
            .update(plans)
            .set({
              coachId: viewer.profile.id,
              summary: member.planSummary,
              cadence: member.planCadence,
              body: serializedPlanBody,
              updatedAt: new Date(),
            })
            .where(eq(plans.id, existingPlan.id))
            .returning()
        )[0]
      : (
          await db
            .insert(plans)
            .values({
              coachId: viewer.profile.id,
              title: member.planTitle,
              summary: member.planSummary,
              cadence: member.planCadence,
              body: serializedPlanBody,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning()
        )[0];

    if (plan) {
      const [existingAssignment] = await db
        .select()
        .from(planAssignments)
        .where(eq(planAssignments.memberId, user.id))
        .limit(1);

      if (!existingAssignment) {
        await db.insert(planAssignments).values({
          memberId: user.id,
          planId: plan.id,
          assignedByUserId: viewer.profile.id,
          status: "active",
          startsOn: member.preferredStartDate,
          notes: member.planNotes,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const [existingDocument] = await db
      .select()
      .from(documents)
      .where(eq(documents.title, member.documentTitle))
      .limit(1);

    const document = existingDocument
      ? (
          await db
            .update(documents)
            .set({
              coachId: viewer.profile.id,
              description: member.documentDescription,
              fileName: `${member.fullName.toLowerCase().replaceAll(" ", "-")}-guide.txt`,
              mimeType: "text/plain",
              sizeBytes: Buffer.byteLength(serializedPlanBody, "utf8"),
              fileBlob: Buffer.from(serializedPlanBody, "utf8"),
              updatedAt: new Date(),
            })
            .where(eq(documents.id, existingDocument.id))
            .returning()
        )[0]
      : (
          await db
            .insert(documents)
            .values({
              coachId: viewer.profile.id,
              title: member.documentTitle,
              description: member.documentDescription,
              fileName: `${member.fullName.toLowerCase().replaceAll(" ", "-")}-guide.txt`,
              mimeType: "text/plain",
              sizeBytes: Buffer.byteLength(serializedPlanBody, "utf8"),
              fileBlob: Buffer.from(serializedPlanBody, "utf8"),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning()
        )[0];

    if (document) {
      const [existingAccess] = await db
        .select()
        .from(documentAccess)
        .where(eq(documentAccess.memberId, user.id))
        .limit(1);

      if (!existingAccess) {
        await db.insert(documentAccess).values({
          documentId: document.id,
          memberId: user.id,
          createdAt: new Date(),
        });
      }
    }

    const [existingConversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.memberId, user.id))
      .limit(1);

    const conversation =
      existingConversation ||
      (
        await db
          .insert(conversations)
          .values({
            memberId: user.id,
            coachId: viewer.profile.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
      )[0];

    if (conversation) {
      const existingMessages = await db
        .select({ id: messages.id })
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .limit(1);

      if (!existingMessages.length) {
        await db.insert(messages).values([
          {
            conversationId: conversation.id,
            senderId: viewer.profile.id,
            body: member.messages[0],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * (index + 3)),
          },
          {
            conversationId: conversation.id,
            senderId: user.id,
            body: member.messages[1],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * (index + 2)),
          },
        ]);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    message: createdNames.length
      ? `Created ${createdNames.join(" and ")}. Test member password: ${demoMemberPassword}`
      : `Test members already exist. Password: ${demoMemberPassword}`,
  });
}

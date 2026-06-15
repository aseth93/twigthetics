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
import {
  type CoachingPdfDefinition,
  renderCoachingPdf,
} from "./jitesh-pack-pdf";

export const JITESH_MEMBER_ID = "8be0a4f9-1f77-40f1-bf52-745aee913372";
export const JITESH_PACK_START_DATE = "2026-06-15";
const JITESH_PACK_WEEKS = 6;
const JITESH_PACK_TITLE = "Jitesh Anne | Lean Physique Block | Weeks 1-6";
const JITESH_LEGACY_PACK_TITLES = ["Jitesh Anne | Baywatch Cut | Weeks 1-6"];

type WeightLog = {
  date: string;
  weight: number;
};

type WorkoutExercise = {
  name: string;
  prescription: string;
  notes: string;
};

type WorkoutDayTemplate = {
  title: string;
  dayType: string;
  summary: string;
  emphasis: string;
  cardio: string;
  recovery: string;
  exercises: WorkoutExercise[];
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

type GeneratedPackResult = {
  planAssignmentId: string;
  planId: string;
  createdDocuments: number;
  updatedDocuments: number;
  scheduledWorkoutCount: number;
  rangeStart: string;
  rangeEnd: string;
  planTitle: string;
};

type PackSource = {
  member: typeof users.$inferSelect;
  application: typeof coachingApplications.$inferSelect;
};

const weightLogs: WeightLog[] = [
  { date: "2026-05-26", weight: 171.2 },
  { date: "2026-05-29", weight: 170.1 },
  { date: "2026-05-30", weight: 167.8 },
  { date: "2026-05-31", weight: 168.0 },
];

const weekFocusSummaries = [
  "Week 1 sets the baseline. Leave a rep in the tank, learn the setup, and record the loads.",
  "Week 2 is a rep-loading week. Keep exercise order the same and beat week 1 by a rep where clean form allows it.",
  "Week 3 is the first real push. When the top of a rep range is hit cleanly, add a small amount of load next session.",
  "Week 4 keeps intensity honest but trims fatigue a little. Keep compounds hard, but do not chase junk volume.",
  "Week 5 is the second push. Keep the same exercise menu and drive progression on the first 2 to 3 lifts of the day.",
  "Week 6 is the performance-confirmation week. Hold technique, keep fatigue controlled, and finish the block with clean numbers.",
];

const workoutDayTemplates: WorkoutDayTemplate[] = [
  {
    title: "Push",
    dayType: "training",
    summary: "Chest, front-delt, and triceps work built around presses that fit a home-gym setup.",
    emphasis: "Smith and barbell pressing stay heavy enough to drive shape, while isolation volume finishes the chest, delt, and triceps work with dumbbells loaded only as heavy as clean form allows.",
    cardio: "No extra treadmill required after this lift unless steps are well short of target.",
    recovery: "Rest 2 to 3 minutes on presses, 60 to 90 seconds on isolation work, and stop most compound sets with 1 to 2 reps in reserve.",
    exercises: [
      {
        name: "Smith incline press",
        prescription: "4 sets x 6-10 reps",
        notes: "Main progression lift. Use 2 to 4 ramp-up sets before the first work set.",
      },
      {
        name: "Flat barbell press or smith flat press",
        prescription: "3 sets x 8-10 reps",
        notes: "Keep scapula set, control the eccentric, and stop 1 rep short of ugly grinding.",
      },
      {
        name: "Smith high-incline press",
        prescription: "3 sets x 8-12 reps",
        notes: "Bias upper chest and front delts. Use a steeper bench angle only if shoulders tolerate it well.",
      },
      {
        name: "DB lateral raise",
        prescription: "4 sets x 15-25 reps",
        notes: "Dumbbells go up to 50 lb, so choose the load that keeps the side delt owning the set for the full rep range. Add weight only after the top of the range is clean without swinging.",
      },
      {
        name: "Lying barbell triceps extension",
        prescription: "3 sets x 10-15 reps",
        notes: "Last set can push to 0 to 1 RIR.",
      },
      {
        name: "Push-up mechanical drop",
        prescription: "2 rounds to near failure",
        notes: "Feet-elevated to flat-floor push-ups as a finish, only after all main work is done.",
      },
    ],
  },
  {
    title: "Pull",
    dayType: "training",
    summary: "Lat width, upper-back thickness, rear delts, and biceps without depending on heavy dumbbells.",
    emphasis: "The pulldown and row station carries most of the back volume. Barbell work adds thickness and loading progression.",
    cardio: "No added LISS if steps are on track. Put energy into execution quality here.",
    recovery: "Pull with control, pause on contracted rows, and keep the first two back movements at 1 to 2 RIR.",
    exercises: [
      {
        name: "Wide-grip lat pulldown",
        prescription: "4 sets x 8-12 reps",
        notes: "Drive elbows down, not just back. Do not turn this into a lower-back movement.",
      },
      {
        name: "Seated cable row",
        prescription: "4 sets x 8-12 reps",
        notes: "One-second squeeze at the body, then full reach forward under control.",
      },
      {
        name: "Barbell row",
        prescription: "3 sets x 6-10 reps",
        notes: "Use this as the loaded thickness movement. Keep torso stable and avoid hitching the reps up.",
      },
      {
        name: "Rear-delt DB raise",
        prescription: "3 sets x 15-25 reps",
        notes: "High reps are fine here because the dumbbells are light.",
      },
      {
        name: "EZ-bar or straight-bar curl",
        prescription: "3 sets x 8-12 reps",
        notes: "Own the lowering phase instead of swinging through the midrange.",
      },
      {
        name: "Hammer curl variation",
        prescription: "2 sets x 10-15 reps",
        notes: "Keep the final set hard. This is a good place for 0 to 1 RIR.",
      },
    ],
  },
  {
    title: "Legs + shoulders",
    dayType: "training",
    summary: "Lower-body base work plus the shoulder volume needed for a lean, athletic upper-body look.",
    emphasis: "Smith and barbell work build the leg base; shoulder cap work stays high-rep and controlled.",
    cardio: "Normal steps only unless this day gets moved and one of the LISS sessions needs to land here.",
    recovery: "The first squat and hinge each stay technical. Do not let fatigue ruin depth or bar path.",
    exercises: [
      {
        name: "Heels-elevated smith squat",
        prescription: "4 sets x 6-10 reps",
        notes: "Quad-biased, clean depth, steady tempo. This is the main lower-body progression lift.",
      },
      {
        name: "Barbell Romanian deadlift",
        prescription: "4 sets x 8-10 reps",
        notes: "Own the eccentric and keep tension on hamstrings instead of chasing range you cannot control.",
      },
      {
        name: "Smith split squat",
        prescription: "3 sets x 8-12 reps each leg",
        notes: "Stay upright and control the stretch. This can replace heavy dumbbell lunges well.",
      },
      {
        name: "Standing smith calf raise",
        prescription: "4 sets x 10-15 reps",
        notes: "Two-second stretch, full lockout at the top.",
      },
      {
        name: "DB lateral raise",
        prescription: "4 sets x 15-25 reps",
        notes: "Use the corrected dumbbell range up to 50 lb, but do not chase load at the expense of clean side-delt tension. Progress reps first, then load.",
      },
      {
        name: "Bent-over rear-delt raise",
        prescription: "3 sets x 15-20 reps",
        notes: "Keep shoulders down and rear delts driving the set.",
      },
    ],
  },
  {
    title: "Conditioning + abs + mobility",
    dayType: "conditioning",
    summary: "A low-stress day that keeps the deficit working without burying recovery.",
    emphasis: "The goal is not to make cardio heroic. The goal is to stay leaner while still recovering well enough to look and perform athletic.",
    cardio: "20 minutes treadmill LISS, incline walk pace that keeps breathing steady enough to hold a conversation.",
    recovery: "Finish with mobility and abdominal work, then get away from the session before it turns into junk fatigue.",
    exercises: [
      {
        name: "Treadmill incline walk",
        prescription: "20 minutes",
        notes: "Counts as LISS session 1 of the week.",
      },
      {
        name: "Weighted rope ab crunch",
        prescription: "4 sets x 10-15 reps",
        notes: "Round the spine down under control, keep hips fixed, and progress load only when the crunch stays strict. This is ab slot 1 of 2 for the week.",
      },
      {
        name: "Hip flexor / hamstring / thoracic mobility",
        prescription: "8-10 minutes",
        notes: "Keep it simple and repeatable so it actually gets done.",
      },
    ],
  },
  {
    title: "Upper hypertrophy / pump",
    dayType: "training",
    summary: "Higher-rep upper work that adds shape without digging a recovery hole.",
    emphasis: "This day is where you accumulate quality bodybuilding work and chase better contractions, not sloppy PR attempts.",
    cardio: "If steps are low going into the weekend, a short 10-minute incline walk can be added after lifting.",
    recovery: "Most sets can sit around 1 RIR. On isolation work, the final set can push harder if joints still feel good.",
    exercises: [
      {
        name: "Smith incline press",
        prescription: "3 sets x 10-12 reps",
        notes: "Lighter than Monday, smoother pace, better squeeze.",
      },
      {
        name: "Neutral-grip pulldown",
        prescription: "3 sets x 10-12 reps",
        notes: "Think width and clean range, not momentum.",
      },
      {
        name: "Seated cable row",
        prescription: "3 sets x 10-12 reps",
        notes: "Slightly slower than Tuesday. Pause the contraction.",
      },
      {
        name: "Smith close-grip press",
        prescription: "3 sets x 8-12 reps",
        notes: "Triceps-focused press. Keep elbows tucked and bar path stable.",
      },
      {
        name: "DB lateral raise",
        prescription: "4 sets x 18-25 reps",
        notes: "Use a load that keeps the side delt in control. With dumbbells up to 50 lb available, progression is allowed, but swinging reps do not count.",
      },
      {
        name: "EZ-bar curl",
        prescription: "3 sets x 10-15 reps",
        notes: "Final set can push closer to failure.",
      },
    ],
  },
  {
    title: "Lower + posterior chain + finisher",
    dayType: "training",
    summary: "Posterior-chain emphasis plus enough leg work to keep balance and density improving.",
    emphasis: "This day supports the lean athletic look by keeping posterior-chain strength and leg shape moving without crushing the next week.",
    cardio: "10-minute incline walk finisher after lifting plus the regular daily steps target.",
    recovery: "Keep hinge mechanics tight. If lower back fatigue is high, reduce load slightly before form degrades.",
    exercises: [
      {
        name: "Barbell Romanian deadlift",
        prescription: "4 sets x 6-10 reps",
        notes: "Slightly heavier than Wednesday if technique still holds.",
      },
      {
        name: "Smith front squat or narrow-stance squat",
        prescription: "3 sets x 8-10 reps",
        notes: "Stay upright, keep quads working, and do not rush the bottom.",
      },
      {
        name: "Barbell or smith hip thrust",
        prescription: "3 sets x 8-12 reps",
        notes: "Full glute lockout, no bouncing.",
      },
      {
        name: "Walking lunge or split squat",
        prescription: "2 sets x 12-14 reps each leg",
        notes: "Use bodyweight or light dumbbells if the home setup limits loading.",
      },
      {
        name: "Standing calf raise",
        prescription: "3 sets x 12-15 reps",
        notes: "Controlled stretch and pause.",
      },
      {
        name: "Hanging or lying leg raise",
        prescription: "4 sets x 10-15 reps",
        notes: "Curl the pelvis up and control the lowering. This is ab slot 2 of 2 for the week.",
      },
      {
        name: "Treadmill incline walk",
        prescription: "10 minutes",
        notes: "Counts as LISS session 2 if Thursday and Sunday are already covered.",
      },
    ],
  },
  {
    title: "Recovery walk + steps",
    dayType: "recovery",
    summary: "A true recovery day that still keeps energy expenditure honest.",
    emphasis: "Do not turn the day off completely. Recovery is better when movement stays in the week.",
    cardio: "One 20-minute treadmill LISS slot or an outdoor walk if that is easier to execute. This is LISS session 3 for the week.",
    recovery: "Hit the step floor, get some mobility in, and let appetite and fatigue settle before Monday.",
    exercises: [
      {
        name: "Daily step target",
        prescription: "8,000 steps minimum",
        notes: "A little over is fine. A lot under is not.",
      },
      {
        name: "Treadmill or outdoor walk",
        prescription: "20 minutes easy LISS",
        notes: "Steady pace only. The point is recovery plus light output.",
      },
      {
        name: "Mobility reset",
        prescription: "8-10 minutes",
        notes: "Hip flexors, calves, thoracic extension, and a couple easy hamstring stretches.",
      },
    ],
  },
];

function addDays(isoDate: string, offset: number) {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function calculateAverageWeight(entries: WeightLog[]) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  return total / entries.length;
}

function buildTrainingDayParagraphs(day: WorkoutDayTemplate) {
  const exerciseParagraph = day.exercises
    .map(
      (exercise, index) =>
        `${index + 1}. ${exercise.name} — ${exercise.prescription}. ${exercise.notes}`,
    )
    .join("\n");

  return [
    day.summary,
    day.emphasis,
    `Main work:\n${exerciseParagraph}`,
    `Cardio note: ${day.cardio}`,
    `Execution note: ${day.recovery}`,
  ];
}

function buildScheduledWorkouts() {
  const scheduledWorkouts: GeneratedScheduledWorkout[] = [];

  for (let weekIndex = 0; weekIndex < JITESH_PACK_WEEKS; weekIndex += 1) {
    const weekFocus = weekFocusSummaries[weekIndex];

    workoutDayTemplates.forEach((day, dayIndex) => {
      const scheduledDate = addDays(
        JITESH_PACK_START_DATE,
        weekIndex * workoutDayTemplates.length + dayIndex,
      );
      const details = [
        `Week ${weekIndex + 1} focus: ${weekFocus}`,
        "",
        ...buildTrainingDayParagraphs(day),
        "",
        "Portal log after the session:",
        "- Morning bodyweight",
        "- Hydration",
        "- Sleep",
        "- One to three lines on performance, pump, energy, and any joint feedback",
      ].join("\n");

      scheduledWorkouts.push({
        scheduledDate,
        title: day.title,
        dayType: day.dayType,
        summary: `${day.summary} Week ${weekIndex + 1} focus: ${weekFocus}`,
        details,
      });
    });
  }

  return scheduledWorkouts;
}

function buildQuickStartSections() {
  const sections: PlanSections = {
    training: [
      "Weekly rhythm:",
      "Mon Push",
      "Tue Pull",
      "Wed Legs + shoulders",
      "Thu Treadmill conditioning + abs + mobility",
      "Fri Upper hypertrophy / pump",
      "Sat Lower + posterior chain + conditioning finisher",
      "Sun Recovery walk + steps target",
      "",
      "Ab work:",
      "- Thu weighted rope ab crunch",
      "- Sat hanging or lying leg raise",
      "",
      "Rules:",
      "- Compounds: stop around 1 to 2 RIR.",
      "- Isolation: last set can push to 0 to 1 RIR if joints feel good.",
      "- Beat the rep target first, then add load.",
      "- Use 2 to 4 warm-up sets before the first big lift of the day.",
      "",
      "The full Training Plan PDF holds the exercise menu, substitutions, rest times, and week-by-week progression.",
    ].join("\n"),
    nutrition: [
      "Start with the exact meal template in the Nutrition PDF for 14 clean days before changing anything.",
      "",
      "Nutrition lane:",
      "- Starting intake: about 1,770 kcal/day",
      "- Backup macro target: 180 g protein / 150 g carbs / 50 g fats",
      "- Preference honored: eat a little less and do a little less cardio, not high food plus excessive cardio",
      "",
      "Anchor foods stay the same: eggs, pear, ladoo, chicken/fish/goat, white rice, peas/vegetables, whey isolate.",
    ].join("\n"),
    supplements: [
      "Core stack:",
      "- Whey isolate",
      "- Fish oil",
      "- Multivitamin",
      "- Creatine monohydrate 5 g daily",
      "",
      "Optional caffeine/pre-workout is only there to support training quality, not to mask poor sleep or under-recovery.",
      "The Supplement Protocol PDF covers timing, hydration, and how to keep this simple.",
    ].join("\n"),
    cardio: [
      "Activity floor:",
      "- 8,000 daily steps",
      "- 3 x 20-minute treadmill LISS sessions per week",
      "",
      "Cardio is moderate on purpose. The goal is a lean, athletic physique, not living on the treadmill.",
    ].join("\n"),
    misc: [
      "Platform expectations:",
      "- Bodyweight every morning",
      "- Hydration and sleep logged daily",
      "- Workout notes entered right after training",
      "- Use weekly averages, not emotional reactions to single weigh-ins",
      "",
      "The Coaching Platform Instructions PDF explains where each section lives and what to send back through the portal.",
    ].join("\n"),
  };

  return sections;
}

function buildNutritionParagraphs() {
  const averageWeight = calculateAverageWeight(weightLogs);
  const scaleDrop = weightLogs[0].weight - weightLogs[weightLogs.length - 1].weight;

  return {
    averageWeight: averageWeight.toFixed(1),
    scaleDrop: scaleDrop.toFixed(1),
    rationale: [
      `The recent scale run went from ${weightLogs[0].weight.toFixed(1)} lb on May 26, 2026 to ${weightLogs[weightLogs.length - 1].weight.toFixed(1)} lb on May 31, 2026, with the logged average landing around ${averageWeight.toFixed(1)} lb.`,
      "That drop is too fast to treat as pure fat loss. The most realistic read is some actual loss mixed with water and glycogen clearing out as compliance tightened.",
      "Because of that, the coached setup does not slash food harder right away. It starts in a lane that is still lean enough to keep progress moving, but stable enough to train well and hold muscle fullness.",
    ],
    mealMathBullets: [
      "Breakfast as written is roughly 300 to 360 kcal depending on the ladoo size.",
      "Meals 2 and 3 together, using 2 total 5 oz chicken portions, 2 cups peas, and 1.5 cups cooked rice, land around 1,000 to 1,050 kcal total.",
      "Post-workout whey can swing the day meaningfully depending on whether that 120-calorie label is per scoop or for the full shake.",
      "That is why the honest current-intake estimate is roughly 1,550 to 1,750 kcal per day, not one fake precise number.",
    ],
    mealPlanParagraphs: [
      "The exact food plan keeps his current foods in place and only tightens the structure enough to make the intake reliable.",
      "Use the same breakfast base, the same two prep meals, and the same post-workout whey. The only real additions are a little more deliberate fat and a cleaner protein setup so the day lands closer to the coaching target instead of accidentally under-eating.",
    ],
  };
}

function buildPdfDefinitions(source: PackSource) {
  const nutritionCopy = buildNutritionParagraphs();
  const goalDescription =
    source.application.payload.goalDescription?.trim() || "a lean, athletic physique";
  const currentTrainingPlan =
    source.application.payload.currentTrainingPlan?.trim() ||
    "Push / Pull / Legs + shoulders / Rest";
  const equipmentSummary =
    source.application.payload.gymAccess?.trim() ||
    "Home gym with a smith machine, barbell, plates, treadmill, and lat-pulldown/row station";
  const nutritionPreference =
    source.application.payload.nutritionStyle?.trim() ||
    "Specific meal plan laid out";
  const preferenceTradeoff =
    source.application.payload.cardioPreference?.trim() ||
    "Eat less + do less cardio";
  const trainingMetrics = [
    { label: "Start date", value: "Mon Jun 15, 2026" },
    { label: "Weekly split", value: "5 lift + 1 conditioning + 1 recovery" },
    { label: "Daily steps", value: "8,000 minimum" },
    { label: "Treadmill work", value: "3 x 20 min LISS" },
  ];
  const nutritionMetrics = [
    { label: "Calories", value: "~1,770 / day" },
    { label: "Protein floor", value: "180 g" },
    { label: "Carb start", value: "150 g" },
    { label: "Fat cap", value: "Up to 50 g" },
  ];
  const supplementMetrics = [
    { label: "Creatine", value: "5 g daily" },
    { label: "Fluids", value: "110-130 oz / day" },
    { label: "Fish oil", value: "2-3 g combined EPA/DHA" },
    { label: "Sleep goal", value: "7-8 hr" },
  ];
  const platformMetrics = [
    { label: "Weigh-ins", value: "Daily" },
    { label: "Workout notes", value: "After every session" },
    { label: "Hydration / sleep", value: "Logged daily" },
    { label: "Decision filter", value: "7-day average" },
  ];

  const trainingDefinition: CoachingPdfDefinition = {
    title: "Training Plan | Weeks 1-6",
    eyebrow: "Twigthetics Online Coaching",
    subtitle:
      `This block is built directly around the stated goal of "${goalDescription}" and a home-gym setup that needs to rely on the smith machine, barbell, pulldown/row station, treadmill, and smart exercise choice instead of pretending commercial-gym equipment is available.`,
    memberName: source.member.fullName,
    metrics: trainingMetrics,
    sections: [
      {
        heading: "Phase objective",
        paragraphs: [
          "The target for this phase is not bodybuilder-level depletion or a dramatic crash cut. The target is a leaner, more athletic physique with a sharper waistline, stronger shoulder-to-waist contrast, and clearer upper-body shape while still moving and training like an athlete.",
          `The program builds from the split already being run — ${currentTrainingPlan} — but turns it into a full 7-day rhythm that is easier to coach, easier to progress, and better suited to the actual equipment on hand: ${equipmentSummary}.`,
        ],
      },
      {
        heading: "Non-negotiable execution rules",
        bullets: [
          "Use 5 to 8 minutes of general warm-up plus 2 to 4 ramp-up sets before the first major lift of the day.",
          "Compounds stop at roughly 1 to 2 reps in reserve. Do not grind trash reps that ruin the next sessions.",
          "Isolation work can push harder. The final set can sit closer to 0 to 1 RIR if execution is still clean.",
          "Double progression is the rule: beat the rep target first, then add the smallest realistic load jump.",
          "Rest 2 to 3 minutes on the first big compounds, 90 to 120 seconds on secondary work, and 45 to 75 seconds on pump work.",
        ],
      },
      ...workoutDayTemplates.map((day) => ({
        heading: day.title,
        paragraphs: buildTrainingDayParagraphs(day),
      })),
      {
        heading: "Substitution rules for the home setup",
        bullets: [
          "If a dumbbell variation caps out too early, swap to a smith-machine or barbell version before adding junk reps forever.",
          "If shoulder irritation shows up on one press angle, rotate to the pain-free smith or flat press variation and keep the same rep intent.",
          "If rows start beating up the lower back, keep the cable row as the main thickness movement and trim the barbell-row load slightly.",
          "Do not replace the treadmill work with random circuits. The current plan uses predictable output, not fatigue theater.",
        ],
      },
      {
        heading: "Week-by-week progression",
        bullets: weekFocusSummaries,
      },
      {
        heading: "Stall rules",
        bullets: [
          "If the same lift misses the bottom of the rep range for two straight exposures, keep the load fixed and beat the technique before forcing another increase.",
          "If joints feel bad but strength is still fine, keep the exercise pattern and adjust the range, tempo, or setup before changing the whole plan.",
          "If bodyweight drops fast and pumps collapse, log the pattern clearly so I can review the nutrition setup.",
        ],
      },
    ],
    footerNote:
      "Train clean, log honestly, and let the plan compound for a few weeks before acting like it needs a total rewrite.",
  };

  const nutritionDefinition: CoachingPdfDefinition = {
    title: "Nutrition Plan + Backup Macros",
    eyebrow: "Twigthetics Online Coaching",
    subtitle:
      `The food setup stays built around the meals already sticking well: eggs, fruit, rice, peas, lean protein, and whey. The intake specifically asked for a "${nutritionPreference}" approach and chose "${preferenceTradeoff}" over high food plus high cardio, so the structure respects that.`,
    memberName: source.member.fullName,
    metrics: nutritionMetrics,
    sections: [
      {
        heading: "Why the intake starts here",
        paragraphs: nutritionCopy.rationale,
      },
      {
        heading: "Current intake math",
        bullets: nutritionCopy.mealMathBullets,
      },
      {
        heading: "Exact meal plan starting June 15",
        paragraphs: nutritionCopy.mealPlanParagraphs,
        bullets: [
          "Meal 1: 5 egg whites, 1 whole egg, 1 medium pear, 1 small mixed-nut ladoo, and 1 tablespoon almond butter or a similar nut serving.",
          "Meal 2: 5 oz cooked chicken or white fish, 1 cup peas or green vegetables, and 0.75 cup cooked white rice.",
          "Meal 3: 5 oz cooked chicken, fish, or goat, 1 cup peas or green vegetables, and 0.75 cup cooked white rice.",
          "Post-workout: 2 scoops whey isolate in water.",
          "Seasonings are fine. Keep oil low unless it is deliberately accounted for.",
        ],
      },
      {
        heading: "Protein and meal swaps",
        bullets: [
          "Chicken stays the default because it is lean and predictable.",
          "White fish can replace chicken one-for-one when appetite is lower and digestion needs to stay light.",
          "Goat is fine as a rotation protein, but remember it usually carries more fat than chicken. Keep the portion size comparable and do not accidentally turn a swap into a surplus.",
          "If hunger is high late in the day, add fibrous vegetables.",
        ],
      },
      {
        heading: "Backup macro target",
        bullets: [
          "Calories: about 1,770 per day.",
          "Protein floor: 180 g.",
          "Carbs: about 150 g.",
          "Fats: up to 50 g, with the exact food plan likely landing somewhat leaner unless a fattier protein swap is used.",
          "If flexibility is needed for one meal out, hit protein first, keep carbs near training, and do not let fats quietly blow up the day.",
        ],
      },
      {
        heading: "Macro priority",
        paragraphs: [
          "The main priorities are staying within the calorie target and hitting the protein goal.",
          "Fats and carbs do not need to land perfectly every day. They can trade off when needed if that is more convenient, as long as total calories and protein are controlled.",
        ],
      },
      {
        heading: "Execution guardrails",
        bullets: [
          "Do not freestyle a meal plan until the exact version has been executed cleanly first.",
          "Protein stays anchored every day, even on rest days.",
          "The preference from the intake was lower food and lower cardio rather than high food and lots of cardio. The plan respects that, but it still needs accurate logging.",
          "Alcohol, large weekends, and untracked bites are the fastest way to make a good plan look bad on paper.",
        ],
      },
    ],
    footerNote:
      "The first win is making the intake repeatable enough that coach review means something.",
  };

  const supplementDefinition: CoachingPdfDefinition = {
    title: "Supplement Protocol",
    eyebrow: "Twigthetics Online Coaching",
    subtitle:
      "Keep this simple. The existing supplement base is already small and sensible, so this protocol only adds what actually improves output, recovery, or adherence.",
    memberName: source.member.fullName,
    metrics: supplementMetrics,
    sections: [
      {
        heading: "Core daily stack",
        bullets: [
          "Current base already in place: multivitamin and fish oil.",
          "Whey isolate: use after training or whenever protein convenience matters.",
          "Fish oil: enough daily capsules to land around 2 to 3 g combined EPA/DHA.",
          "Multivitamin: one serving with a real meal, not on an empty stomach.",
          "Creatine monohydrate: 5 g every day, training or rest day, with no loading phase needed.",
        ],
      },
      {
        heading: "Timing",
        bullets: [
          "Fish oil and multivitamin work best with meals.",
          "Creatine timing is not magic. Pick the easiest consistent slot and keep it there.",
          "Whey isolate can stay post-workout because it already fits the current routine well.",
        ],
      },
      {
        heading: "Optional performance support",
        bullets: [
          "Caffeine or a simple pre-workout is fine on lower-energy days, but use the smallest dose that improves output.",
          "Do not let pre-workout become the fix for poor sleep, poor food timing, or under-recovery.",
          "If sleep quality drops, trim afternoon stimulant use before changing the training plan.",
        ],
      },
      {
        heading: "Hydration and electrolytes",
        bullets: [
          "Daily fluid target starts around 110 to 130 oz, adjusted upward on hot days or higher-step days.",
          "Salt food normally and keep sodium consistent so scale trends are easier to interpret.",
          "If pumps are flat and bodyweight is moving fast, log hydration and sodium consistency so the plan can be reviewed correctly.",
        ],
      },
      {
        heading: "What not to overcomplicate",
        bullets: [
          "No need for a huge stack of fat burners, detox formulas, or exotic recovery supplements.",
          "If a supplement does not clearly improve compliance, recovery, or performance, it is noise until proven otherwise.",
        ],
      },
    ],
    footerNote:
      "Consistency beats a fancy stack. The plan only cares about things that actually move performance or adherence.",
  };

  const platformDefinition: CoachingPdfDefinition = {
    title: "Coaching Platform Instructions",
    eyebrow: "Twigthetics Online Coaching",
    subtitle:
      "This is the operating manual for the portal. The goal is to make daily execution obvious so coaching decisions are based on clean information.",
    memberName: source.member.fullName,
    metrics: platformMetrics,
    sections: [
      {
        heading: "Where to find everything",
        bullets: [
          "Open Plans to see the current block, then use the training / nutrition / supplements / cardio / misc tabs.",
          "Each programming tab can also hold the PDF file for that section. Use the portal version for quick reference and the PDF for the full explanation.",
          "Use Check-ins for daily bodyweight, hydration, sleep, workout notes, and the calendar view.",
          "Use Messages when something actually needs coach input instead of saving it for later and forgetting the detail.",
        ],
      },
      {
        heading: "How to use the workout calendar",
        bullets: [
          "Click a day to open the programmed workout for that date.",
          "After training, use that same day to log the actual workout notes, bodyweight, hydration, and sleep.",
          "If a session gets moved, still log what was actually performed that day and explain the swap in the notes.",
        ],
      },
      {
        heading: "Daily logging rules",
        bullets: [
          "Bodyweight goes in every morning after using the bathroom and before food.",
          "Hydration gets logged as the total ounces for the day.",
          "Sleep gets logged in hours, not vague ratings.",
          "Workout notes should include what moved well, what felt off, and whether the target reps or loads were hit.",
        ],
      },
      {
        heading: "How scale data is judged",
        bullets: [
          "Single-day scale swings are mostly noise.",
          "The 7-day average is the real decision-maker for food or cardio changes.",
          "Look at bodyweight together with waist look, training performance, and hunger before calling for a change.",
        ],
      },
      {
        heading: "What to send in workout feedback",
        bullets: [
          "Any lift that clearly stalled.",
          "Any joint issue or machine/setup problem.",
          "Any movement that felt especially good or especially poor in the target muscle.",
          "Any day where energy, pumps, or recovery were clearly different from normal.",
        ],
      },
      {
        heading: "How to report missed meals or workouts",
        bullets: [
          "Do not hide the miss. Log it and explain what happened in one sentence.",
          "Missed meals matter most when they become a pattern, so accuracy is more useful than pretending compliance was perfect.",
          "Missed workouts should be noted with whether the session was skipped, shortened, or moved to another day.",
        ],
      },
      {
        heading: "Messaging and check-in expectations",
        bullets: [
          "Message when something needs an answer, not because a single weigh-in was weird.",
          "Use the portal notes and calendar consistently so messages can stay specific instead of vague.",
          "Program changes happen when the actual data says they should, not because one day felt flat.",
        ],
      },
    ],
    footerNote:
      "Good coaching depends on good information. Keep the portal fed with accurate detail and the adjustments get better.",
  };

  return [
    trainingDefinition,
    nutritionDefinition,
    supplementDefinition,
    platformDefinition,
  ] as const;
}

async function buildGeneratedDocuments(source: PackSource) {
  const definitions = buildPdfDefinitions(source);
  const sections: PlanSectionKey[] = ["training", "nutrition", "supplements", "misc"];
  const fileNames = [
    "jitesh-anne-training-plan-weeks-1-6.pdf",
    "jitesh-anne-nutrition-plan-and-backup-macros.pdf",
    "jitesh-anne-supplement-protocol.pdf",
    "jitesh-anne-coaching-platform-instructions.pdf",
  ];
  const descriptions = [
    "Full 6-week training block with exercise selection, substitutions, progression rules, and daily structure.",
    "Exact meal template, calorie/macro rationale, food swaps, and coach review notes.",
    "Simple daily supplement protocol with hydration, electrolyte, and caffeine guidance.",
    "Portal instructions, daily logging rules, calendar usage, and feedback expectations for coaching.",
  ];

  const buffers = await Promise.all(definitions.map((definition) => renderCoachingPdf(definition)));

  return definitions.map((definition, index) => ({
    title: `${source.member.fullName} | ${definition.title}`,
    description: descriptions[index],
    section: sections[index],
    fileName: fileNames[index],
    mimeType: "application/pdf",
    fileBuffer: buffers[index],
  }));
}

function buildGeneratedPlan(source: PackSource) {
  const sections = buildQuickStartSections();
  const goalDescription =
    source.application.payload.goalDescription?.trim() || "a lean, athletic physique";

  return {
    title: JITESH_PACK_TITLE,
    summary:
      `Six-week lean-physique block built around the stated goal of "${goalDescription}", a home gym, moderate cardio, and food structure Jitesh is already adhering to.`,
    cadence:
      "5 lifting days, 1 conditioning day, 1 recovery/steps day. Daily bodyweight, hydration, and sleep logging. 8k steps minimum and 3 x 20-minute treadmill LISS each week.",
    body: serializePlanSections(sections),
    sections,
    startsOn: JITESH_PACK_START_DATE,
    notes:
      "Generated from the latest intake on file plus the current meal structure and May 26-31 weight trend shared during onboarding.",
  };
}

async function buildGeneratedCoachingPack(source: PackSource): Promise<GeneratedCoachingPack> {
  return {
    plan: buildGeneratedPlan(source),
    documents: await buildGeneratedDocuments(source),
    scheduledWorkouts: buildScheduledWorkouts(),
    rangeStart: JITESH_PACK_START_DATE,
    rangeEnd: addDays(JITESH_PACK_START_DATE, JITESH_PACK_WEEKS * 7 - 1),
  };
}

async function findPackSource(db: AppDb, memberId: string) {
  const [member] = await db
    .select()
    .from(users)
    .where(eq(users.id, memberId))
    .limit(1);

  if (!member) {
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

  return { member, application };
}

export async function generateJiteshCoachingPackForMember(options: {
  db: AppDb;
  memberId: string;
  coachId: string;
}): Promise<GeneratedPackResult> {
  if (options.memberId !== JITESH_MEMBER_ID) {
    throw new Error("This generation workflow is currently configured only for Jitesh Anne.");
  }

  const source = await findPackSource(options.db, options.memberId);
  const pack = await buildGeneratedCoachingPack(source);

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
          inArray(plans.title, [pack.plan.title, ...JITESH_LEGACY_PACK_TITLES]),
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
          title: pack.plan.title,
          summary: pack.plan.summary,
          cadence: pack.plan.cadence,
          body: pack.plan.body,
          updatedAt: new Date(),
        })
        .where(eq(plans.id, existingAssignment.plan.id));

      await tx
        .update(planAssignments)
        .set({
          status: "active",
          startsOn: pack.plan.startsOn,
          notes: pack.plan.notes,
          assignedByUserId: options.coachId,
          updatedAt: new Date(),
        })
        .where(eq(planAssignments.id, existingAssignment.assignment.id));
    } else {
      const [insertedPlan] = await tx
        .insert(plans)
        .values({
          coachId: options.coachId,
          title: pack.plan.title,
          summary: pack.plan.summary,
          cadence: pack.plan.cadence,
          body: pack.plan.body,
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
          startsOn: pack.plan.startsOn,
          notes: pack.plan.notes,
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

    const documentTitles = pack.documents.map((document) => document.title);
    const existingDocumentRows = documentTitles.length
      ? await tx
          .select({
            accessId: documentAccess.id,
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

    for (const document of pack.documents) {
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
          gte(memberWorkoutScheduleEntries.scheduledDate, pack.rangeStart),
          lte(memberWorkoutScheduleEntries.scheduledDate, pack.rangeEnd),
        ),
      );

    if (pack.scheduledWorkouts.length) {
      await tx.insert(memberWorkoutScheduleEntries).values(
        pack.scheduledWorkouts.map((entry) => ({
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
      scheduledWorkoutCount: pack.scheduledWorkouts.length,
      rangeStart: pack.rangeStart,
      rangeEnd: pack.rangeEnd,
      planTitle: pack.plan.title,
    };
  });

  return result;
}

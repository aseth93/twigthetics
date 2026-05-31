import type { SiteConfig } from "@/types/site";

const instagramUrl =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
  "https://www.instagram.com/twigthetics/";

export const siteConfig: SiteConfig = {
  brand: {
    name: "Twigthetics",
    eyebrow: "Lean Aesthetic Coaching",
    headline: "Lean. Athletic. Healthy.",
    subheadline:
      "Online coaching for people who want to achieve an aesthetic physique that looks sharp year-round, feels athletic in real life, and can be maintained without killing yourself with effort.",
  },
  links: {
    instagram: instagramUrl,
    guideCheckout: "",
  },
  coach: {
    name: "Abe Seth",
    title: "Online coach for lean, athletic physiques",
    handle: "twigthetics",
    summary:
      "Twigthetics is for lifters who care about looking lean, moving well, and keeping the physique they build without turning fitness into a full-time job.",
    bio: "The lane is simple: stay lean enough to look good, athletic enough to move well, and realistic enough to maintain without living on extreme cardio, food obsession, or bodybuilding effort year-round.",
    metrics: [
      { value: "Sustainable", label: "results that hold" },
      { value: "Structured", label: "organized approach" },
      { value: "Adaptable", label: "built for real life" },
    ],
    portrait: {
      src: "/images/coach/coach-d93-checkin.jpg",
      alt: "Abe Seth in a lean mirror check-in photo near a window.",
    },
    heroImage: {
      src: "/images/coach/coach-gym-mirror.jpg",
      alt: "Abe Seth in a lean gym mirror check-in photo.",
    },
    aboutImage: {
      src: "/images/coach/coach-stage-checkin.jpg",
      alt: "Abe Seth in a stage-prep check-in photo.",
    },
  },
  coachingOffer: {
    title: "Coaching for a lean, athletic look you can actually keep.",
    summary:
      "Training, nutrition, check-ins, and adjustments are built around one goal: help you look sharper without needing your whole life to revolve around getting there.",
    audience:
      "Best for people who already train, want a more aesthetic result, and are tired of bouncing between sloppy bulks, unsustainable cuts, and vague fitness advice.",
    deliverables: [
      "Individualized training structure shaped around aesthetics, athleticism, recovery, and your actual weekly schedule.",
      "Nutrition targets built for body-composition progress without obsessive restriction or needless suffering.",
      "Regular check-ins, direct adjustments, and practical feedback when progress stalls.",
      "Direct communication with me via my personal phone #.",
      "Simple guardrails around steps, cardio, hunger management, and keeping the look outside the gym.",
    ],
    commitments: [
      "Consistent logging, honest check-ins, and enough patience to let simple things work.",
      "Execution beats theatrics. The process is not built around hacks, punishment, or panic changes.",
      "You should want oversight. If you only need a reference framework, the guide is the better entry point.",
    ],
    ctaLabel: "Sign up for coaching",
  },
  guideOffer: {
    title: "The Lean Aesthetic Guide",
    summary:
      "A practical digital guide for staying lean, athletic, and visually sharp year-round without turning maintenance into another form of prep.",
    statusNote: "Coming soon.",
    ctaLabel: "Buy the guide",
    placeholderLabel: "Coming soon",
    features: [
      "A framework for staying lean enough to look good year-round without running yourself into the ground.",
      "Clear rules for food structure, training, steps, cardio, and weekly adjustments.",
      "Written for people who want a physique that still looks deliberate when life gets busy.",
    ],
    modules: [
      {
        title: "Maintenance calories without the rebound",
        description:
          "How to move out of a deficit without overshooting body-fat gain or losing the look you worked to build.",
      },
      {
        title: "Training for shape and athleticism",
        description:
          "Exercise selection, progression, and volume rules that keep the physique sharp and athletic instead of just beat up.",
      },
      {
        title: "The weekly adjustment filter",
        description:
          "What to change, what to leave alone, and how to stop reacting to every small fluctuation.",
      },
      {
        title: "Social meals, travel, and weekends",
        description:
          "A realistic system for staying tight when life is not running on a prep schedule.",
      },
      {
        title: "Supplements, recovery, and routine",
        description:
          "The small habits that keep the maintenance phase looking composed instead of sloppy.",
      },
      {
        title: "Long-term aesthetic standards",
        description:
          "How to define the look you are trying to keep, measure drift early, and tighten things before they get away from you.",
      },
    ],
  },
  transformations: [
    {
      id: "coach-everyday-standard",
      label: "Coach Proof",
      title: "",
      summary: "",
      timeframe: "Current coach check-ins",
      result: "Consistent condition without turning life into prep.",
      comparison: {
        before: {
          src: "/images/coach/coach-floor-mirror.jpg?v=2",
          alt: "Abe Seth in a full-body mirror check-in wearing joggers.",
          caption: "",
        },
        after: {
          src: "/images/coach/coach-portrait-mirror.jpg?v=2",
          alt: "Abe Seth in a close-up mirror check-in photo.",
          caption: "",
        },
      },
    },
    {
      id: "current-conditioning",
      label: "",
      title: "Maintain a lean physique without living on extremes.",
      summary: "",
      timeframe: "Current coach photo",
      result:
        "This is the standard the coaching is built around: flexible, healthy, and repeatable.",
      image: {
        src: "/images/coach/coach-d93-checkin.jpg",
        alt: "Abe Seth in a lean mirror check-in photo showing an athletic physique.",
      },
    },
  ],
  clientTransformations: [
    {
      id: "jake-hudson",
      clientName: "Jake",
      note: "First prep and almost show-ready after following the plan all the way through.",
      timeframe: "April 2021",
      sourceUrl: "https://www.instagram.com/p/CNdgJ5fjp0T/",
      image: {
        src: "/images/client-transformations/previews/jake-hudson.jpg",
        alt: "Client transformation spotlight featuring Jake.",
      },
    },
    {
      id: "rony-polanco",
      clientName: "Rony",
      note: "Peak bulk to current condition, showing a sharper look without losing the size built.",
      timeframe: "April 2021",
      sourceUrl: "https://www.instagram.com/p/CNjVBxHDCbC/",
      image: {
        src: "/images/client-transformations/previews/rony-polanco.jpg",
        alt: "Client transformation spotlight featuring Rony Polanco.",
      },
    },
    {
      id: "sudie-progress",
      clientName: "Sudie",
      note: "A bigger, stronger physique after a year of steady progress.",
      timeframe: "October 2019",
      sourceUrl: "https://www.instagram.com/p/B3F-EhbjE6v/",
      image: {
        src: "/images/client-transformations/previews/sudie-progress.jpg",
        alt: "Client progress spotlight featuring Sudie.",
      },
    },
    {
      id: "gordan-progress",
      clientName: "Gordan",
      note: "Thirteen months of consistency turned fitness into a lifestyle change.",
      timeframe: "October 2019",
      sourceUrl: "https://www.instagram.com/p/B3LeYCgjd_E/",
      image: {
        src: "/images/client-transformations/previews/gordan-progress.jpg",
        alt: "Client transformation spotlight featuring Gordan.",
      },
    },
    {
      id: "maxwell-12-weeks",
      clientName: "Maxwell",
      note: "A 12-week transformation built by following the protocol exactly.",
      timeframe: "June 2018",
      sourceUrl: "https://www.instagram.com/p/BkjFZ8NHBXT/",
      image: {
        src: "/images/client-transformations/previews/maxwell-12-weeks.jpg",
        alt: "Client transformation spotlight featuring Maxwell.",
      },
    },
    {
      id: "aaron-progress",
      clientName: "Aaron",
      note: "No excuses, full buy-in, and visible results from executing the basics well.",
      timeframe: "October 2017",
      sourceUrl: "https://www.instagram.com/p/BaH6uKjnX7d/",
      image: {
        src: "/images/client-transformations/previews/aaron-progress.jpg",
        alt: "Client progress spotlight featuring Aaron.",
      },
    },
    {
      id: "paulina-mskii",
      clientName: "Paulina",
      note: "Consistent work paying off with a visibly leaner, tighter physique.",
      timeframe: "November 2017",
      sourceUrl: "https://www.instagram.com/p/BbidU8TnuP6/",
      image: {
        src: "/images/client-transformations/previews/paulina-mskii.jpg",
        alt: "Client transformation spotlight featuring Paulina Mskii.",
      },
    },
    {
      id: "adam-weimer",
      clientName: "Adam",
      note: "Results that speak for themselves from locking in on the coaching plan.",
      timeframe: "October 2017",
      sourceUrl: "https://www.instagram.com/p/BasQER9HWRm/",
      image: {
        src: "/images/client-transformations/previews/adam-weimer.jpg",
        alt: "Client transformation spotlight featuring Adam Weimer.",
      },
    },
    {
      id: "cameron-lifestyle",
      clientName: "Cameron",
      note: "A full lifestyle shift built from applying a simple plan consistently.",
      timeframe: "October 2017",
      sourceUrl: "https://www.instagram.com/p/BaCZH82HVn1/",
      image: {
        src: "/images/client-transformations/previews/cameron-lifestyle.jpg",
        alt: "Client transformation spotlight featuring Cameron.",
      },
    },
    {
      id: "mike-durkot",
      clientName: "Mike",
      note: "Prep progress proof from a client who knew how to work.",
      timeframe: "July 2017",
      sourceUrl: "https://www.instagram.com/p/BWlrWDgHIwT/",
      image: {
        src: "/images/client-transformations/previews/mike-durkot.jpg",
        alt: "Client prep progress spotlight featuring Mike Durkot.",
      },
    },
    {
      id: "camilo-jimenez",
      clientName: "Camilo",
      note: "A client spotlight centered on clear physique change under coach Twigthetics.",
      timeframe: "July 2017",
      sourceUrl: "https://www.instagram.com/p/BXOVRpCnWtB/",
      image: {
        src: "/images/client-transformations/previews/camilo-jimenez.jpg",
        alt: "Client transformation spotlight featuring Camilo Jimenez.",
      },
    },
    {
      id: "kelly-results",
      clientName: "Kelly",
      note: "Results from a smart training and nutrition approach applied consistently.",
      timeframe: "July 2017",
      sourceUrl: "https://www.instagram.com/p/BWla2q5HAQf/",
      image: {
        src: "/images/client-transformations/previews/kelly-results.jpg",
        alt: "Client results spotlight featuring Kelly.",
      },
    },
  ],
  testimonials: [],
  faq: [
    {
      question: "Who is online coaching actually for?",
      answer:
        "People who already care about training, want a leaner and more aesthetic result, and know they will execute better with direct oversight than with another generic template.",
    },
    {
      question: "Is the guide a replacement for coaching?",
      answer:
        "It is the self-directed option. If you want a framework you can run on your own, the guide is the right starting point. If you want adjustments, accountability, and eyes on the process, coaching is the stronger fit.",
    },
    {
      question: "Is this bodybuilding coaching?",
      answer:
        "No. It borrows precision from physique coaching, but the target is a lean, athletic, aesthetic look you can live in. The goal is not to make your lifestyle revolve around chasing size or suffering for the physique.",
    },
    {
      question: "What happens after I apply?",
      answer:
        "Your intake, training reality, and any current physique pictures you include are reviewed first. If the fit looks right, the next step is a direct follow-up with onboarding details.",
    },
  ],
  process: [
    {
      title: "Apply",
      description:
        "Submit the full intake and the details that show how you train, eat, and recover right now. Current progress pictures are highly recommended.",
    },
    {
      title: "Audit",
      description:
        "The weak points get identified first: training choices, food structure, recovery, body-composition drift, or simple overcomplication.",
    },
    {
      title: "Execute",
      description:
        "Run the plan, check in consistently, and tighten the process based on real data instead of emotional swings or needless effort.",
    },
  ],
  applicationFields: [
    {
      name: "fullName",
      label: "Full name",
      type: "text",
      placeholder: "Your name",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "you@example.com",
      required: true,
    },
    {
      name: "instagramHandle",
      label: "Instagram handle",
      type: "text",
      placeholder: "@yourhandle",
      helper: "Optional, but useful if your current physique proof lives there.",
    },
    {
      name: "age",
      label: "1. How old are you?",
      type: "number",
      placeholder: "Age",
      required: true,
    },
    {
      name: "weight",
      label: "2. How much do you weigh?",
      type: "text",
      placeholder: "e.g. 178 lb / 81 kg",
      required: true,
    },
    {
      name: "height",
      label: "3. What is your height?",
      type: "text",
      placeholder: "e.g. 5'10\" / 178 cm",
      required: true,
    },
    {
      name: "gender",
      label: "4. What is your gender?",
      type: "select",
      placeholder: "Select gender",
      options: ["Male", "Female", "Non-binary", "Prefer not to say"],
      required: true,
    },
    {
      name: "goalDescription",
      label: "5. Please describe your goals. Be as descriptive as possible.",
      type: "textarea",
      placeholder: "Describe the look you want, what you want to improve, and what success would look like.",
      required: true,
      span: "full",
    },
    {
      name: "trainingAvailability",
      label: "6. How much time are you willing to spend in the gym during your training sessions?",
      type: "text",
      placeholder: "e.g. 4 days/week, 70 minutes per session",
      helper: "Include both days per week and average time per workout.",
      required: true,
    },
    {
      name: "dailyActivity",
      label: "7. What type of daily activity do you have?",
      type: "select",
      placeholder: "Select your daily activity level",
      options: [
        "Sedentary desk job",
        "Some walking during the day",
        "On my feet most of the day",
        "Physically demanding / labor-intensive",
      ],
      helper: "Think about your workday and general movement outside the gym.",
      required: true,
    },
    {
      name: "nutritionStyle",
      label: "8. Do you prefer to track calories in MyFitnessPal or follow a laid-out meal plan?",
      type: "select",
      placeholder: "Select your preferred nutrition approach",
      options: [
        "Track calories/macros with MyFitnessPal",
        "Specific meal plan laid out for me",
      ],
      helper: "Meal plan means repeating similar foods. Tracking means more flexibility.",
      required: true,
      span: "full",
    },
    {
      name: "mealPlanFoods",
      label: "If you chose meal plan, what foods do you eat regularly / what does your current meal plan look like?",
      type: "textarea",
      placeholder: "List the foods you already eat often or your current meal plan setup.",
      requiredWhen: {
        field: "nutritionStyle",
        equals: "Specific meal plan laid out for me",
      },
      showWhen: {
        field: "nutritionStyle",
        equals: "Specific meal plan laid out for me",
      },
      span: "full",
    },
    {
      name: "cardioPreference",
      label: "9. If it were up to you, would you rather eat less + do less cardio, or eat more + do more cardio?",
      type: "select",
      placeholder: "Choose your preferred trade-off",
      options: ["Eat less + do less cardio", "Eat more + do more cardio"],
      required: true,
      span: "full",
    },
    {
      name: "frontRelaxedProgressPhoto",
      label: "10. Front relaxed progress picture",
      type: "file",
      accept: "image/*,.heic,.HEIC,.heif,.HEIF",
      helper: "Highly recommended: attach a clear front relaxed picture.",
      span: "full",
    },
    {
      name: "rearRelaxedProgressPhoto",
      label: "Rear relaxed progress picture",
      type: "file",
      accept: "image/*,.heic,.HEIC,.heif,.HEIF",
      helper: "Highly recommended: attach a clear rear relaxed picture.",
      span: "full",
    },
    {
      name: "sideRelaxedProgressPhoto",
      label: "Side relaxed progress picture",
      type: "file",
      accept: "image/*,.heic,.HEIC,.heif,.HEIF",
      helper: "Highly recommended: attach a clear side relaxed picture.",
      span: "full",
    },
    {
      name: "currentTrainingPlan",
      label: "11. What is your current training plan?",
      type: "textarea",
      placeholder: "Lay out your current split, exercise structure, and how you currently train.",
      required: true,
      span: "full",
    },
    {
      name: "pedHistory",
      label: "12. If applicable, what anabolic supplements are you currently on, and what is your full PED use history?",
      type: "textarea",
      placeholder: "Current compounds, dose ranges, time on, prior cycles, and any relevant context.",
      span: "full",
    },
    {
      name: "otcSupplements",
      label: "13. What over-the-counter supplements are you currently taking?",
      type: "textarea",
      placeholder: "Creatine, caffeine, pre-workout, fish oil, vitamins, etc.",
      span: "full",
    },
    {
      name: "injuriesAndExerciseResponse",
      label: "14. What injuries do you currently have, if any? Which exercises bother you, and which feel best?",
      type: "textarea",
      placeholder: "List injuries, painful movements, and any exercises or machines where your mind-muscle connection feels especially strong.",
      required: true,
      span: "full",
    },
    {
      name: "preferredStartDate",
      label: "15. What is your preferred start date?",
      type: "date",
      helper: "Pick any Monday June 15th or after.",
      required: true,
      minIsoDate: "2026-06-15",
      requiredWeekday: 1,
    },
    {
      name: "currentCardioAndSteps",
      label: "Extra: What are your current daily steps and cardio levels?",
      type: "textarea",
      placeholder: "Average steps per day, cardio sessions per week, and how hard those sessions are.",
      span: "full",
    },
    {
      name: "foodRestrictions",
      label: "Extra: Do you have any food allergies, restrictions, digestive issues, or foods you will not eat?",
      type: "textarea",
      placeholder: "Anything that affects meal planning or food selection.",
      span: "full",
    },
    {
      name: "sleepAndStress",
      label: "Extra: How much do you usually sleep, and what is your stress level like right now?",
      type: "textarea",
      placeholder: "Average sleep hours, work stress, life stress, travel, or anything that affects recovery.",
      span: "full",
    },
    {
      name: "gymAccess",
      label: "Extra: What gym do you train at / what equipment limitations do you have, if any?",
      type: "textarea",
      placeholder: "Commercial gym, apartment gym, home gym, or any equipment constraints that matter.",
      span: "full",
    },
  ],
};

import type { SiteConfig } from "@/types/site";

const instagramUrl =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ||
  "https://www.instagram.com/twigthetics/";

const guideCheckoutUrl = process.env.NEXT_PUBLIC_GUIDE_CHECKOUT_URL?.trim() || "";
const applicationEndpoint =
  process.env.NEXT_PUBLIC_APPLICATION_ENDPOINT?.trim() || "";

export const siteConfig: SiteConfig = {
  brand: {
    name: "Twigthetics",
    eyebrow: "Lean Aesthetic Coaching",
    headline: "Lean. Athletic. Aesthetic.",
    subheadline:
      "Online coaching for people who want to achieve an aesthetic physique that looks sharp year-round, feels athletic in real life, and can be maintained without killing yourself with effort.",
  },
  links: {
    instagram: instagramUrl,
    guideCheckout: guideCheckoutUrl,
    applicationEndpoint,
  },
  coach: {
    name: "Abe Seth",
    title: "Online coach for lean, aesthetic physiques",
    handle: "twigthetics",
    summary:
      "Twigthetics is for lifters who care about looking lean, moving well, and keeping the physique they build without turning fitness into a full-time job.",
    bio: "The lane is simple: stay lean enough to look good, athletic enough to move well, and realistic enough to maintain without living on extreme cardio, food obsession, or bodybuilding effort year-round.",
    metrics: [
      { value: "45 lb", label: "recent physique shift" },
      { value: "10k+", label: "daily steps" },
      { value: "4-5x", label: "weekly lifts" },
    ],
    portrait: {
      src: "/images/abe-profile.jpg",
      alt: "Profile photo of IFBB Pro Abe Seth.",
    },
    heroImage: {
      src: "/images/current-look.jpg",
      alt: "Abe Seth in a current lean, athletic physique photo.",
    },
    aboutImage: {
      src: "/images/tennis-action.jpg",
      alt: "Abe Seth playing tennis.",
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
      "Simple guardrails around steps, cardio, hunger management, and keeping the look outside the gym.",
    ],
    commitments: [
      "Consistent logging, honest check-ins, and enough patience to let simple things work.",
      "Execution beats theatrics. The process is not built around hacks, punishment, or panic changes.",
      "You should want oversight. If you only need a reference framework, the guide is the better entry point.",
    ],
    ctaLabel: "Start the application",
  },
  guideOffer: {
    title: "The Lean Aesthetic Guide",
    summary:
      "A practical digital guide for staying lean, athletic, and visually sharp year-round without turning maintenance into another form of prep.",
    statusNote:
      guideCheckoutUrl
        ? "External checkout is live."
        : "Checkout link plugs in here as soon as the hosted purchase flow is connected.",
    ctaLabel: "Buy the guide",
    placeholderLabel: "Guide link dropping soon",
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
      id: "body-composition-shift",
      label: "Body Composition",
      title: "Lighter, sharper, more athletic.",
      summary:
        "Recent proof that a large visual swing does not have to look depleted or fragile when the process is managed correctly.",
      timeframe: "Recent public post",
      result:
        "Anchored by Abe's own 45-pound shift and framed around keeping the final look athletic rather than just smaller.",
      comparison: {
        before: {
          src: "/images/transformation-before.jpg",
          alt: "Earlier physique image from Abe Seth's recent 45-pound transformation post.",
          caption: "Earlier phase",
        },
        after: {
          src: "/images/transformation-current.jpg",
          alt: "Current physique image from Abe Seth's recent 45-pound transformation post.",
          caption: "Current look",
        },
      },
    },
    {
      id: "lean-athletic-look",
      label: "Lean Athletic Look",
      title: "A physique that still looks good when life is normal.",
      summary:
        "The target is not just getting shredded once. It is staying lean, aesthetic, and active without needing bodybuilder-level effort to hold the look.",
      timeframe: "Current 2026 post",
      result:
        "Recent physique content supports the brand lane: lean, athletic, aesthetic, and sustainable.",
      image: {
        src: "/images/topspin.jpg",
        alt: "Abe Seth in a lean athletic physique during a tennis session.",
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
        src: "/images/client-transformations/jake-hudson.jpg",
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
        src: "/images/client-transformations/rony-polanco.jpg",
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
        src: "/images/client-transformations/sudie-progress.jpg",
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
        src: "/images/client-transformations/gordan-progress.jpg",
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
        src: "/images/client-transformations/maxwell-12-weeks.jpg",
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
        src: "/images/client-transformations/aaron-progress.jpg",
        alt: "Client progress spotlight featuring Aaron.",
      },
    },
    {
      id: "cameron-lifestyle",
      clientName: "Cameron",
      note: "A full lifestyle shift built from applying a simple plan consistently.",
      timeframe: "October 2017",
      sourceUrl: "https://www.instagram.com/p/BaCZH82HVn1/",
      image: {
        src: "/images/client-transformations/cameron-lifestyle.jpg",
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
        src: "/images/client-transformations/mike-durkot.jpg",
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
        src: "/images/client-transformations/camilo-jimenez.jpg",
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
        src: "/images/client-transformations/kelly-results.jpg",
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
        "Your application is reviewed for fit, current training reality, and whether the coaching offer is the right tool. If it is, the next step is a direct follow-up with onboarding details.",
    },
  ],
  process: [
    {
      title: "Apply",
      description:
        "Share your current physique, training history, and what has been preventing the next jump in look or consistency.",
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
      name: "name",
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
      name: "instagram",
      label: "Instagram handle",
      type: "text",
      placeholder: "@yourhandle",
      helper: "Optional, but useful if your current physique proof lives there.",
    },
    {
      name: "experience",
      label: "Training experience",
      type: "select",
      placeholder: "Select your training background",
      options: ["Less than 1 year", "1-3 years", "3-5 years", "5+ years"],
      required: true,
    },
    {
      name: "goal",
      label: "Primary goal",
      type: "textarea",
      placeholder: "What do you want your physique to look like in the next phase?",
      required: true,
    },
    {
      name: "stickingPoint",
      label: "What keeps stalling progress?",
      type: "textarea",
      placeholder: "Training consistency, food structure, recovery, spinning your wheels, rebound weight gain, or something else.",
      required: true,
    },
  ],
};

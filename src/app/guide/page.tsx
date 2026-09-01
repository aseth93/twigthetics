import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GuideCheckoutLink } from "@/components/guide-checkout-link";
import { GuideCheckoutRecovery } from "@/components/guide-checkout-recovery";
import { GuidePreviewForm } from "@/components/guide-preview-form";
import { GuideViewTracker } from "@/components/guide-view-tracker";
import { siteConfig } from "@/content/site-config";
import { getGuideOffer } from "@/lib/guide/constants";
import { getPublishedGuideTestimonials } from "@/lib/guide/funnel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Lean, Athletic Physique Guide | Twigthetics",
  description:
    "A complete system for getting lean, building muscle, or recomposing with practical nutrition calculations, efficient training, and clear adjustment rules.",
  openGraph: {
    title: "The Lean, Athletic Physique Guide",
    description:
      "The knowledge and structure to build and maintain your physique without living in the gym.",
    type: "website",
  },
};

const outcomes = [
  "Calculate calories, protein, and practical macro targets for your goal.",
  "Choose the right fat-loss, muscle-gain, or recomposition approach.",
  "Build an efficient program around your schedule, equipment, and experience.",
  "Control hunger with repeatable meals and high-volume food strategies.",
  "Track progress correctly and know when the plan actually needs to change.",
  "Transition into maintenance without immediately giving back the result.",
];

const guidePreviews = [
  {
    src: "/images/guide/previews/macro-setup.png",
    alt: "Macro setup page showing protein, fat, and carbohydrate calculation guidance.",
    label: "Calculate your targets",
  },
  {
    src: "/images/guide/previews/meal-templates.png",
    alt: "Sample meal templates page for cutting and gaining muscle.",
    label: "Build repeatable meals",
  },
  {
    src: "/images/guide/previews/training-routine.png",
    alt: "Five-day physique training routine from the guide.",
    label: "Follow complete routines",
  },
  {
    src: "/images/guide/previews/personal-calculator.png",
    alt: "Personal calorie and macro calculator worksheet from the guide.",
    label: "Turn the plan into your plan",
  },
];

const resultProof = [
  {
    src: "/images/client-transformations/previews/aaron-progress.jpg",
    alt: "Aaron's client physique transformation.",
  },
  {
    src: "/images/client-transformations/previews/maxwell-12-weeks.jpg",
    alt: "Maxwell's 12-week client physique transformation.",
  },
  {
    src: "/images/client-transformations/previews/kelly-results.jpg",
    alt: "Kelly's client physique transformation.",
  },
];

export default async function GuidePage() {
  const offer = getGuideOffer();
  const testimonials = await getPublishedGuideTestimonials();

  return (
    <main className="grain min-h-screen overflow-hidden pb-24 lg:pb-0">
      <GuideViewTracker priceCents={offer.priceCents} />

      <header className="border-b border-[var(--line)] bg-[rgba(246,239,230,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[84rem] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="type-display text-2xl uppercase text-[var(--ink)]">
            Twigthetics
          </Link>
          <GuideCheckoutLink
            className="btn-primary btn-guide-glow min-h-[2.8rem] px-4 text-[0.72rem] sm:text-[0.8rem]"
            priceCents={offer.priceCents}
          >
            Get the guide - {offer.formattedPrice}
          </GuideCheckoutLink>
        </div>
      </header>

      <GuideCheckoutRecovery />

      {offer.isLaunchOfferActive ? (
        <section className="section-shell pb-0 pt-5">
          <div className="flex flex-col gap-3 rounded-[1.35rem] border border-[rgba(77,151,82,0.34)] bg-[rgba(45,105,53,0.1)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-[var(--forest)]">
              Launch offer: {offer.formattedPrice} instead of {offer.formattedListPrice}
            </p>
            <p className="text-sm text-[var(--muted)]">
              Ends September 7 at 11:59 PM Pacific. Then the price returns to {offer.formattedListPrice}.
            </p>
          </div>
        </section>
      ) : null}

      <section className="section-shell py-10 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div>
            <p className="eyebrow">The complete self-directed system</p>
            <h1 className="display-title mt-4 max-w-4xl text-[var(--ink)]">
              Know exactly what to do with your training and nutrition.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              Read it end to end, apply it, and you should have the knowledge and
              structure required to get lean, build muscle, or do both together.
              Coaching can add accountability. This gives you the full framework.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <GuideCheckoutLink
                className="btn-primary btn-guide-glow w-full sm:w-auto"
                priceCents={offer.priceCents}
              >
                Get instant access - {offer.formattedPrice}
              </GuideCheckoutLink>
              <p className="text-sm leading-6 text-[var(--muted)]">
                One payment. Permanent account access.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--forest)]">
              <span>Instant access</span>
              <span>Secure Stripe checkout</span>
              <span>14-day satisfaction guarantee</span>
            </div>

            <a
              href="#free-preview"
              className="mt-5 inline-flex text-sm font-semibold text-[var(--ink)] underline decoration-[var(--accent)] decoration-2 underline-offset-4"
            >
              Get the free 5-page preview
            </a>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                ["43", "Practical pages"],
                ["3", "Goal pathways"],
                [offer.formattedPrice, "One time"],
              ].map(([value, label]) => (
                <div key={label} className="stat-chip">
                  <p className="type-display text-xl uppercase text-[var(--ink)] sm:text-2xl">
                    {value}
                  </p>
                  <p className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-[var(--muted)] sm:text-[0.7rem]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 rounded-full bg-[rgba(63,142,76,0.18)] blur-3xl" />
            <div className="surface-panel relative overflow-hidden p-3 sm:p-4">
              <Image
                src="/images/guide/lean-athletic-physique-guide-cover.png"
                alt="Cover of The Lean, Athletic Physique Guide by Abe Seth"
                width={1020}
                height={1320}
                priority
                className="h-auto w-full rounded-[1.25rem]"
              />
            </div>
            <div className="absolute -bottom-5 -left-3 rounded-full border border-[var(--line)] bg-[#fffaf3] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--forest)] shadow-xl sm:left-5">
              By IFBB Pro Abe Seth
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="dark-panel overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div className="grid grid-cols-[0.42fr_0.58fr] gap-4 lg:grid-cols-1">
              <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.04]">
                <Image
                  src="/images/coach/coach-stage-checkin.jpg"
                  alt="IFBB Pro Abe Seth in competition condition."
                  width={900}
                  height={1200}
                  sizes="(max-width: 1024px) 38vw, 330px"
                  className="h-full min-h-44 w-full object-cover object-top lg:aspect-[4/5]"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="eyebrow text-white/55">Built from experience</p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                  Written by IFBB Pro Abe Seth.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  The same principles used to build high-level condition and real client results, organized so you can apply them yourself.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-white/55">Real-world proof</p>
                  <p className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    The system is built around outcomes, not theory alone.
                  </p>
                </div>
                <span className="hidden text-xs uppercase tracking-[0.14em] text-white/45 sm:block">
                  Client transformations
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
                {resultProof.map((result) => (
                  <div
                    key={result.src}
                    className="overflow-hidden rounded-[0.9rem] border border-white/10 bg-white sm:rounded-[1.2rem]"
                  >
                    <Image
                      src={result.src}
                      alt={result.alt}
                      width={720}
                      height={900}
                      sizes="(max-width: 640px) 29vw, (max-width: 1024px) 30vw, 270px"
                      className="aspect-[4/5] h-auto w-full object-contain"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-white/60">
                  43 practical pages. Exact calculations. Complete routines. One payment.
                </p>
                <GuideCheckoutLink
                  className="btn-primary btn-guide-glow min-h-12 w-full shrink-0 px-5 sm:w-auto"
                  priceCents={offer.priceCents}
                >
                  Get the guide - {offer.formattedPrice}
                </GuideCheckoutLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="surface-panel overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Preview the actual guide</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
                See the calculators, meal systems, and routines before you buy.
              </h2>
            </div>
            <a
              href="#free-preview"
              className="btn-secondary w-full shrink-0 sm:w-auto"
            >
              Email me the preview
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {guidePreviews.map((preview) => (
              <figure key={preview.src} className="group min-w-0">
                <div className="overflow-hidden rounded-[1rem] border border-[var(--line)] bg-[#f6efe6] shadow-[0_18px_45px_rgba(38,30,21,0.12)] sm:rounded-[1.35rem]">
                  <Image
                    src={preview.src}
                    alt={preview.alt}
                    width={893}
                    height={1155}
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 280px"
                    className="h-auto w-full transition duration-500 group-hover:scale-[1.025]"
                  />
                </div>
                <figcaption className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] sm:text-xs">
                  {preview.label}
                </figcaption>
              </figure>
            ))}
          </div>

          <div
            id="free-preview"
            className="mt-8 grid gap-6 border-t border-[var(--line)] pt-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"
          >
            <div>
              <p className="eyebrow">Free five-page preview</p>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
                Read real pages before paying.
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Enter your email and I will send the preview immediately. The full guide includes all 43 pages, every goal pathway, complete worksheets, and permanent account access.
              </p>
            </div>
            <GuidePreviewForm />
          </div>

          <div className="mt-7 flex flex-col gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              One payment. Immediate account access. No subscription.
            </p>
            <GuideCheckoutLink
              className="btn-primary btn-guide-glow w-full sm:w-auto"
              priceCents={offer.priceCents}
            >
              Get the complete guide - {offer.formattedPrice}
            </GuideCheckoutLink>
          </div>
        </div>
      </section>

      {testimonials.length ? (
        <section className="section-shell pt-0">
          <div className="surface-panel p-6 sm:p-8 lg:p-10">
            <p className="eyebrow">Guide feedback</p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
              What readers say after using it.
            </h2>
            <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <blockquote
                  key={testimonial.id}
                  className="rounded-[1.25rem] border border-[var(--line)] bg-white/60 p-5"
                >
                  <p className="text-sm leading-7 text-[var(--muted)]">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <footer className="mt-4 font-semibold text-[var(--ink)]">
                    {testimonial.displayName}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-shell pt-0">
        <div className="dark-panel p-6 sm:p-10 lg:p-12">
          <p className="eyebrow text-white/55">Inside the guide</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <div>
              <h2 className="display-title text-white">
                A complete operating system, not another list of tips.
              </h2>
              <p className="mt-5 text-base leading-8 text-white/70">
                Every section leads into the next: choose the goal, calculate the
                starting plan, execute it, measure the result, and make controlled
                decisions from real data.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {outcomes.map((outcome, index) => (
                <div
                  key={outcome}
                  className="rounded-[1.2rem] border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/78"
                >
                  <span className="mr-2 text-[var(--accent-soft)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {outcome}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="surface-panel p-6 sm:p-8 md:p-10">
            <p className="eyebrow">What you get</p>
            <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
              Everything needed to run the process yourself.
            </h2>
            <div className="mt-7 space-y-3">
              {siteConfig.guideOffer.modules.map((module) => (
                <div
                  key={module.title}
                  className="rounded-[1.2rem] border border-[var(--line)] bg-white/60 p-4"
                >
                  <h3 className="font-semibold text-[var(--ink)]">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {module.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel flex flex-col justify-between p-6 sm:p-8 md:p-10">
            <div>
              <p className="eyebrow">Straightforward guarantee</p>
              <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
                Try it for 14 days.
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--muted)]">
                Achieving and maintaining a good physique is not complicated when
                the principles are organized clearly. Read the guide, apply it, and
                if you are dissatisfied within 14 days of purchase, reply to your
                purchase email or DM @twigthetics for a refund.
              </p>
            </div>

            <div className="mt-10 rounded-[1.4rem] bg-[var(--forest)] p-6 text-white">
              <p className="type-display text-3xl uppercase">Start with the guide.</p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Create your account after checkout and access your copy immediately.
              </p>
              <GuideCheckoutLink
                className="btn-primary btn-guide-glow mt-6 min-h-[3.5rem] w-full px-6"
                priceCents={offer.priceCents}
              >
                Get instant access - {offer.formattedPrice}
              </GuideCheckoutLink>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] px-4 py-8 text-center text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        Twigthetics · Abe Seth · IFBB Pro
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[rgba(25,23,19,0.96)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_40px_rgba(22,18,13,0.28)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1 text-white">
            <p className="text-sm font-semibold">Complete guide</p>
            <p className="text-[0.68rem] text-white/60">Instant access · one payment</p>
          </div>
          <GuideCheckoutLink
            className="btn-primary btn-guide-glow min-h-12 shrink-0 px-5 text-[0.7rem]"
            priceCents={offer.priceCents}
          >
            Get it - {offer.formattedPrice}
          </GuideCheckoutLink>
        </div>
      </div>
    </main>
  );
}

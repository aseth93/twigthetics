import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GuideCheckoutLink } from "@/components/guide-checkout-link";
import { GuideViewTracker } from "@/components/guide-view-tracker";
import { siteConfig } from "@/content/site-config";

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

export default function GuidePage() {
  return (
    <main className="grain min-h-screen overflow-hidden">
      <GuideViewTracker />

      <header className="border-b border-[var(--line)] bg-[rgba(246,239,230,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[84rem] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="type-display text-2xl uppercase text-[var(--ink)]">
            Twigthetics
          </Link>
          <GuideCheckoutLink className="btn-primary btn-guide-glow min-h-[2.8rem] px-4 text-[0.72rem] sm:text-[0.8rem]">
            Get the guide - $49.99
          </GuideCheckoutLink>
        </div>
      </header>

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
              <GuideCheckoutLink className="btn-primary btn-guide-glow w-full sm:w-auto">
                Get instant access - $49.99
              </GuideCheckoutLink>
              <p className="text-sm leading-6 text-[var(--muted)]">
                One payment. Permanent account access.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                ["43", "Practical pages"],
                ["3", "Goal pathways"],
                ["$49.99", "One time"],
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
                If you are dissatisfied, message me.
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--muted)]">
                Achieving and maintaining a good physique is not complicated when
                the principles are organized clearly. Read the guide, apply it, and
                if you are dissatisfied with the purchase, DM @twigthetics.
              </p>
            </div>

            <div className="mt-10 rounded-[1.4rem] bg-[var(--forest)] p-6 text-white">
              <p className="type-display text-3xl uppercase">Start with the guide.</p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Create your account after checkout and access your copy immediately.
              </p>
              <GuideCheckoutLink className="btn-guide-glow mt-6 min-h-[3.5rem] w-full px-6">
                Get instant access - $49.99
              </GuideCheckoutLink>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] px-4 py-8 text-center text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        Twigthetics · Abe Seth · IFBB Pro
      </footer>
    </main>
  );
}

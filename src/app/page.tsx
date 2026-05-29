import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ApplicationForm } from "@/components/application-form";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/content/site-config";
import type { ClientTransformation, Transformation } from "@/types/site";

const navItems = [
  { href: "#proof", label: "Proof" },
  { href: "#coaching", label: "Coaching" },
  { href: "#guide", label: "Guide" },
  { href: "#faq", label: "FAQ" },
  { href: "#apply", label: "Apply" },
];

const approachPoints = [
  "Lean enough to look good shirtless.",
  "Athletic enough to move well outside the gym.",
  "Sustainable enough to keep without killing yourself for it.",
];

function TransformationCard({
  transformation,
}: {
  transformation: Transformation;
}) {
  return (
    <article className="surface-panel overflow-hidden">
      <div className="border-b border-[var(--line)] bg-white/55 px-5 py-4">
        <p className="eyebrow text-[var(--muted)]">{transformation.label}</p>
        <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
          {transformation.title}
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
          {transformation.summary}
        </p>
      </div>

      {transformation.comparison ? (
        <div className="grid grid-cols-1 gap-px bg-[var(--line)] md:grid-cols-2">
          {[
            {
              caption: transformation.comparison.before.caption,
              image: transformation.comparison.before,
            },
            {
              caption: transformation.comparison.after.caption,
              image: transformation.comparison.after,
            },
          ].map((item) => (
            <div key={item.caption} className="bg-[var(--canvas)]">
              <div className="relative aspect-[4/4] overflow-hidden">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  unoptimized
                  loading="eager"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="px-5 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : transformation.image ? (
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={transformation.image.src}
            alt={transformation.image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover object-top"
          />
        </div>
      ) : null}

      <div className="border-t border-[var(--line)] px-5 py-4">
        <p className="text-sm leading-6 text-[var(--muted)]">
          {transformation.result}
        </p>
      </div>
    </article>
  );
}

function HeroTransformationCard({
  transformation,
  style,
}: {
  transformation: ClientTransformation;
  style?: CSSProperties;
}) {
  return (
    <a
      href={transformation.sourceUrl}
      target="_blank"
      rel="noreferrer"
      className="surface-panel proof-float group block overflow-hidden p-3"
      style={style}
    >
      <div className="aspect-square w-full rounded-[1.45rem] border border-[var(--line)] bg-[#efe5d7] p-2">
        <div className="relative h-full w-full overflow-hidden rounded-[1rem]">
          <Image
            src={transformation.image.src}
            alt={transformation.image.alt}
            fill
            sizes="(max-width: 767px) 70vw, (max-width: 1280px) 18rem, 15rem"
            className="object-contain object-center"
          />
        </div>
      </div>

      <div className="px-2 pb-1 pt-4">
        <p className="eyebrow text-[var(--muted)]">Client Transformation</p>
        <p className="mt-2 text-xl font-semibold text-[var(--ink)]">
          {transformation.clientName}
        </p>
      </div>
    </a>
  );
}

function ClientTransformationCard({
  transformation,
}: {
  transformation: ClientTransformation;
}) {
  return (
    <a
      href={transformation.sourceUrl}
      target="_blank"
      rel="noreferrer"
      className="surface-panel group block overflow-hidden p-3 transition duration-300 hover:-translate-y-1"
    >
      <div className="aspect-square w-full rounded-[1.45rem] border border-[var(--line)] bg-[#efe5d7] p-2">
        <div className="relative h-full w-full overflow-hidden rounded-[1rem]">
          <Image
            src={transformation.image.src}
            alt={transformation.image.alt}
            fill
            sizes="(max-width: 640px) 82vw, (max-width: 1280px) 33vw, 20vw"
            className="object-contain object-center"
          />
        </div>
      </div>

      <div className="px-2 pb-2 pt-4">
        <p className="eyebrow text-[var(--muted)]">{transformation.clientName}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
          {transformation.note}
        </p>
      </div>
    </a>
  );
}

export default function Home() {
  const hasGuideCheckout = Boolean(siteConfig.links.guideCheckout);
  const hasApplicationEndpoint = Boolean(process.env.DATABASE_URL?.trim());
  const featuredClientTransformations = siteConfig.clientTransformations.slice(0, 6);
  const desktopHeroTransformations = [
    ...featuredClientTransformations,
    ...featuredClientTransformations,
  ];
  const heroHeadlineWords = siteConfig.brand.headline.split(" ");
  const primaryCtaHref = "#apply";
  const primaryCtaLabel = "Sign up for coaching";

  return (
    <div className="relative overflow-x-hidden">
      <div className="grain pointer-events-none fixed inset-0 opacity-50" />
      <SiteHeader
        brandName={siteConfig.brand.name}
        navItems={navItems}
        primaryHref={primaryCtaHref}
        primaryLabel={primaryCtaLabel}
        secondaryHref="/login"
        secondaryLabel="Member Login"
      />

      <main>
        <section id="top" className="section-shell pt-40 md:pt-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.78fr)] lg:items-start">
            <div className="page-reveal min-w-0 lg:pr-6">
              <p className="eyebrow hidden sm:block">{siteConfig.brand.eyebrow}</p>
              <h1 className="display-headline mt-5 max-w-[8.9ch]">
                {heroHeadlineWords.map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    className="block"
                  >
                    {word}
                  </span>
                ))}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] md:max-w-[36rem] md:text-xl">
                {siteConfig.brand.subheadline}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={primaryCtaHref} className="btn-primary w-full text-white sm:w-auto">
                  Sign up for coaching
                </Link>
                <Link
                  href="#guide"
                  className="btn-secondary w-full text-[var(--ink)] sm:w-auto"
                >
                  Guide Coming Soon
                </Link>
              </div>

              <div className="mt-9 md:hidden">
                <div>
                  <div>
                    <p className="eyebrow text-[var(--muted)]">Client Proof</p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                      Fat loss, recomposition, and physique-building results
                      from real clients.
                    </p>
                  </div>
                </div>

                <div className="proof-rail mt-5 flex gap-4 overflow-x-auto pb-3">
                  {featuredClientTransformations.map((transformation, index) => (
                    <div
                      key={transformation.id}
                      className="min-w-[78vw] max-w-[17rem] snap-start first:pl-px"
                    >
                      <HeroTransformationCard
                        transformation={transformation}
                        style={{
                          animationDelay: `${index * 140}ms`,
                          animationDuration: `${7200 + index * 220}ms`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-3">
                {siteConfig.coach.metrics.map((metric) => (
                  <div key={metric.label} className="stat-chip">
                    <p className="type-display text-[1.02rem] uppercase leading-[0.88] tracking-[-0.045em] text-[var(--ink)] sm:text-[1.34rem] lg:text-[1.46rem]">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--muted)] sm:text-[0.74rem]">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="page-reveal hidden min-w-0 md:block lg:pl-4 xl:pl-8"
              style={{ animationDelay: "120ms" }}
            >
              <div className="relative ml-auto w-full max-w-[34rem] xl:max-w-[38rem]">
                <div>
                  <div>
                    <p className="eyebrow">Client Transformations</p>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
                      Real results across different starting points, timelines,
                      and physique goals.
                    </p>
                  </div>
                </div>

                <div className="proof-carousel mt-6 overflow-hidden rounded-[2rem]">
                  <div className="proof-carousel-track flex w-max gap-4 py-2">
                    {desktopHeroTransformations.map((transformation, index) => (
                      <div
                        key={`${transformation.id}-${index}`}
                        className="w-[13rem] shrink-0 xl:w-[14rem]"
                      >
                        <HeroTransformationCard
                          transformation={transformation}
                          style={{
                            animationDelay: `${(index % featuredClientTransformations.length) * 160}ms`,
                            animationDuration: `${7600 + (index % featuredClientTransformations.length) * 260}ms`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-y-[4.75rem] left-0 hidden w-12 bg-[linear-gradient(90deg,var(--canvas)_0%,rgba(246,239,230,0)_100%)] lg:block" />
                <div className="pointer-events-none absolute inset-y-[4.75rem] right-0 hidden w-12 bg-[linear-gradient(270deg,var(--canvas)_0%,rgba(246,239,230,0)_100%)] lg:block" />
                <div className="absolute -left-6 top-10 hidden h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(141,107,61,0.26),_transparent_72%)] blur-2xl lg:block" />
                <div className="absolute -right-8 bottom-12 hidden h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(39,49,39,0.18),_transparent_74%)] blur-3xl lg:block" />
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="section-shell">
          <div className="page-reveal" style={{ animationDelay: "120ms" }}>
            <div>
              <div>
                <p className="eyebrow text-[var(--muted)]">Client Spotlights</p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
                  Long-term proof from real client transformations.
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  A mix of fat loss, recomposition, and muscle-building results
                  from past clients.
                </p>
              </div>
            </div>

            <div className="proof-rail mt-8 flex gap-4 overflow-x-auto pb-3 md:hidden">
              {siteConfig.clientTransformations.map((transformation, index) => (
                <div
                  key={transformation.id}
                  className="min-w-[78vw] max-w-[18rem] snap-start"
                  style={{ animationDelay: `${160 + index * 50}ms` }}
                >
                  <ClientTransformationCard transformation={transformation} />
                </div>
              ))}
            </div>

            <div className="mt-8 hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {siteConfig.clientTransformations.map((transformation, index) => (
                <div
                  key={transformation.id}
                  className="page-reveal"
                  style={{ animationDelay: `${160 + index * 50}ms` }}
                >
                  <ClientTransformationCard transformation={transformation} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <div className="page-reveal" style={{ animationDelay: "260ms" }}>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="eyebrow text-[var(--muted)]">Coach Proof</p>
                  <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
                    The standard starts with the coach.
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                    Lean, athletic, aesthetic, and maintainable without needing
                    bodybuilding-level effort year-round.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
              {siteConfig.transformations.map((transformation, index) => (
                <div
                  key={transformation.id}
                  className="page-reveal"
                  style={{ animationDelay: `${320 + index * 80}ms` }}
                >
                  <TransformationCard transformation={transformation} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="coaching" className="section-shell">
          <div className="dark-panel page-reveal grid grid-cols-1 gap-8 overflow-hidden p-6 sm:p-8 md:p-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading
                eyebrow="Online Coaching"
                title={siteConfig.coachingOffer.title}
                description={siteConfig.coachingOffer.summary}
                invert
              />

              <p className="mt-8 text-sm uppercase tracking-[0.22em] text-white/55">
                Best fit
              </p>
              <p className="mt-3 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                {siteConfig.coachingOffer.audience}
              </p>

              <div className="mt-8">
                <Link href={primaryCtaHref} className="btn-ghost">
                  {siteConfig.coachingOffer.ctaLabel}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 sm:p-6">
                <p className="eyebrow text-white/55">Included</p>
                <ul className="mt-5 space-y-4 text-sm leading-7 text-white/80">
                  {siteConfig.coachingOffer.deliverables.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-[0.45rem] h-2 w-2 rounded-full bg-[var(--accent-soft)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 sm:p-6">
                <p className="eyebrow text-white/55">Expectation</p>
                <ul className="mt-5 space-y-4 text-sm leading-7 text-white/80">
                  {siteConfig.coachingOffer.commitments.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-[0.45rem] h-2 w-2 rounded-full bg-[var(--accent-soft)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="guide" className="section-shell">
          <div className="page-reveal grid grid-cols-1 gap-8 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="surface-panel p-6 sm:p-8 md:p-10">
              <SectionHeading
                eyebrow="Digital Guide"
                title={siteConfig.guideOffer.title}
                description={siteConfig.guideOffer.summary}
              />

              <div className="mt-8 space-y-3">
                {siteConfig.guideOffer.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-2xl border border-[var(--line)] bg-white/55 px-4 py-4 text-sm leading-6 text-[var(--muted)]"
                  >
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                {hasGuideCheckout ? (
                  <a
                    href={siteConfig.links.guideCheckout}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                  >
                    {siteConfig.guideOffer.ctaLabel}
                  </a>
                ) : (
                  <button type="button" className="btn-disabled" disabled>
                    {siteConfig.guideOffer.placeholderLabel}
                  </button>
                )}

                <p className="text-sm leading-6 text-[var(--muted)]">
                  {siteConfig.guideOffer.statusNote}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {siteConfig.guideOffer.modules.map((module, index) => (
                <article
                  key={module.title}
                  className="surface-panel page-reveal p-5 sm:p-6"
                  style={{ animationDelay: `${80 + index * 60}ms` }}
                >
                  <p className="eyebrow text-[var(--muted)]">
                    Module {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold text-[var(--ink)]">
                    {module.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {module.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="section-shell">
          <div className="page-reveal">
            <SectionHeading
              eyebrow="Process"
              title="Clear structure. Tight feedback. No wasted motion."
              description="The coaching flow is intentionally simple: qualify the fit, build the plan, and tighten the execution week after week."
            />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {siteConfig.process.map((step, index) => (
              <article
                key={step.title}
                className="surface-panel page-reveal p-5 sm:p-6"
                style={{ animationDelay: `${120 + index * 80}ms` }}
              >
                <p className="type-display text-5xl leading-none text-[var(--accent)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 text-2xl font-semibold text-[var(--ink)]">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="section-shell">
          <div className="page-reveal grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="surface-panel p-6 sm:p-8 md:p-10">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[var(--line)]">
                  <Image
                    src={siteConfig.coach.portrait.src}
                    alt={siteConfig.coach.portrait.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="eyebrow text-[var(--muted)]">Coach</p>
                  <h2 className="text-2xl font-semibold text-[var(--ink)]">
                    {siteConfig.coach.name}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {siteConfig.coach.title}
                  </p>
                </div>
              </div>

              <p className="mt-8 text-base leading-7 text-[var(--ink)] sm:text-lg sm:leading-8">
                {siteConfig.coach.summary}
              </p>
            </div>

            <div className="dark-panel p-6 sm:p-8 md:p-10">
              <p className="eyebrow text-white/55">Approach</p>
              <p className="mt-4 text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                {siteConfig.coach.bio}
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3">
                {approachPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white/78"
                  >
                    {point}
                  </div>
                ))}
              </div>

              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noreferrer"
                className="quiet-link mt-8 inline-flex text-white"
              >
                Follow @{siteConfig.coach.handle}
              </a>
            </div>
          </div>
        </section>

        <section id="faq" className="section-shell">
          <div className="page-reveal">
            <SectionHeading
              eyebrow="FAQ"
              title="Direct answers to the obvious questions."
              description="No buried fine print. If the fit is wrong, the application process should make that clear early."
            />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4">
            {siteConfig.faq.map((item, index) => (
              <details
                key={item.question}
                className="surface-panel page-reveal group px-5 py-4 sm:px-6 sm:py-5"
                style={{ animationDelay: `${80 + index * 60}ms` }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold leading-6 text-[var(--ink)] sm:gap-6 sm:text-lg">
                  <span>{item.question}</span>
                  <span className="type-display text-3xl leading-none text-[var(--accent)] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section id="apply" className="section-shell pb-16">
          <div className="page-reveal grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="surface-panel p-6 sm:p-8 md:p-10">
              <SectionHeading
                eyebrow="Apply"
                title="If you want coaching, sign up here."
                description="The intake below covers training, nutrition, recovery, current physique, and start-date fit so the coaching decision is made on real context instead of guesswork."
              />

              <div className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-white/50 p-4 text-sm leading-7 text-[var(--muted)] sm:p-5">
                <p>
                  Coaching is for people who want structure, accountability,
                  and precise adjustments. The intake is detailed on purpose so
                  the plan starts from your real training, food, recovery, and
                  current physique instead of a generic template.
                </p>
                <p className="mt-4">
                  {hasApplicationEndpoint
                    ? "Intake is live."
                    : "The form is built and ready. Until the submission endpoint is connected, the fallback contact route is Instagram DM."}
                </p>
              </div>
            </div>

            <div className="page-reveal" style={{ animationDelay: "120ms" }}>
              <ApplicationForm
                fields={siteConfig.applicationFields}
                hasEndpoint={hasApplicationEndpoint}
                instagramUrl={siteConfig.links.instagram}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="section-shell border-t border-[var(--line)] py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="type-display text-3xl uppercase leading-none text-[var(--ink)]">
              {siteConfig.brand.name}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Online physique coaching and a practical guide for maintaining an
              aesthetic build without living on extremes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--muted)]">
            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noreferrer"
              className="quiet-link"
            >
              Instagram
            </a>
            <Link href="#apply" className="quiet-link">
              Contact
            </Link>
            <Link href="/privacy" className="quiet-link">
              Privacy
            </Link>
            <Link href="/terms" className="quiet-link">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

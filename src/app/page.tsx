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
        <div className="grid gap-px bg-[var(--line)] md:grid-cols-2">
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
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          {transformation.timeframe}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {transformation.result}
        </p>
      </div>
    </article>
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
      className="surface-panel group block overflow-hidden transition duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={transformation.image.src}
          alt={transformation.image.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      </div>

      <div className="border-t border-[var(--line)] px-4 py-4">
        <p className="eyebrow text-[var(--muted)]">{transformation.clientName}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
          {transformation.note}
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
          {transformation.timeframe}
        </p>
      </div>
    </a>
  );
}

export default function Home() {
  const hasGuideCheckout = Boolean(siteConfig.links.guideCheckout);
  const hasApplicationEndpoint = Boolean(siteConfig.links.applicationEndpoint);

  return (
    <div className="relative overflow-x-hidden">
      <div className="grain pointer-events-none fixed inset-0 opacity-50" />
      <SiteHeader
        brandName={siteConfig.brand.name}
        navItems={navItems}
        primaryHref="#apply"
        primaryLabel="Apply"
        secondaryHref="/login"
        secondaryLabel="Member Login"
      />

      <main>
        <section id="top" className="section-shell pt-28 md:pt-32">
          <div className="grid items-end gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="page-reveal">
              <p className="eyebrow">{siteConfig.brand.eyebrow}</p>
              <h1 className="display-headline mt-5 max-w-4xl">
                {siteConfig.brand.headline}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
                {siteConfig.brand.subheadline}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="#apply" className="btn-primary">
                  Apply for Coaching
                </Link>
                <Link href="#guide" className="btn-secondary">
                  Get the Guide
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {siteConfig.coach.metrics.map((metric) => (
                  <div key={metric.label} className="stat-chip">
                    <p className="type-display text-3xl uppercase leading-none text-[var(--ink)]">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="page-reveal lg:pl-8" style={{ animationDelay: "120ms" }}>
              <div className="relative mx-auto max-w-xl">
                <div className="absolute -left-6 top-10 hidden h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(141,107,61,0.26),_transparent_72%)] blur-2xl md:block" />
                <div className="absolute -right-8 bottom-12 hidden h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(39,49,39,0.18),_transparent_74%)] blur-3xl md:block" />

                <div className="hero-frame relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.36))]" />
                  <Image
                    src={siteConfig.coach.heroImage.src}
                    alt={siteConfig.coach.heroImage.alt}
                    width={1080}
                    height={1129}
                    priority
                    className="h-auto w-full object-cover object-top"
                  />
                </div>

                <div className="surface-panel absolute -left-3 bottom-6 max-w-[15rem] px-4 py-4 md:-left-8">
                  <p className="eyebrow text-[var(--muted)]">Coach Proof</p>
                  <p className="mt-2 text-base leading-6 text-[var(--ink)]">
                    Lean enough to look sharp, athletic enough to move well,
                    and healthy enough to keep without living on extremes.
                  </p>
                </div>

                <div className="dark-panel absolute -right-2 top-8 max-w-[14rem] px-4 py-4 md:-right-8">
                  <p className="eyebrow text-white/60">Instagram</p>
                  <a
                    href={siteConfig.links.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-lg font-semibold text-white transition hover:text-white/80"
                  >
                    @{siteConfig.coach.handle}
                  </a>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Public physique updates and leaner-look proof used as
                    launch assets on this site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="section-shell">
          <div className="page-reveal">
            <SectionHeading
              eyebrow="Proof of Work"
              title="Proof that the lane is lean, athletic, and aesthetic."
              description="Start with the coach's own physique proof, then back it up with a deeper archive of real client spotlight posts."
            />
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            {siteConfig.transformations.map((transformation, index) => (
              <div
                key={transformation.id}
                className="page-reveal"
                style={{ animationDelay: `${120 + index * 80}ms` }}
              >
                <TransformationCard transformation={transformation} />
              </div>
            ))}
          </div>

          <div className="mt-14 page-reveal" style={{ animationDelay: "260ms" }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow text-[var(--muted)]">Client Spotlights</p>
                <h3 className="mt-2 text-3xl font-semibold text-[var(--ink)]">
                  Long-term proof from real client transformations.
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  These are pulled directly from older public spotlight posts and
                  show the kind of physique changes this coaching lane was built on.
                </p>
              </div>

              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                View Instagram Archive
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {siteConfig.clientTransformations.map((transformation, index) => (
                <div
                  key={transformation.id}
                  className="page-reveal"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <ClientTransformationCard transformation={transformation} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="coaching" className="section-shell">
          <div className="dark-panel page-reveal grid gap-10 overflow-hidden p-8 md:p-12 lg:grid-cols-[0.9fr_1.1fr]">
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
              <p className="mt-3 max-w-xl text-lg leading-8 text-white/80">
                {siteConfig.coachingOffer.audience}
              </p>

              <div className="mt-8">
                <Link href="#apply" className="btn-ghost">
                  {siteConfig.coachingOffer.ctaLabel}
                </Link>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
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

              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
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
          <div className="page-reveal grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="surface-panel p-8 md:p-10">
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

            <div className="grid gap-4 sm:grid-cols-2">
              {siteConfig.guideOffer.modules.map((module, index) => (
                <article
                  key={module.title}
                  className="surface-panel page-reveal p-6"
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

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {siteConfig.process.map((step, index) => (
              <article
                key={step.title}
                className="surface-panel page-reveal p-6"
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
          <div className="page-reveal grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="surface-panel p-8 md:p-10">
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

              <p className="mt-8 text-lg leading-8 text-[var(--ink)]">
                {siteConfig.coach.summary}
              </p>
            </div>

            <div className="dark-panel p-8 md:p-10">
              <p className="eyebrow text-white/55">Approach</p>
              <p className="mt-4 text-lg leading-8 text-white/80">
                {siteConfig.coach.bio}
              </p>

              <div className="mt-8 grid gap-3">
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

          <div className="mt-10 grid gap-4">
            {siteConfig.faq.map((item, index) => (
              <details
                key={item.question}
                className="surface-panel page-reveal group px-6 py-5"
                style={{ animationDelay: `${80 + index * 60}ms` }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold text-[var(--ink)]">
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
          <div className="page-reveal grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="surface-panel p-8 md:p-10">
              <SectionHeading
                eyebrow="Apply"
                title="If you want direct oversight, start here."
                description="The form below is the first filter. Share your current situation, your goal, and what has been blocking the leaner, athletic, aesthetic look you want."
              />

              <div className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-white/50 p-5 text-sm leading-7 text-[var(--muted)]">
                <p>
                  Coaching is for people who want structure, accountability, and
                  precise adjustments. If you only need the playbook, the guide
                  may be enough. If you want eyes on the plan, apply.
                </p>
                <p className="mt-4">
                  {hasApplicationEndpoint
                    ? "Applications are live."
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

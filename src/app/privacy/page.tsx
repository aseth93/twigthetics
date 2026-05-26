import Link from "next/link";

export const metadata = {
  title: "Privacy | Twigthetics",
  description: "Privacy details for Twigthetics coaching applications.",
};

export default function PrivacyPage() {
  return (
    <main className="section-shell min-h-screen pt-28">
      <div className="surface-panel max-w-4xl p-8 md:p-10">
        <p className="eyebrow">Privacy</p>
        <h1 className="display-title mt-4">Application data stays in the coaching lane.</h1>
        <div className="mt-8 space-y-5 text-sm leading-7 text-[var(--muted)] md:text-base">
          <p>
            Twigthetics collects only the information submitted through the
            coaching application form: contact details, training background, and
            goal context.
          </p>
          <p>
            That information is used only to review coaching fit, follow up on
            inquiries, and organize onboarding once the live workflow is wired.
            It is not sold or repackaged.
          </p>
          <p>
            While the first launch version is still wiring external form
            delivery, Instagram remains the fallback contact route.
          </p>
        </div>

        <div className="mt-10">
          <Link href="/" className="btn-secondary">
            Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}

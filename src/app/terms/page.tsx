import Link from "next/link";

export const metadata = {
  title: "Terms | Twigthetics",
  description: "Terms details for Twigthetics coaching and digital products.",
};

export default function TermsPage() {
  return (
    <main className="section-shell min-h-screen pt-28">
      <div className="surface-panel max-w-4xl p-8 md:p-10">
        <p className="eyebrow">Terms</p>
        <h1 className="display-title mt-4">Coaching and guide terms, kept simple.</h1>
        <div className="mt-8 space-y-5 text-sm leading-7 text-[var(--muted)] md:text-base">
          <p>
            Twigthetics coaching and guide content are intended for educational
            and informational use. They are not medical advice.
          </p>
          <p>
            Results depend on execution, consistency, recovery, adherence, and
            factors outside the scope of any template or coaching structure.
          </p>
          <p>
            The digital guide is sold as a one-time purchase through Stripe. A completed
            payment grants the buyer permanent account access to the purchased guide
            version while Twigthetics continues operating the service.
          </p>
          <p>
            Guide access is a personal, non-transferable license. Buyers may use their
            copy for themselves but may not share, resell, upload, reproduce, or
            redistribute it. Guide copies are personalized with the account email and
            order reference to enforce that license.
          </p>
          <p>
            Guide buyers may request a refund within 14 calendar days of purchase by
            replying to the purchase email or messaging @twigthetics. Refund requests
            received after that period are handled at Twigthetics&apos; discretion.
          </p>
          <p>
            Coaching applications are reviewed for fit before onboarding. Coaching and
            guide purchases are separate products.
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

import Link from "next/link";
import { MarketingPreferencesButton } from "@/components/marketing-consent-banner";

export const metadata = {
  title: "Privacy | Twigthetics",
  description: "Privacy details for Twigthetics coaching and digital guide accounts.",
};

export default function PrivacyPage() {
  return (
    <main className="section-shell min-h-screen pt-28">
      <div className="surface-panel max-w-4xl p-8 md:p-10">
        <p className="eyebrow">Privacy</p>
        <h1 className="display-title mt-4">Application data stays in the coaching lane.</h1>
        <div className="mt-8 space-y-5 text-sm leading-7 text-[var(--muted)] md:text-base">
          <p>
            Twigthetics collects information submitted through the coaching application
            and member account flows, including contact details, training background,
            goal context, and account activity needed to operate the portal.
          </p>
          <p>
            That information is used to review coaching fit, operate member accounts,
            deliver purchased digital products, and provide coaching services. It is not
            sold or repackaged.
          </p>
          <p>
            Stripe processes payments. Twigthetics stores the resulting purchase and
            account identifiers needed to verify access, but does not store full card
            details. Campaign parameters included in a landing-page URL may be stored
            with a checkout so Twigthetics can measure which promotion produced a sale.
            Personalized guide copies include the buyer&apos;s account email and order
            reference.
          </p>
          <p>
            When you request the free guide preview, Twigthetics stores your name,
            email address, consent choice, and campaign attribution. The preview email
            is transactional. Optional follow-up emails are only sent when you select
            the consent box, and every follow-up includes an unsubscribe option.
          </p>
          <p>
            Twigthetics also stores first-party guide funnel events such as guide page
            views, preview requests, checkout starts, and completed purchases. These
            records are used to understand conversion performance and improve the site.
          </p>
          <p>
            If you allow advertising cookies, Twigthetics uses the Meta Pixel and
            Conversions API to measure page visits, checkout activity, and guide
            purchases connected to advertising. Meta may receive browser identifiers,
            purchase details, and hashed contact information for attribution and ad
            optimization. Declining optional advertising cookies does not affect site
            access or checkout.
          </p>
          <p>
            <MarketingPreferencesButton />
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

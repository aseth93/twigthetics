import { GuideCheckoutLink } from "@/components/guide-checkout-link";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getGuidePurchaseForMember } from "@/lib/guide/access";
import { GUIDE_TITLE } from "@/lib/guide/constants";

export default async function MemberGuidePage() {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member/guide",
  });
  const purchase = await getGuidePurchaseForMember(viewer.profile.id);

  if (!purchase) {
    return (
      <section className="surface-panel overflow-hidden">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">Digital guide</p>
            <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
              {GUIDE_TITLE}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Get the complete self-directed system for nutrition, training,
              progress tracking, and evidence-based adjustments.
            </p>
          </div>
          <GuideCheckoutLink className="btn-primary">
            Buy once - $49.99
          </GuideCheckoutLink>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="dark-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-white/55">Your guide</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
              {GUIDE_TITLE}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              Your copy is licensed to {viewer.profile.email}. Access it here
              anytime from your Twigthetics account.
            </p>
          </div>
          <a
            href="/api/member/guide/pdf"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost shrink-0"
          >
            Open full-screen
          </a>
        </div>
      </section>

      <section className="surface-panel overflow-hidden p-3 sm:p-5">
        <div className="rounded-[1.35rem] border border-[var(--line)] bg-white/70 px-4 py-4 text-sm leading-6 text-[var(--muted)] sm:hidden">
          Mobile PDF viewers work best full-screen. Use the button above to open
          your personalized guide.
        </div>
        <iframe
          src="/api/member/guide/pdf#toolbar=0&navpanes=0"
          title={GUIDE_TITLE}
          className="hidden h-[78vh] min-h-[720px] w-full rounded-[1.35rem] border border-[var(--line)] bg-white sm:block"
        />
      </section>

      <p className="px-2 text-xs leading-6 text-[var(--muted)]">
        This is a personal-use license. Each served copy contains the purchaser&apos;s
        account email and order reference.
      </p>
    </div>
  );
}

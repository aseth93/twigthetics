import Link from "next/link";
import { RuntimeBanner } from "@/components/portal/runtime-banner";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getMemberDashboardData } from "@/lib/portal/data";
import { formatPortalDate, formatPortalDateTime } from "@/lib/portal/format";
import { getPortalRuntime } from "@/lib/portal/env";

export default async function MemberDashboardPage() {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member",
  });
  const runtime = getPortalRuntime();
  const dashboard = await getMemberDashboardData(viewer);

  return (
    <div className="space-y-6">
      <RuntimeBanner
        viewer={viewer}
        supabaseConfigured={runtime.supabaseConfigured}
        stripeConfigured={runtime.stripeConfigured}
        demoMode={runtime.demoMode}
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="surface-panel p-6">
          <p className="eyebrow">Active plan</p>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
            {dashboard.assignments[0]?.plan.title || "No plan assigned yet"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {dashboard.assignments[0]?.plan.summary ||
              "Once coaching is active, your current block appears here."}
          </p>
        </article>

        <article className="surface-panel p-6">
          <p className="eyebrow">Billing status</p>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
            {dashboard.billing?.status || "Not connected"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {dashboard.billing
              ? `Renews through ${formatPortalDate(dashboard.billing.currentPeriodEnd)}`
              : "Billing portal connects here once Stripe is enabled."}
          </p>
        </article>

        <article className="surface-panel p-6">
          <p className="eyebrow">Last message</p>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
            {dashboard.messages.at(-1)?.sender.fullName || "Inbox ready"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {dashboard.messages.at(-1)
              ? formatPortalDateTime(dashboard.messages.at(-1)?.createdAt)
              : "Use the portal inbox instead of chasing DMs and buried emails."}
          </p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="surface-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Current block</p>
              <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
                {dashboard.assignments[0]?.plan.title || "No live block yet"}
              </h2>
            </div>
            <Link href="/member/plans" className="quiet-link">
              View all plan details
            </Link>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            {dashboard.assignments[0]?.plan.body ||
              "Your training and nutrition structure will appear here after assignment."}
          </p>
        </article>

        <article className="dark-panel p-6">
          <p className="eyebrow text-white/55">Quick links</p>
          <div className="mt-5 grid grid-cols-1 gap-3">
            <Link href="/member/messages" className="btn-ghost">
              Open inbox
            </Link>
            <Link href="/member/documents" className="btn-ghost">
              Open documents
            </Link>
            <Link href="/member/billing" className="btn-ghost">
              Open billing
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}

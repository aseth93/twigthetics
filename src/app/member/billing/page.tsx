import Link from "next/link";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getMemberDashboardData } from "@/lib/portal/data";
import { formatPortalDate } from "@/lib/portal/format";

export default async function MemberBillingPage() {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member/billing",
  });
  const dashboard = await getMemberDashboardData(viewer);
  const billing = dashboard.billing;

  return (
    <div className="grid gap-6">
      {viewer.mode === "demo" ? (
        <article className="rounded-[1.2rem] border border-[rgba(141,107,61,0.22)] bg-[rgba(141,107,61,0.08)] px-4 py-4 text-sm leading-6 text-[var(--ink)]">
          Stripe billing is staged but not live yet. This previews the billing area before
          checkout and customer portal are connected.
        </article>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
      <article className="surface-panel p-6">
        <p className="eyebrow">Billing</p>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
          {billing?.planName || "Twigthetics Coaching"}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Members can manage cards, invoices, and subscription status directly from here.
        </p>

        <div className="mt-6 grid gap-3">
          <div className="rounded-[1.1rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
            Status: <span className="text-[var(--ink)]">{billing?.status || "Not connected"}</span>
          </div>
          <div className="rounded-[1.1rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
            Current period ends:{" "}
            <span className="text-[var(--ink)]">
              {formatPortalDate(billing?.currentPeriodEnd)}
            </span>
          </div>
          <div className="rounded-[1.1rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
            Cancellation at period end:{" "}
            <span className="text-[var(--ink)]">
              {billing?.cancelAtPeriodEnd ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </article>

      <article className="dark-panel p-6">
        <p className="eyebrow text-white/55">Actions</p>
        <div className="mt-5 grid gap-3">
          {viewer.mode === "demo" ? (
            <>
              <span className="btn-disabled">Portal staging</span>
              <span className="btn-disabled">Checkout staging</span>
            </>
          ) : (
            <>
              <Link href="/api/billing/portal" className="btn-ghost">
                Open billing portal
              </Link>
              <Link href="/api/billing/checkout" className="btn-ghost">
                Start checkout
              </Link>
            </>
          )}
        </div>
        <p className="mt-5 text-sm leading-6 text-white/65">
          If Stripe is not connected yet, these links return a safe staging response instead
          of a broken page.
        </p>
      </article>
      </div>
    </div>
  );
}

import Link from "next/link";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getMemberDashboardData } from "@/lib/portal/data";
import { formatPortalDate } from "@/lib/portal/format";

type MemberBillingPageProps = {
  searchParams: Promise<{
    staged?: string;
    checkout?: string;
  }>;
};

export default async function MemberBillingPage({
  searchParams,
}: MemberBillingPageProps) {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member/billing",
  });
  const dashboard = await getMemberDashboardData(viewer);
  const billing = dashboard.billing;
  const params = await searchParams;

  return (
    <div className="grid gap-6">
      {params.staged ? (
        <article className="rounded-[1.2rem] border border-[rgba(141,107,61,0.22)] bg-[rgba(141,107,61,0.08)] px-4 py-4 text-sm leading-6 text-[var(--ink)]">
          Stripe billing is staged but not live yet. Add the Stripe keys and price ID on
          Render to activate portal and checkout actions.
        </article>
      ) : null}

      {params.checkout === "success" ? (
        <article className="rounded-[1.2rem] border border-[rgba(39,49,39,0.18)] bg-[rgba(39,49,39,0.08)] px-4 py-4 text-sm leading-6 text-[var(--forest)]">
          Checkout completed. Billing status will update once the Stripe webhook sync runs.
        </article>
      ) : null}

      {params.checkout === "cancelled" ? (
        <article className="rounded-[1.2rem] border border-[rgba(23,20,17,0.12)] bg-white/70 px-4 py-4 text-sm leading-6 text-[var(--muted)]">
          Checkout was cancelled. You can return here any time to restart it.
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
          <Link href="/api/billing/portal" className="btn-ghost">
            Open billing portal
          </Link>
          <Link href="/api/billing/checkout" className="btn-ghost">
            Start checkout
          </Link>
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

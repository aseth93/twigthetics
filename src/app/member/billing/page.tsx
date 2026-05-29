import Link from "next/link";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getMemberDashboardData } from "@/lib/portal/data";
import { formatPortalDate } from "@/lib/portal/format";

type MemberBillingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSingleParam(input: string | string[] | undefined) {
  return typeof input === "string" ? input : input?.[0] || "";
}

export default async function MemberBillingPage({ searchParams }: MemberBillingPageProps) {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member/billing",
  });
  const params = (await searchParams) || {};
  const dashboard = await getMemberDashboardData(viewer);
  const billing = dashboard.billing;
  const checkoutStatus = readSingleParam(params.checkout);
  const billingStatus = readSingleParam(params.status);

  return (
    <div className="grid grid-cols-1 gap-6">
      {checkoutStatus === "success" ? (
        <article className="rounded-[1.2rem] border border-[rgba(39,49,39,0.18)] bg-[rgba(39,49,39,0.08)] px-4 py-4 text-sm leading-6 text-[var(--forest)]">
          Checkout completed. Your subscription record should appear here as Stripe syncs.
        </article>
      ) : checkoutStatus === "cancelled" ? (
        <article className="rounded-[1.2rem] border border-[rgba(141,107,61,0.22)] bg-[rgba(141,107,61,0.08)] px-4 py-4 text-sm leading-6 text-[var(--ink)]">
          Checkout was cancelled before completion.
        </article>
      ) : billingStatus === "missing" ? (
        <article className="rounded-[1.2rem] border border-[rgba(141,107,61,0.22)] bg-[rgba(141,107,61,0.08)] px-4 py-4 text-sm leading-6 text-[var(--ink)]">
          No Stripe customer profile is attached to this account yet.
        </article>
      ) : billingStatus === "unavailable" ? (
        <article className="rounded-[1.2rem] border border-[rgba(141,107,61,0.22)] bg-[rgba(141,107,61,0.08)] px-4 py-4 text-sm leading-6 text-[var(--ink)]">
          Billing actions are temporarily unavailable.
        </article>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.95fr]">
      <article className="surface-panel p-6">
        <p className="eyebrow">Billing</p>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
          {billing?.planName || "Twigthetics Coaching"}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Members can manage cards, invoices, and subscription status directly from here.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3">
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
          <div className="mt-5 grid grid-cols-1 gap-3">
            <Link href="/api/billing/portal" className="btn-ghost">
              Open billing portal
            </Link>
            <Link href="/api/billing/checkout" className="btn-ghost">
              Start checkout
            </Link>
          </div>
          <p className="mt-5 text-sm leading-6 text-white/65">
            Manage cards, invoices, cancellations, or new subscriptions from here.
          </p>
        </article>
      </div>
    </div>
  );
}

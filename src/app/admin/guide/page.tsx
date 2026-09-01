import Link from "next/link";
import { AdminGuideTestimonials } from "@/components/admin-guide-testimonials";
import { getGuideFunnelDashboard } from "@/lib/guide/funnel";

function percentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function AdminGuidePage() {
  const dashboard = await getGuideFunnelDashboard(30);

  if (!dashboard) {
    return (
      <section className="surface-panel p-8">
        <p className="text-sm text-[var(--muted)]">Guide reporting is unavailable.</p>
      </section>
    );
  }

  const metrics = [
    ["Unique guide views", dashboard.views],
    ["Preview leads", dashboard.previewLeads],
    ["Checkout starts", dashboard.checkoutStarts],
    ["Purchases", dashboard.purchaseCount],
    ["Revenue", money(dashboard.revenueCents)],
  ];

  return (
    <div className="space-y-6">
      <section className="dark-panel p-6 sm:p-8">
        <p className="eyebrow text-white/55">Last 30 days</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-white">Guide funnel</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              First-party views, preview leads, Stripe checkout starts, purchases, and revenue.
            </p>
          </div>
          <Link href="/guide" className="btn-ghost">
            Open sales page
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value]) => (
          <article key={label} className="surface-panel p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["View to preview", percentage(dashboard.viewToLeadRate)],
          ["View to checkout", percentage(dashboard.viewToCheckoutRate)],
          ["Checkout to purchase", percentage(dashboard.checkoutToPurchaseRate)],
        ].map(([label, value]) => (
          <article key={label} className="surface-panel p-6">
            <p className="eyebrow">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="surface-panel p-6">
          <p className="eyebrow">Checkout sources</p>
          <div className="mt-5 grid gap-3">
            {dashboard.sources.length ? (
              dashboard.sources.map((source) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between rounded-[1rem] border border-[var(--line)] bg-white/60 px-4 py-3"
                >
                  <span className="text-sm text-[var(--muted)]">{source.source}</span>
                  <strong>{source.count}</strong>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">No tracked checkout starts yet.</p>
            )}
          </div>
        </article>

        <article className="surface-panel p-6">
          <p className="eyebrow">Recent preview leads</p>
          <div className="mt-5 grid gap-3">
            {dashboard.recentLeads.length ? (
              dashboard.recentLeads.slice(0, 10).map((lead) => (
                <div key={lead.id} className="rounded-[1rem] border border-[var(--line)] bg-white/60 px-4 py-3">
                  <p className="font-semibold text-[var(--ink)]">{lead.firstName || "Preview lead"}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{lead.email}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                    {lead.marketingConsent ? "Follow-up opted in" : "Preview only"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">No preview leads yet.</p>
            )}
          </div>
        </article>
      </section>

      <AdminGuideTestimonials testimonials={dashboard.testimonials} />
    </div>
  );
}

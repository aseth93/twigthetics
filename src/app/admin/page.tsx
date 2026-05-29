import { AdminDocumentForm } from "@/components/portal/admin-document-form";
import { AdminPlanForm } from "@/components/portal/admin-plan-form";
import { MessageThread } from "@/components/portal/message-thread";
import { RuntimeBanner } from "@/components/portal/runtime-banner";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getAdminDashboardData } from "@/lib/portal/data";
import { formatPortalDate, formatRoleLabel } from "@/lib/portal/format";
import { getPortalRuntime } from "@/lib/portal/env";

export default async function AdminDashboardPage() {
  const viewer = await requirePortalViewer({
    role: "coach_admin",
    returnTo: "/admin",
  });
  const runtime = getPortalRuntime();
  const dashboard = await getAdminDashboardData(viewer);

  return (
    <div className="space-y-6">
      <RuntimeBanner
        viewer={viewer}
        databaseConfigured={runtime.databaseConfigured}
        emailConfigured={runtime.emailConfigured}
        stripeConfigured={runtime.stripeConfigured}
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <article className="surface-panel p-6">
          <p className="eyebrow">Members</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
            {dashboard.members.length}
          </h2>
        </article>
        <article className="surface-panel p-6">
          <p className="eyebrow">Plans</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
            {dashboard.plans.length}
          </h2>
        </article>
        <article className="surface-panel p-6">
          <p className="eyebrow">Documents</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
            {dashboard.documents.length}
          </h2>
        </article>
        <article className="surface-panel p-6">
          <p className="eyebrow">Billing records</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
            {dashboard.billingAccounts.length}
          </h2>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.95fr]">
        <article className="surface-panel p-6">
          <p className="eyebrow">Client roster</p>
          <div className="mt-5 grid grid-cols-1 gap-4">
            {dashboard.members.length ? (
              dashboard.members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-[1.2rem] border border-[var(--line)] bg-white/72 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--ink)]">
                        {member.fullName}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">{member.email}</p>
                    </div>
                    <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                      {formatRoleLabel(member.role)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    Joined {formatPortalDate(member.joinedAt)}
                  </p>
                  <p className="mt-3 text-xs text-[var(--muted)]">Member ID: {member.id}</p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">
                Members appear here after they have live accounts.
              </p>
            )}
          </div>
        </article>

        <article className="dark-panel p-6">
          <p className="eyebrow text-white/55">Recent billing states</p>
          <div className="mt-5 grid grid-cols-1 gap-3">
            {dashboard.billingAccounts.length ? (
              dashboard.billingAccounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white/76"
                >
                  <p className="font-medium text-white">{account.planName}</p>
                  <p className="mt-1 text-white/62">{account.memberId}</p>
                  <p className="mt-2 uppercase tracking-[0.16em] text-white/55">
                    {account.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-white/65">
                Billing sync appears here once Stripe webhooks are active.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminPlanForm allowSubmit />
        <AdminDocumentForm allowSubmit />
      </section>

      <section className="grid grid-cols-1 gap-6">
        {dashboard.conversations.length ? (
          dashboard.conversations.map((conversation) => (
            <div key={conversation.thread.id} className="grid grid-cols-1 gap-4">
              <article className="surface-panel p-6">
                <p className="eyebrow">Coach inbox</p>
                <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
                  {conversation.member.fullName}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Send updates directly on-site instead of bouncing the client to a separate
                  app.
                </p>
              </article>
              <MessageThread
                allowSubmit
                memberId={conversation.member.id}
                initialMessages={conversation.messages}
                emptyLabel="No messages in this thread yet."
              />
            </div>
          ))
        ) : (
          <article className="surface-panel p-6 text-sm leading-7 text-[var(--muted)]">
            Conversations appear here after members send or receive their first message.
          </article>
        )}
      </section>
    </div>
  );
}

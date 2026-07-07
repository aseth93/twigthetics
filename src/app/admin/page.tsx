import Link from "next/link";
import { AdminDocumentForm } from "@/components/portal/admin-document-form";
import { AdminPlanForm } from "@/components/portal/admin-plan-form";
import { AdminSeedMembersButton } from "@/components/portal/admin-seed-members-button";
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
  const memberLinkByEmail = new Map(
    dashboard.members.map((member) => [member.email.toLowerCase(), member.id]),
  );

  return (
    <div className="space-y-6">
      <RuntimeBanner
        viewer={viewer}
        databaseConfigured={runtime.databaseConfigured}
        stripeConfigured={runtime.stripeConfigured}
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="surface-panel p-6">
          <p className="eyebrow">Members</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
            {dashboard.members.length}
          </h2>
        </article>
        <article className="surface-panel p-6">
          <p className="eyebrow">Intakes</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
            {dashboard.applications.length}
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

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="surface-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Member roster</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
                Click into a member and manage everything from one place.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Intake answers, plan assignments, files, billing state, and direct
                messages all live under the member record now.
              </p>
            </div>
            <AdminSeedMembersButton />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            {dashboard.members.length ? (
              dashboard.members.map((member) => {
                const assignmentCount = dashboard.assignments.filter(
                  (assignment) => assignment.memberId === member.id,
                ).length;
                const documentCount = dashboard.documents.filter((document) =>
                  document.assignedMemberIds?.includes(member.id),
                ).length;
                const billing = dashboard.billingAccounts.find(
                  (account) => account.memberId === member.id,
                );

                return (
                  <Link
                    key={member.id}
                    href={`/admin/members/${member.id}`}
                    className="rounded-[1.3rem] border border-[var(--line)] bg-white/72 px-5 py-5 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
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
                    <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                      <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--canvas)] px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                          Joined
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                          {formatPortalDate(member.joinedAt)}
                        </p>
                      </div>
                      <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--canvas)] px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                          Plans
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                          {assignmentCount}
                        </p>
                      </div>
                      <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--canvas)] px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                          Files
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                          {documentCount}
                        </p>
                      </div>
                      <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--canvas)] px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                          Billing
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                          {billing?.status || "None"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">
                Members appear here after they have live accounts. Use the test-member
                button if you want realistic records to click through immediately.
              </p>
            )}
          </div>
        </article>

        <article className="dark-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-white/55">Latest intake queue</p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Open any submission directly, even if the person is not a portal member yet.
              </p>
            </div>
            <Link href="/admin/intakes" className="quiet-link inline-flex text-white">
              View all intakes
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3">
            {dashboard.applications.length ? (
              dashboard.applications.slice(0, 8).map((application) => {
                const matchingMemberId = memberLinkByEmail.get(
                  application.email.toLowerCase(),
                );

                return (
                  <div
                    key={application.id}
                    className="rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white/78"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{application.fullName}</p>
                        <p className="text-white/60">{application.email}</p>
                      </div>
                      <span className="rounded-full border border-white/12 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                        {application.status}
                      </span>
                    </div>
                    <p className="mt-3 text-white/55">
                      Submitted {formatPortalDate(application.submittedAt)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <Link
                        href={`/admin/intakes/${application.id}`}
                        className="quiet-link inline-flex text-white"
                      >
                        Open intake
                      </Link>
                      {matchingMemberId ? (
                        <Link
                          href={`/admin/members/${matchingMemberId}`}
                          className="quiet-link inline-flex text-white"
                        >
                          Open member
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm leading-7 text-white/65">
                Submitted intakes will appear here as they come in.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminPlanForm allowSubmit />
        <AdminDocumentForm allowSubmit />
      </section>
    </div>
  );
}

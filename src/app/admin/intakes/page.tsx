import Link from "next/link";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getAdminDashboardData } from "@/lib/portal/data";
import { formatPortalDateTime } from "@/lib/portal/format";

export default async function AdminIntakesPage() {
  const viewer = await requirePortalViewer({
    role: "coach_admin",
    returnTo: "/admin/intakes",
  });
  const dashboard = await getAdminDashboardData(viewer);
  const memberLinkByEmail = new Map(
    dashboard.members.map((member) => [member.email.toLowerCase(), member.id]),
  );

  return (
    <div className="space-y-6">
      <section className="surface-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">All intakes</p>
            <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
              Every submitted application in one queue.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Open any intake to see the full questionnaire, progress-photo uploads,
              and whether it already matches a portal member record.
            </p>
          </div>
          <Link href="/admin" className="quiet-link inline-flex text-[var(--ink)]">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4">
        {dashboard.applications.length ? (
          dashboard.applications.map((application) => {
            const matchingMemberId = memberLinkByEmail.get(
              application.email.toLowerCase(),
            );

            return (
              <article
                key={application.id}
                className="surface-panel rounded-[1.4rem] p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold text-[var(--ink)]">
                      {application.fullName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{application.email}</p>
                    {application.instagramHandle ? (
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        @{application.instagramHandle.replace(/^@/, "")}
                      </p>
                    ) : null}
                  </div>
                  <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    {application.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
                  <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--canvas)] px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      Submitted
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                      {formatPortalDateTime(application.submittedAt)}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--canvas)] px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      Age
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                      {application.payload.age || "Not provided"}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--canvas)] px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      Weight
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                      {application.payload.weight || "Not provided"}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--canvas)] px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      Start date
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                      {application.payload.preferredStartDate || "Not provided"}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--canvas)] px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      Photos
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                      {application.attachments.length}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4">
                  <Link
                    href={`/admin/intakes/${application.id}`}
                    className="btn-ghost"
                  >
                    Open intake
                  </Link>
                  {matchingMemberId ? (
                    <Link
                      href={`/admin/members/${matchingMemberId}`}
                      className="quiet-link inline-flex items-center text-[var(--ink)]"
                    >
                      Open member
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <section className="surface-panel p-6 sm:p-8">
            <p className="text-sm leading-7 text-[var(--muted)]">
              No intake submissions have come in yet.
            </p>
          </section>
        )}
      </section>
    </div>
  );
}

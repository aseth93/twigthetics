import { requirePortalViewer } from "@/lib/portal/auth";
import { getMemberDashboardData } from "@/lib/portal/data";
import { formatPortalDate } from "@/lib/portal/format";

export default async function MemberPlansPage() {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member/plans",
  });
  const dashboard = await getMemberDashboardData(viewer);

  return (
    <div className="grid grid-cols-1 gap-6">
      {dashboard.assignments.length ? (
        dashboard.assignments.map((assignment) => (
          <article key={assignment.id} className="surface-panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Assigned plan</p>
                <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
                  {assignment.plan.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Starts {formatPortalDate(assignment.startsOn)}
                </p>
              </div>
              <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                {assignment.status}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
              {assignment.plan.summary}
            </p>

            <div className="mt-5 rounded-[1.25rem] border border-[var(--line)] bg-white/65 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Cadence
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
                {assignment.plan.cadence}
              </p>
            </div>

            <div className="mt-5 rounded-[1.25rem] border border-[var(--line)] bg-white/65 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Full notes
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--ink)]">
                {assignment.plan.body}
              </p>
            </div>

            {assignment.notes ? (
              <div className="mt-5 rounded-[1.25rem] border border-[rgba(141,107,61,0.18)] bg-[rgba(141,107,61,0.07)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                  Coach note
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink)]">{assignment.notes}</p>
              </div>
            ) : null}
          </article>
        ))
      ) : (
        <article className="surface-panel p-6 text-sm leading-7 text-[var(--muted)]">
          No plans are assigned yet. This section fills once coaching starts and your first
          block is published.
        </article>
      )}
    </div>
  );
}

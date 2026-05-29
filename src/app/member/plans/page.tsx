import { PlanAssignmentWorkspace } from "@/components/portal/plan-assignment-workspace";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getMemberDashboardData } from "@/lib/portal/data";

export default async function MemberPlansPage() {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member/plans",
  });
  const dashboard = await getMemberDashboardData(viewer);

  return (
    <article className="surface-panel p-6 sm:p-8">
      <p className="eyebrow">Assigned plans</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Your current programming</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        Training, nutrition, supplements, cardio, and misc all stay separated here so
        the plan is easy to follow.
      </p>

      <div className="mt-6">
        <PlanAssignmentWorkspace
          assignments={dashboard.assignments}
          emptyLabel="No plans are assigned yet. This section fills once coaching starts and your first block is published."
        />
      </div>
    </article>
  );
}

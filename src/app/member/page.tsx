import Link from "next/link";
import { MemberCheckinWorkspace } from "@/components/portal/member-checkin-workspace";
import { RuntimeBanner } from "@/components/portal/runtime-banner";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getMemberDashboardData } from "@/lib/portal/data";
import { getPortalRuntime } from "@/lib/portal/env";
import { getPlanSectionPreview } from "@/lib/portal/plan-sections";

export default async function MemberDashboardPage() {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member",
  });
  const runtime = getPortalRuntime();
  const dashboard = await getMemberDashboardData(viewer);
  const activePlan = dashboard.assignments[0]?.plan || null;
  const activePlanPreview = activePlan
    ? getPlanSectionPreview(activePlan.sections)
    : "";
  const todayIsoDate = new Date().toISOString().slice(0, 10);
  const todayScheduledWorkout =
    dashboard.scheduledWorkouts.find((entry) => entry.scheduledDate === todayIsoDate) || null;

  return (
    <div className="space-y-6">
      <RuntimeBanner
        viewer={viewer}
        databaseConfigured={runtime.databaseConfigured}
        stripeConfigured={runtime.stripeConfigured}
      />

      {dashboard.unseenPlanUpdates.length ? (
        <section className="rounded-[1.7rem] border border-[rgba(141,107,61,0.38)] bg-[linear-gradient(135deg,rgba(141,107,61,0.16),rgba(255,255,255,0.88))] px-5 py-5 shadow-[0_18px_55px_rgba(37,24,10,0.12)] sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="eyebrow">Unread plan update</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
                Review the latest changes before today&apos;s check-in.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                Your plan was adjusted based on recent progress. The newest changes
                stay here until you mark them seen.
              </p>
            </div>
            <Link href="/member/plans" className="btn-primary shrink-0">
              Open updated plan
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3">
            {dashboard.unseenPlanUpdates.slice(0, 2).map((update) => (
              <article
                key={update.id}
                className="rounded-[1.25rem] border border-[var(--line)] bg-white/78 px-4 py-4"
              >
                <h3 className="text-base font-semibold text-[var(--ink)]">
                  {update.title}
                </h3>
                {update.summary ? (
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {update.summary}
                  </p>
                ) : null}
                {update.items.length ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--ink)]">
                    {update.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-[1rem] bg-[rgba(141,107,61,0.09)] px-3 py-2"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <MemberCheckinWorkspace
        initialCheckins={dashboard.dailyCheckins}
        scheduledWorkouts={dashboard.scheduledWorkouts}
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="surface-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Current block</p>
              <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
                {activePlan?.title || "No live block yet"}
              </h2>
            </div>
            <Link href="/member/plans" className="quiet-link">
              View all plan details
            </Link>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            {activePlanPreview ||
              "Your training and nutrition structure will appear here after assignment."}
          </p>

          {todayScheduledWorkout ? (
            <div className="mt-5 rounded-[1.15rem] border border-[rgba(141,107,61,0.18)] bg-[rgba(141,107,61,0.08)] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                Today&apos;s workout
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                {todayScheduledWorkout.title}
              </p>
              {todayScheduledWorkout.summary ? (
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {todayScheduledWorkout.summary}
                </p>
              ) : null}
            </div>
          ) : null}
        </article>

        <article className="dark-panel p-6">
          <p className="eyebrow text-white/55">Plan + support</p>
          <div className="mt-5 grid grid-cols-1 gap-3">
            <Link href="/member/plans" className="btn-ghost">
              Open plans + files
            </Link>
            <Link href="/member/messages" className="btn-ghost">
              Open inbox
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

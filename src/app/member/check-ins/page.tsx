import { MemberCheckinWorkspace } from "@/components/portal/member-checkin-workspace";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getMemberDashboardData } from "@/lib/portal/data";

export default async function MemberCheckinsPage() {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member/check-ins",
  });
  const dashboard = await getMemberDashboardData(viewer);

  return (
    <div className="space-y-6">
      <article className="surface-panel p-6">
        <p className="eyebrow">Progress tracking</p>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
          Daily weigh-ins, hydration, sleep, and workout notes
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Log bodyweight, water, and sleep every day, keep workout notes inside the
          portal after each session, and let the weekly averages update automatically.
        </p>
      </article>

      <MemberCheckinWorkspace initialCheckins={dashboard.dailyCheckins} />
    </div>
  );
}

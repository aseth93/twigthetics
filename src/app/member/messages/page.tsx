import { MessageThread } from "@/components/portal/message-thread";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getMemberDashboardData } from "@/lib/portal/data";

export default async function MemberMessagesPage() {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member/messages",
  });
  const dashboard = await getMemberDashboardData(viewer);

  return (
    <div className="space-y-6">
      <article className="surface-panel p-6">
        <p className="eyebrow">Inbox</p>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
          Coach messaging on-site
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Keep check-ins, plan clarifications, and travel/weekend adjustments in one thread
          instead of splitting the conversation across DMs and email.
        </p>
      </article>

      <MessageThread
        allowSubmit={viewer.mode !== "demo"}
        initialMessages={dashboard.messages}
        emptyLabel="No messages yet. Once coaching starts, your direct thread appears here."
      />
    </div>
  );
}

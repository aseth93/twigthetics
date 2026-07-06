import { MemberOnboardingModal } from "@/components/portal/member-onboarding-modal";
import { MemberPlanUpdatesModal } from "@/components/portal/member-plan-updates-modal";
import { PortalShell } from "@/components/portal/portal-shell";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getUnseenMemberPlanUpdates } from "@/lib/portal/data";

export const dynamic = "force-dynamic";

const memberNavItems = [
  { href: "/member", label: "Overview" },
  { href: "/member/plans", label: "Plans" },
  { href: "/member/check-ins", label: "Check-ins" },
  { href: "/member/messages", label: "Messages" },
  { href: "/member/billing", label: "Billing" },
];

export default async function MemberLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member",
  });
  const isOnboardingSeen = Boolean(viewer.profile.memberOnboardingSeenAt);
  const unseenPlanUpdates = await getUnseenMemberPlanUpdates({
    memberId: viewer.profile.id,
  });

  return (
    <PortalShell
      viewer={viewer}
      title="Member portal"
      subtitle="Plans, section files, check-ins, billing, and direct coaching messages all live inside the same Twigthetics site."
      navItems={memberNavItems}
      contentFirstOnMobile
    >
      <MemberOnboardingModal
        fullName={viewer.profile.fullName}
        isSeen={isOnboardingSeen}
      />
      <MemberPlanUpdatesModal
        updates={unseenPlanUpdates}
        isOnboardingSeen={isOnboardingSeen}
      />
      {children}
    </PortalShell>
  );
}

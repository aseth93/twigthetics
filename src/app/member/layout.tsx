import { MemberOnboardingModal } from "@/components/portal/member-onboarding-modal";
import { MemberPlanUpdatesModal } from "@/components/portal/member-plan-updates-modal";
import { PortalShell } from "@/components/portal/portal-shell";
import {
  getGuidePurchaseForMember,
  hasCoachingPortalAccess,
} from "@/lib/guide/access";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getUnseenMemberPlanUpdates } from "@/lib/portal/data";

export const dynamic = "force-dynamic";

const coachingNavItems = [
  { href: "/member", label: "Overview" },
  { href: "/member/plans", label: "Plans" },
  { href: "/member/check-ins", label: "Check-ins" },
  { href: "/member/messages", label: "Messages" },
  { href: "/member/billing", label: "Billing" },
  { href: "/member/guide", label: "Guide" },
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
  const [guidePurchase, hasCoachingAccess, unseenPlanUpdates] = await Promise.all([
    getGuidePurchaseForMember(viewer.profile.id),
    hasCoachingPortalAccess(viewer.profile.id),
    getUnseenMemberPlanUpdates({ memberId: viewer.profile.id }),
  ]);
  const isGuideOnly = Boolean(guidePurchase && !hasCoachingAccess);
  const isOnboardingSeen = Boolean(viewer.profile.memberOnboardingSeenAt);
  const memberNavItems = isGuideOnly
    ? [{ href: "/member/guide", label: "My Guide" }]
    : coachingNavItems;

  return (
    <PortalShell
      viewer={viewer}
      title={isGuideOnly ? "Guide library" : "Member portal"}
      subtitle={
        isGuideOnly
          ? "Your private, personalized Twigthetics guide access lives here."
          : "Plans, section files, check-ins, billing, direct coaching messages, and guide access all live inside the same Twigthetics site."
      }
      navItems={memberNavItems}
      contentFirstOnMobile
    >
      {!isGuideOnly ? (
        <>
          <MemberOnboardingModal
            fullName={viewer.profile.fullName}
            isSeen={isOnboardingSeen}
          />
          <MemberPlanUpdatesModal
            updates={unseenPlanUpdates}
            isOnboardingSeen={isOnboardingSeen}
          />
        </>
      ) : null}
      {children}
    </PortalShell>
  );
}

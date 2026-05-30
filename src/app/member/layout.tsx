import { PortalShell } from "@/components/portal/portal-shell";
import { requirePortalViewer } from "@/lib/portal/auth";

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

  return (
    <PortalShell
      viewer={viewer}
      title="Member portal"
      subtitle="Plans, section files, check-ins, billing, and direct coaching messages all live inside the same Twigthetics site."
      navItems={memberNavItems}
    >
      {children}
    </PortalShell>
  );
}

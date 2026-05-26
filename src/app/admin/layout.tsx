import { PortalShell } from "@/components/portal/portal-shell";
import { requirePortalViewer } from "@/lib/portal/auth";

const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/member", label: "Member view" },
  { href: "/member/messages", label: "Inbox preview" },
  { href: "/member/billing", label: "Billing preview" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await requirePortalViewer({
    role: "coach_admin",
    returnTo: "/admin",
  });

  return (
    <PortalShell
      viewer={viewer}
      title="Coach admin"
      subtitle="Manage clients, upload documents, publish plans, and keep communication inside the Twigthetics portal."
      navItems={adminNavItems}
    >
      {children}
    </PortalShell>
  );
}

import { redirect } from "next/navigation";
import { requirePortalViewer } from "@/lib/portal/auth";

export default async function MemberDocumentsPage() {
  await requirePortalViewer({
    role: "member",
    returnTo: "/member/documents",
  });

  redirect("/member/plans");
}

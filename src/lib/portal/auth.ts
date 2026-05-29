import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import type { ApplicationRole, PortalViewer } from "@/types/portal";
import { ensureBootstrapAdmin, findUserById, mapUserToPortalProfile } from "./users";

export async function getPortalViewer(): Promise<PortalViewer | null> {
  await ensureBootstrapAdmin();
  const session = await getAuthSession();
  const sessionUser = session?.user as { id?: string } | undefined;

  if (!sessionUser?.id) {
    return null;
  }

  const user = await findUserById(sessionUser.id);

  if (!user) {
    return null;
  }

  return {
    mode: "live",
    profile: mapUserToPortalProfile(user),
  };
}

export async function requirePortalViewer(options: {
  role?: ApplicationRole;
  returnTo: string;
}) {
  const viewer = await getPortalViewer();

  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(options.returnTo)}`);
  }

  if (options.role && viewer.profile.role !== options.role) {
    redirect(viewer.profile.role === "coach_admin" ? "/admin" : "/member");
  }

  return viewer;
}

export function isAdminRole(role: ApplicationRole) {
  return role === "coach_admin";
}

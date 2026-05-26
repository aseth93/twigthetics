import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoCoachProfile, demoMemberProfile } from "@/lib/portal/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApplicationRole, PortalProfile, PortalViewer } from "@/types/portal";
import { getPortalRuntime } from "./env";

const demoRoleCookieName = "twigthetics_demo_role";

function mapLiveProfile(
  profileRow: Record<string, unknown>,
  fallbackEmail: string,
): PortalProfile {
  return {
    id: String(profileRow.user_id),
    role: profileRow.role === "coach_admin" ? "coach_admin" : "member",
    fullName: String(profileRow.full_name || "Twigthetics Member"),
    email: String(profileRow.email || fallbackEmail),
    instagramHandle:
      typeof profileRow.instagram_handle === "string"
        ? profileRow.instagram_handle
        : null,
    avatarUrl: typeof profileRow.avatar_url === "string" ? profileRow.avatar_url : null,
    joinedAt: typeof profileRow.joined_at === "string" ? profileRow.joined_at : null,
  };
}

export function getDemoCookieName() {
  return demoRoleCookieName;
}

export async function getPortalViewer(): Promise<PortalViewer | null> {
  const runtime = getPortalRuntime();

  if (runtime.supabaseConfigured) {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return null;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("user_id, role, full_name, email, instagram_handle, avatar_url, joined_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const profile = profileRow
      ? mapLiveProfile(profileRow, user.email || "")
      : {
          id: user.id,
          role: "member" as const,
          fullName:
            user.user_metadata.full_name ||
            user.user_metadata.name ||
            user.email?.split("@")[0] ||
            "Twigthetics Member",
          email: user.email || "",
          instagramHandle: null,
          avatarUrl: null,
          joinedAt: user.created_at,
        };

    return {
      mode: "live",
      profile,
    };
  }

  if (runtime.previewMode) {
    return null;
  }

  if (!runtime.demoMode) {
    return null;
  }

  const cookieStore = await cookies();
  const role = cookieStore.get(demoRoleCookieName)?.value;

  if (role === "coach_admin") {
    return {
      mode: "demo",
      profile: demoCoachProfile,
    };
  }

  if (role === "member") {
    return {
      mode: "demo",
      profile: demoMemberProfile,
    };
  }

  return null;
}

export async function requirePortalViewer(options: {
  role?: ApplicationRole;
  returnTo: string;
}) {
  const runtime = getPortalRuntime();

  if (!runtime.supabaseConfigured && runtime.previewMode && options.role) {
    return {
      mode: "demo" as const,
      profile: options.role === "coach_admin" ? demoCoachProfile : demoMemberProfile,
    };
  }

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

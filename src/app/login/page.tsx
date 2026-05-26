import { redirect } from "next/navigation";
import { LoginPanel } from "@/components/portal/login-panel";
import { getPortalViewer } from "@/lib/portal/auth";
import { getPortalRuntime } from "@/lib/portal/env";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const runtime = getPortalRuntime();
  const viewer = await getPortalViewer();
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/member";

  if (viewer) {
    redirect(viewer.profile.role === "coach_admin" ? "/admin" : nextPath);
  }

  return (
    <main className="section-shell min-h-screen pt-28">
      <LoginPanel
        demoMode={runtime.demoMode}
        supabaseConfigured={runtime.supabaseConfigured}
        nextPath={nextPath}
      />
    </main>
  );
}

import { LoginPanel } from "@/components/portal/login-panel";
import { getPortalRuntime } from "@/lib/portal/env";

export default async function LoginPage() {
  const runtime = getPortalRuntime();

  return (
    <main className="section-shell min-h-screen pt-28">
      <LoginPanel
        demoMode={runtime.demoMode}
        previewMode={runtime.previewMode}
        supabaseConfigured={runtime.supabaseConfigured}
      />
    </main>
  );
}

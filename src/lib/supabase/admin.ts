import { createClient } from "@supabase/supabase-js";
import { getPortalRuntime } from "@/lib/portal/env";

export function createSupabaseAdminClient() {
  const runtime = getPortalRuntime();

  if (!runtime.serviceRoleConfigured) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

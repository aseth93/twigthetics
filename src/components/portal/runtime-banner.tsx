import type { PortalViewer } from "@/types/portal";

type RuntimeBannerProps = {
  viewer?: PortalViewer | null;
  supabaseConfigured: boolean;
  stripeConfigured: boolean;
  demoMode: boolean;
};

export function RuntimeBanner({
  viewer,
  supabaseConfigured,
  stripeConfigured,
  demoMode,
}: RuntimeBannerProps) {
  if (viewer?.mode === "demo" || demoMode) {
    return (
      <div className="rounded-[1.3rem] border border-[rgba(141,107,61,0.22)] bg-[rgba(141,107,61,0.08)] px-4 py-3 text-sm leading-6 text-[var(--ink)]">
        Demo portal mode is active. The UI is real, but messages, documents, and billing
        are preview behavior until backend keys are connected.
      </div>
    );
  }

  if (!supabaseConfigured || !stripeConfigured) {
    return (
      <div className="rounded-[1.3rem] border border-[rgba(23,20,17,0.12)] bg-white/65 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
        Portal is partially connected. Auth/data uses live infrastructure only after the
        Supabase and Stripe environment variables are set on Render.
      </div>
    );
  }

  return (
    <div className="rounded-[1.3rem] border border-[rgba(39,49,39,0.18)] bg-[rgba(39,49,39,0.08)] px-4 py-3 text-sm leading-6 text-[var(--forest)]">
      Live portal mode is active. Member data, billing, and inbox actions are connected.
    </div>
  );
}

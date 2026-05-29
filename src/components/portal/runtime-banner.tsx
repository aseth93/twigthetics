import type { PortalViewer } from "@/types/portal";

type RuntimeBannerProps = {
  viewer?: PortalViewer | null;
  databaseConfigured: boolean;
  emailConfigured: boolean;
  stripeConfigured: boolean;
};

export function RuntimeBanner({
  viewer,
  databaseConfigured,
  emailConfigured,
  stripeConfigured,
}: RuntimeBannerProps) {
  const isCoachView = viewer?.profile.role === "coach_admin";

  if (!databaseConfigured || !stripeConfigured) {
    return (
      <div className="rounded-[1.3rem] border border-[rgba(141,107,61,0.22)] bg-[rgba(141,107,61,0.08)] px-4 py-3 text-sm leading-6 text-[var(--ink)]">
        Portal setup is incomplete. Database-backed portal features or Stripe billing are
        still missing environment variables.
      </div>
    );
  }

  if (!emailConfigured) {
    return (
      <div className="rounded-[1.3rem] border border-[rgba(23,20,17,0.12)] bg-white/65 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
        Portal access and billing are live. Password reset email still needs a Resend
        configuration.
      </div>
    );
  }

  return (
    <div className="rounded-[1.3rem] border border-[rgba(39,49,39,0.18)] bg-[rgba(39,49,39,0.08)] px-4 py-3 text-sm leading-6 text-[var(--forest)]">
      Live portal mode is active.{" "}
      {isCoachView
        ? "Client management, billing data, documents, and inbox actions are connected."
        : "Billing, documents, plans, and inbox actions are connected."}
    </div>
  );
}

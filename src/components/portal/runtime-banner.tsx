import type { PortalViewer } from "@/types/portal";

type RuntimeBannerProps = {
  viewer?: PortalViewer | null;
  databaseConfigured: boolean;
  stripeConfigured: boolean;
};

export function RuntimeBanner({
  databaseConfigured,
  stripeConfigured,
}: RuntimeBannerProps) {
  if (!databaseConfigured || !stripeConfigured) {
    return (
      <div className="rounded-[1.3rem] border border-[rgba(141,107,61,0.22)] bg-[rgba(141,107,61,0.08)] px-4 py-3 text-sm leading-6 text-[var(--ink)]">
        Portal setup is incomplete. Database-backed portal features or Stripe billing are
        still missing environment variables.
      </div>
    );
  }

  return null;
}

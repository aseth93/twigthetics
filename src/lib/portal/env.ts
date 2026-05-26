import type { PortalRuntime } from "@/types/portal";

function getTrimmedEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function getPortalRuntime(): PortalRuntime {
  const supabaseUrl = getTrimmedEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getTrimmedEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const stripeSecretKey = getTrimmedEnv("STRIPE_SECRET_KEY");
  const stripeWebhookSecret = getTrimmedEnv("STRIPE_WEBHOOK_SECRET");
  const stripePriceId = getTrimmedEnv("STRIPE_COACHING_PRICE_ID");
  const serviceRoleKey = getTrimmedEnv("SUPABASE_SERVICE_ROLE_KEY");
  const portalPreviewMode = getTrimmedEnv("PORTAL_PREVIEW_MODE") === "1";
  const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
  const stripeConfigured = Boolean(stripeSecretKey && stripeWebhookSecret);

  return {
    supabaseConfigured,
    stripeConfigured,
    stripePriceConfigured: Boolean(stripePriceId),
    serviceRoleConfigured: Boolean(supabaseUrl && serviceRoleKey),
    demoMode:
      !supabaseConfigured &&
      (process.env.NODE_ENV !== "production" || portalPreviewMode),
  };
}

export function getSiteOrigin(headersLike?: Headers) {
  const forwardedHost = headersLike?.get("x-forwarded-host");
  const host = forwardedHost || headersLike?.get("host");
  const forwardedProto = headersLike?.get("x-forwarded-proto");
  const proto = forwardedProto || (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    return "http://127.0.0.1:3000";
  }

  return `${proto}://${host}`;
}

export function getStripePriceId() {
  return getTrimmedEnv("STRIPE_COACHING_PRICE_ID");
}

export function getInstagramUrl() {
  return getTrimmedEnv("NEXT_PUBLIC_INSTAGRAM_URL");
}

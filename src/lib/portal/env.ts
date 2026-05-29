import type { PortalRuntime } from "@/types/portal";

function getTrimmedEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function getPortalRuntime(): PortalRuntime {
  const databaseUrl = getTrimmedEnv("DATABASE_URL");
  const authSecret = getTrimmedEnv("NEXTAUTH_SECRET");
  const stripeSecretKey = getTrimmedEnv("STRIPE_SECRET_KEY");
  const stripeWebhookSecret = getTrimmedEnv("STRIPE_WEBHOOK_SECRET");
  const stripePriceId = getTrimmedEnv("STRIPE_COACHING_PRICE_ID");
  const resendApiKey = getTrimmedEnv("RESEND_API_KEY");
  const resendFromEmail = getTrimmedEnv("RESEND_FROM_EMAIL");
  const bootstrapAdminEmail = getTrimmedEnv("BOOTSTRAP_ADMIN_EMAIL");
  const bootstrapAdminPassword = getTrimmedEnv("BOOTSTRAP_ADMIN_PASSWORD");
  const databaseConfigured = Boolean(databaseUrl);
  const stripeConfigured = Boolean(stripeSecretKey && stripeWebhookSecret);

  return {
    databaseConfigured,
    authConfigured: Boolean(databaseUrl && authSecret),
    stripeConfigured,
    stripePriceConfigured: Boolean(stripePriceId),
    emailConfigured: Boolean(resendApiKey && resendFromEmail),
    bootstrapAdminConfigured: Boolean(
      databaseUrl && authSecret && bootstrapAdminEmail && bootstrapAdminPassword,
    ),
  };
}

export function getSiteOrigin(headersLike?: Headers) {
  const configuredSiteUrl = getTrimmedEnv("NEXT_PUBLIC_SITE_URL");
  const forwardedHost = headersLike?.get("x-forwarded-host");
  const host = forwardedHost || headersLike?.get("host");
  const forwardedProto = headersLike?.get("x-forwarded-proto");
  const proto = forwardedProto || (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    return configuredSiteUrl || "http://127.0.0.1:3000";
  }

  return `${proto}://${host}`;
}

export function getStripePriceId() {
  return getTrimmedEnv("STRIPE_COACHING_PRICE_ID");
}

export function getInstagramUrl() {
  return getTrimmedEnv("NEXT_PUBLIC_INSTAGRAM_URL");
}

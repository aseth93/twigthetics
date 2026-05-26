import Stripe from "stripe";
import { getPortalRuntime } from "@/lib/portal/env";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const runtime = getPortalRuntime();

  if (!runtime.stripeConfigured || !process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

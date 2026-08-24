import { Resend } from "resend";
import { getPortalRuntime } from "./env";

let resendClient: Resend | null = null;

export function getResendClient() {
  const runtime = getPortalRuntime();
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!runtime.emailConfigured || !apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export async function sendPasswordResetEmail(options: {
  email: string;
  fullName: string;
  resetUrl: string;
}) {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!resend || !from) {
    throw new Error("Email delivery is not configured.");
  }

  await resend.emails.send({
    from,
    to: options.email,
    subject: "Reset your Twigthetics portal password",
    text: `Hi ${options.fullName},

Use this link to reset your Twigthetics portal password:

${options.resetUrl}

This link expires in 1 hour.

If you did not request a reset, you can ignore this email.`,
  });
}

export async function sendGuideCheckoutRecoveryEmail(options: {
  email: string;
  firstName?: string | null;
  recoveryUrl: string;
}) {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!resend || !from) {
    throw new Error("Email delivery is not configured.");
  }

  const greeting = options.firstName ? `Hi ${options.firstName},` : "Hi,";

  await resend.emails.send({
    from,
    to: options.email,
    subject: "Your Twigthetics guide checkout is still available",
    text: `${greeting}

You started checkout for The Lean, Athletic Physique Guide but did not finish.

Complete your secure checkout here:
${options.recoveryUrl}

The guide is $49.99 once and includes permanent account access. If you read it and are dissatisfied, reply or DM @twigthetics for a refund.

If you no longer want the guide, you can ignore this email. This is the only checkout reminder we will send.`,
  });
}

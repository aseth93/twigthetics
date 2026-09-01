import { SignupPanel } from "@/components/portal/signup-panel";
import { fulfillGuideCheckoutBySessionId } from "@/lib/guide/access";
import { getStripeSignupContext } from "@/lib/portal/billing";

type SignupPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSingleParam(input: string | string[] | undefined) {
  return typeof input === "string" ? input : input?.[0] || "";
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = (await searchParams) || {};
  const sessionId = readSingleParam(params.session_id);
  if (sessionId) {
    await fulfillGuideCheckoutBySessionId(sessionId);
  }
  const context = sessionId
    ? await getStripeSignupContext(sessionId)
    : {
        valid: false,
        email: null,
        customerName: null,
        existingUserExists: false,
        alreadyClaimed: false,
        purchaseType: null,
        amountTotal: null,
        message: "Complete checkout first, then return here from Stripe.",
      };

  return (
    <main className="section-shell min-h-screen pt-28">
      <SignupPanel sessionId={sessionId} {...context} />
    </main>
  );
}

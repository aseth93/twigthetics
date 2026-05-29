import { SignupPanel } from "@/components/portal/signup-panel";
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
  const context = sessionId
    ? await getStripeSignupContext(sessionId)
    : {
        valid: false,
        email: null,
        customerName: null,
        existingUserExists: false,
        alreadyClaimed: false,
        message: "Complete coaching checkout first, then return here from Stripe.",
      };

  return (
    <main className="section-shell min-h-screen pt-28">
      <SignupPanel sessionId={sessionId} {...context} />
    </main>
  );
}

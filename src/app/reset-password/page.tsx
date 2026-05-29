import Link from "next/link";
import { ResetPasswordPanel } from "@/components/portal/reset-password-panel";

type ResetPasswordPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSingleParam(input: string | string[] | undefined) {
  return typeof input === "string" ? input : input?.[0] || "";
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = (await searchParams) || {};
  const token = readSingleParam(params.token);

  return (
    <main className="section-shell min-h-screen pt-28">
      {token ? (
        <ResetPasswordPanel token={token} />
      ) : (
        <div className="surface-panel p-8 md:p-10">
          <p className="eyebrow">Reset Password</p>
          <h1 className="display-title mt-4 text-[var(--ink)]">Missing reset link.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            Request a new reset email to continue.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
            <Link href="/forgot-password" className="quiet-link">
              Request a new link
            </Link>
            <Link href="/login" className="quiet-link">
              Back to login
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

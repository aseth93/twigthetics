import { LoginPanel } from "@/components/portal/login-panel";
import { getPortalRuntime } from "@/lib/portal/env";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSingleParam(input: string | string[] | undefined) {
  return typeof input === "string" ? input : input?.[0];
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const runtime = getPortalRuntime();
  const params = (await searchParams) || {};
  const nextPath = readSingleParam(params.next) || "/member";
  const created = readSingleParam(params.created) === "1";
  const reset = readSingleParam(params.reset) === "1";
  const notice = created
    ? "Account created. Sign in with the password you just set."
    : reset
      ? "Password updated. Sign in with your new password."
      : null;

  return (
    <main className="section-shell min-h-screen pt-28">
      <LoginPanel
        authConfigured={runtime.authConfigured}
        nextPath={nextPath}
        notice={notice}
      />
    </main>
  );
}

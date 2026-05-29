"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginPanelProps = {
  authConfigured: boolean;
  nextPath: string;
  notice?: string | null;
};

export function LoginPanel({ authConfigured, nextPath, notice }: LoginPanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState("");

  async function handleLiveLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authConfigured) {
      return;
    }

    try {
      setIsPending(true);
      setStatus("");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: nextPath,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.replace(result?.url || nextPath);
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to sign in with that account.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="surface-panel p-8 md:p-10">
      <p className="eyebrow">Member Login</p>
      <h2 className="display-title mt-4 text-[var(--ink)]">Portal access for active clients.</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
        Sign in for plans, billing, documents, and direct coaching messages inside the
        same Twigthetics site.
      </p>

      {notice ? (
        <div className="mt-6 rounded-[1.1rem] border border-[rgba(39,49,39,0.18)] bg-[rgba(39,49,39,0.08)] px-4 py-3 text-sm leading-6 text-[var(--forest)]">
          {notice}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleLiveLogin}
          className="grid grid-cols-1 gap-4 rounded-[1.6rem] border border-[var(--line)] bg-white/72 p-5"
        >
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--ink)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="password" className="block text-sm font-medium text-[var(--ink)]">
                Password
              </label>
              <Link href="/forgot-password" className="quiet-link text-xs">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={!authConfigured || isPending}
            className={authConfigured ? "btn-primary" : "btn-disabled"}
          >
            {isPending ? "Signing in..." : authConfigured ? "Sign in" : "Portal not connected"}
          </button>

          <p className="text-xs leading-6 text-[var(--muted)]">
            Bought coaching already? Use the portal account setup step after checkout, then
            sign in here going forward.
          </p>
        </form>

        <div className="dark-panel grid grid-cols-1 gap-4 p-5">
          <div>
            <p className="eyebrow text-white/60">New Clients</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              Checkout first, then create your account
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/72">
              Coaching checkout sends you into the portal signup flow so your payment,
              billing record, and account all line up under the same email.
            </p>
          </div>

          <Link href="/#coaching" className="btn-ghost">
            Back to coaching
          </Link>
          <Link href="/signup" className="btn-ghost">
            Open signup
          </Link>

          <p className="text-xs leading-6 text-white/60">
            The signup page only activates when it can verify a completed Stripe checkout
            session.
          </p>
        </div>
      </div>

      {status ? (
        <div className="mt-5 rounded-[1.1rem] border border-[rgba(138,60,45,0.18)] bg-[rgba(138,60,45,0.08)] px-4 py-3 text-sm leading-6 text-[#8a3c2d]">
          {status}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
        <Link href="/" className="quiet-link">
          Back to the front page
        </Link>
        <Link href="/#apply" className="quiet-link">
          Apply for coaching
        </Link>
      </div>
    </div>
  );
}

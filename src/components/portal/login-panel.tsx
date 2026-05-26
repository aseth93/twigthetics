"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginPanelProps = {
  demoMode: boolean;
  previewMode: boolean;
  supabaseConfigured: boolean;
};

export function LoginPanel({
  demoMode,
  previewMode,
  supabaseConfigured,
}: LoginPanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState("");
  const nextPath = "/member";

  async function handleDemoLogin(role: "member" | "coach_admin") {
    try {
      setIsPending(true);
      setStatus("");

      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; redirectTo?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to open demo portal.");
      }

      router.push(payload?.redirectTo || nextPath);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to open demo portal.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleLiveLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabaseConfigured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setStatus("Supabase browser client is not configured.");
      return;
    }

    try {
      setIsPending(true);
      setStatus("");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push(nextPath);
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
      <h2 className="display-title mt-4 text-[var(--ink)]">One site. Public front. Private portal.</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
        Clients land on the main Twigthetics site, then sign in here for billing, plans,
        documents, and direct messaging.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleLiveLogin} className="grid grid-cols-1 gap-4 rounded-[1.6rem] border border-[var(--line)] bg-white/72 p-5">
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
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[var(--ink)]"
            >
              Password
            </label>
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
            disabled={!supabaseConfigured || isPending}
            className={supabaseConfigured ? "btn-primary" : "btn-disabled"}
          >
            {isPending ? "Signing in..." : supabaseConfigured ? "Sign in" : "Live auth not connected"}
          </button>

          <p className="text-xs leading-6 text-[var(--muted)]">
            Use live account login once Supabase auth is connected on Render. Until then,
            demo access below previews the portal flow.
          </p>
        </form>

        <div className="dark-panel grid grid-cols-1 gap-4 p-5">
          <div>
            <p className="eyebrow text-white/60">Preview Access</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Demo portal roles</h3>
            <p className="mt-3 text-sm leading-6 text-white/72">
              Member view shows billing, plans, docs, and inbox. Admin view shows your
              client roster and management tools.
            </p>
          </div>

          {previewMode ? (
            <>
              <Link href="/member" className="btn-ghost">
                Open member demo
              </Link>
              <Link href="/admin" className="btn-ghost">
                Open admin demo
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleDemoLogin("member")}
                className={demoMode ? "btn-ghost" : "btn-disabled"}
                disabled={!demoMode || isPending}
              >
                Open member demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("coach_admin")}
                className={demoMode ? "btn-ghost" : "btn-disabled"}
                disabled={!demoMode || isPending}
              >
                Open admin demo
              </button>
            </>
          )}

          <p className="text-xs leading-6 text-white/60">
            Demo access is available only in local or preview mode before the live backend is
            configured.
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

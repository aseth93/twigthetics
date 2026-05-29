"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SignupPanelProps = {
  sessionId: string;
  email: string | null;
  customerName: string | null;
  valid: boolean;
  existingUserExists: boolean;
  alreadyClaimed: boolean;
  message: string | null;
};

export function SignupPanel({
  sessionId,
  email,
  customerName,
  valid,
  existingUserExists,
  alreadyClaimed,
  message,
}: SignupPanelProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(customerName || "");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = valid && !existingUserExists && !alreadyClaimed;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("");

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          fullName,
          instagramHandle,
          password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; email?: string; redirectTo?: string }
        | null;

      if (!response.ok || !payload?.email) {
        throw new Error(payload?.error || "Unable to create your portal account.");
      }

      const signInResult = await signIn("credentials", {
        email: payload.email,
        password,
        redirect: false,
        callbackUrl: payload.redirectTo || "/member",
      });

      if (signInResult?.error) {
        router.replace("/login?created=1");
        return;
      }

      router.replace(signInResult?.url || payload.redirectTo || "/member");
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to create your portal account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="surface-panel p-8 md:p-10">
      <p className="eyebrow">Portal Signup</p>
      <h1 className="display-title mt-4 text-[var(--ink)]">Finish your account setup.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
        This step ties your coaching purchase to your private Twigthetics portal so billing,
        plans, documents, and messaging all live under one login.
      </p>

      {message ? (
        <div
          className={`mt-6 rounded-[1.1rem] border px-4 py-3 text-sm leading-6 ${
            valid
              ? "border-[rgba(39,49,39,0.18)] bg-[rgba(39,49,39,0.08)] text-[var(--forest)]"
              : "border-[rgba(138,60,45,0.18)] bg-[rgba(138,60,45,0.08)] text-[#8a3c2d]"
          }`}
        >
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-4">
        <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/72 px-4 py-4 text-sm leading-6 text-[var(--muted)]">
          Checkout email: <span className="text-[var(--ink)]">{email || "Unavailable"}</span>
        </div>

        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Full name"
          disabled={!canSubmit}
          className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
        <input
          value={instagramHandle}
          onChange={(event) => setInstagramHandle(event.target.value)}
          placeholder="Instagram handle (optional)"
          disabled={!canSubmit}
          className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a password"
          disabled={!canSubmit}
          className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm password"
          disabled={!canSubmit}
          className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={canSubmit ? "btn-primary" : "btn-disabled"}
        >
          {isSubmitting ? "Creating account..." : "Create portal account"}
        </button>
      </form>

      {existingUserExists || alreadyClaimed ? (
        <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
          This checkout is already tied to an account.{" "}
          <Link href="/login" className="quiet-link">
            Sign in here
          </Link>
          .
        </p>
      ) : null}

      {status ? (
        <div className="mt-5 rounded-[1.1rem] border border-[rgba(138,60,45,0.18)] bg-[rgba(138,60,45,0.08)] px-4 py-3 text-sm leading-6 text-[#8a3c2d]">
          {status}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
        <Link href="/" className="quiet-link">
          Back to the front page
        </Link>
        <Link href="/login" className="quiet-link">
          Already have an account?
        </Link>
      </div>
    </div>
  );
}

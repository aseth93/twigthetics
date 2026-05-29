"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ResetPasswordPanelProps = {
  token: string;
};

export function ResetPasswordPanel({ token }: ResetPasswordPanelProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("");

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to reset your password.");
      }

      router.replace("/login?reset=1");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="surface-panel p-8 md:p-10">
      <p className="eyebrow">Reset Password</p>
      <h1 className="display-title mt-4 text-[var(--ink)]">Choose a new password.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
        Reset your Twigthetics portal password and get back into your member account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid max-w-xl grid-cols-1 gap-4">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New password"
          className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm new password"
          className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset password"}
        </button>
      </form>

      {status ? (
        <div className="mt-5 rounded-[1.1rem] border border-[rgba(138,60,45,0.18)] bg-[rgba(138,60,45,0.08)] px-4 py-3 text-sm leading-6 text-[#8a3c2d]">
          {status}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
        <Link href="/login" className="quiet-link">
          Back to login
        </Link>
        <Link href="/" className="quiet-link">
          Back to the front page
        </Link>
      </div>
    </div>
  );
}

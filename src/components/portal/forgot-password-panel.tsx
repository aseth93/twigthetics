"use client";

import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordPanel() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setStatus("");

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to send a reset link.");
      }

      setStatus(payload?.message || "If that email exists, a reset link has been sent.");
      setEmail("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send a reset link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="surface-panel p-8 md:p-10">
      <p className="eyebrow">Password Reset</p>
      <h1 className="display-title mt-4 text-[var(--ink)]">Get a reset link.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
        Enter the email tied to your portal account and we&apos;ll send you a secure reset
        link.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid max-w-xl grid-cols-1 gap-4">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      {status ? (
        <div className="mt-5 rounded-[1.1rem] border border-[rgba(39,49,39,0.18)] bg-[rgba(39,49,39,0.08)] px-4 py-3 text-sm leading-6 text-[var(--forest)]">
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

"use client";

import { useState } from "react";

export function GuideUnsubscribeForm({ token }: { token: string }) {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function unsubscribe() {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/guide/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("This unsubscribe link could not be verified.");
      }

      setStatus("You are unsubscribed. No more guide follow-up emails will be sent.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to unsubscribe.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        className="btn-primary"
        onClick={unsubscribe}
        disabled={isSubmitting || Boolean(status)}
      >
        {isSubmitting ? "Unsubscribing..." : "Unsubscribe"}
      </button>
      {status ? (
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]" aria-live="polite">
          {status}
        </p>
      ) : null}
    </div>
  );
}

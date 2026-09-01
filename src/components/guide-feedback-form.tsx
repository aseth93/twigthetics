"use client";

import { useState } from "react";

export function GuideFeedbackForm({ displayName }: { displayName: string }) {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);
      setStatus("");
      const response = await fetch("/api/member/guide/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.get("displayName"),
          quote: form.get("quote"),
          rating: form.get("rating"),
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(result?.error || "Unable to send feedback.");
      }

      event.currentTarget.reset();
      setStatus("Thank you. Your feedback was sent to Abe for review.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send feedback.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface-panel p-6 sm:p-8">
      <p className="eyebrow">Guide feedback</p>
      <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
        Has the guide made the process clearer?
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        Share what changed for you. Feedback is reviewed before anything is shown publicly.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_9rem]">
        <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
          Display name
          <input
            name="displayName"
            defaultValue={displayName}
            required
            className="min-h-12 rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 font-normal"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
          Rating
          <select
            name="rating"
            defaultValue="5"
            className="min-h-12 rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 font-normal"
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} / 5
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 grid gap-2 text-sm font-semibold text-[var(--ink)]">
        Your feedback
        <textarea
          name="quote"
          required
          minLength={20}
          rows={4}
          placeholder="What did the guide help you understand or execute?"
          className="rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 font-normal"
        />
      </label>
      <button type="submit" className="btn-primary mt-5" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send feedback"}
      </button>
      {status ? (
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]" aria-live="polite">
          {status}
        </p>
      ) : null}
    </form>
  );
}

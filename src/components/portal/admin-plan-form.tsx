"use client";

import { useState } from "react";

export function AdminPlanForm() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [cadence, setCadence] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setStatus("");

      const response = await fetch("/api/admin/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          summary,
          cadence,
          body,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save the plan.");
      }

      setTitle("");
      setSummary("");
      setCadence("");
      setBody("");
      setStatus(payload?.message || "Plan saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save the plan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface-panel grid gap-4 p-6">
      <div>
        <p className="eyebrow">Admin</p>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">Create a coaching plan</h3>
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Plan title"
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <input
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
        placeholder="Short summary"
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <input
        value={cadence}
        onChange={(event) => setCadence(event.target.value)}
        placeholder="Cadence, schedule, and main guardrails"
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={6}
        placeholder="Plan notes, training split, nutrition guardrails..."
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save plan"}
        </button>
        {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
      </div>
    </form>
  );
}

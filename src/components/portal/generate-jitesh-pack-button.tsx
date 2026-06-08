"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type GenerateJiteshPackButtonProps = {
  memberId: string;
};

export function GenerateJiteshPackButton({
  memberId,
}: GenerateJiteshPackButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGenerate() {
    try {
      setIsSubmitting(true);
      setStatus("");

      const response = await fetch(`/api/admin/members/${memberId}/coaching-pack`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; message?: string; result?: { scheduledWorkoutCount?: number } }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to generate the coaching pack.");
      }

      setStatus(
        payload?.result?.scheduledWorkoutCount
          ? `Pack generated. ${payload.result.scheduledWorkoutCount} scheduled workouts reseeded.`
          : payload?.message || "Pack generated.",
      );

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to generate the coaching pack.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[1.2rem] border border-[rgba(141,107,61,0.18)] bg-[rgba(141,107,61,0.08)] px-5 py-5">
      <p className="eyebrow">Jitesh pack</p>
      <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">
        Generate the full 6-week onboarding block
      </h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
        This creates the structured plan, four branded PDFs, and the full 42-day
        workout calendar starting June 15, 2026. Rerunning it updates the same block
        instead of duplicating files.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isSubmitting || isPending}
          className={isSubmitting || isPending ? "btn-disabled" : "btn-primary"}
        >
          {isSubmitting || isPending ? "Generating..." : "Generate Jitesh coaching pack"}
        </button>
        {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
      </div>
    </div>
  );
}

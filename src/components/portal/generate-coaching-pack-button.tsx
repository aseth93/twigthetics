"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type GenerateCoachingPackButtonProps = {
  applicationId?: string | null;
  memberId?: string | null;
  subjectName?: string;
  redirectToMemberOnSuccess?: boolean;
};

type CoachingPackResponse = {
  error?: string;
  message?: string;
  result?: {
    memberId: string;
    memberCreated: boolean;
    memberName: string;
    memberEmail: string;
    planTitle: string;
    createdDocuments: number;
    updatedDocuments: number;
    scheduledWorkoutCount: number;
  };
};

export function GenerateCoachingPackButton({
  applicationId,
  memberId,
  subjectName,
  redirectToMemberOnSuccess = false,
}: GenerateCoachingPackButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [memberLink, setMemberLink] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const endpoint = useMemo(() => {
    if (applicationId) {
      return `/api/admin/applications/${applicationId}/coaching-pack`;
    }

    if (memberId) {
      return `/api/admin/members/${memberId}/coaching-pack`;
    }

    return "";
  }, [applicationId, memberId]);

  async function handleGenerate() {
    if (!endpoint) {
      setStatus("No intake or member target is connected to this action.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("");
      setMemberLink(null);

      const response = await fetch(endpoint, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as CoachingPackResponse | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to generate the coaching pack.");
      }

      const result = payload?.result;

      if (!result) {
        throw new Error("The coaching pack completed without a usable result.");
      }

      const nextMemberLink = `/admin/members/${result.memberId}?tab=programming`;
      setMemberLink(nextMemberLink);
      setStatus(
        `${result.memberCreated ? "Member created" : "Member reused"}. ${result.planTitle}. ${result.createdDocuments + result.updatedDocuments} document(s) synced. ${result.scheduledWorkoutCount} scheduled workouts seeded.`,
      );

      startTransition(() => {
        if (redirectToMemberOnSuccess) {
          router.push(nextMemberLink);
          return;
        }

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
      <p className="eyebrow">Pack generation</p>
      <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">
        Generate the full 6-week coaching pack
      </h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
        Build the structured plan, four branded PDFs, and the full 42-day workout
        calendar for {subjectName || "this client"}. Rerunning it updates the same
        block instead of duplicating files.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isSubmitting || isPending || !endpoint}
          className={isSubmitting || isPending || !endpoint ? "btn-disabled" : "btn-primary"}
        >
          {isSubmitting || isPending
            ? "Generating..."
            : "Generate / refresh coaching pack"}
        </button>
        {memberLink && !redirectToMemberOnSuccess ? (
          <Link href={memberLink} className="btn-ghost">
            Open member programming
          </Link>
        ) : null}
      </div>

      {status ? <p className="mt-4 text-sm text-[var(--muted)]">{status}</p> : null}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MemberPlanUpdate } from "@/types/portal";

type MemberPlanUpdatesModalProps = {
  updates: MemberPlanUpdate[];
  isOnboardingSeen: boolean;
};

function formatUpdateDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function MemberPlanUpdatesModal({
  updates,
  isOnboardingSeen,
}: MemberPlanUpdatesModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(isOnboardingSeen && updates.length > 0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsOpen(isOnboardingSeen && updates.length > 0);
  }, [isOnboardingSeen, updates.length]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  async function acknowledge(options?: { redirectTo?: string }) {
    try {
      setIsSaving(true);
      setError("");

      const response = await fetch("/api/member/plan-updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updateIds: updates.map((update) => update.id),
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to mark plan updates as seen.");
      }

      setIsOpen(false);
      router.refresh();

      if (options?.redirectTo) {
        router.push(options.redirectTo);
      }
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to mark plan updates as seen.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <section
      aria-labelledby="member-plan-updates-title"
      aria-modal="true"
      role="dialog"
      className="modal-shell"
    >
      <div className="modal-card relative z-10 w-full max-w-3xl">
        <div className="rounded-[1.6rem] border border-[rgba(141,107,61,0.28)] bg-[rgba(246,239,230,0.97)] px-5 py-5 shadow-[var(--shadow)] sm:px-6 sm:py-6">
          <p className="eyebrow">Plan updates</p>
          <h2
            id="member-plan-updates-title"
            className="mt-3 text-2xl font-semibold text-[var(--ink)] sm:text-3xl"
          >
            Review what changed.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
            Your plan was updated. Read the summary below before training or logging
            today so you are following the latest instructions.
          </p>

          <div className="mt-6 space-y-4">
            {updates.map((update) => (
              <article
                key={update.id}
                className="rounded-[1.35rem] border border-[var(--line)] bg-white/78 px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                      {formatUpdateDate(update.createdAt)}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[var(--ink)]">
                      {update.title}
                    </h3>
                  </div>
                </div>

                {update.summary ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {update.summary}
                  </p>
                ) : null}

                {update.items.length ? (
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--ink)]">
                    {update.items.map((item) => (
                      <li key={item} className="rounded-[1rem] bg-[rgba(141,107,61,0.08)] px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => acknowledge({ redirectTo: "/member/plans" })}
              className="btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Open updated plan"}
            </button>

            <button
              type="button"
              onClick={() => acknowledge()}
              className="btn-secondary"
              disabled={isSaving}
            >
              Mark seen
            </button>

            {error ? <p className="text-sm text-[var(--muted)]">{error}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

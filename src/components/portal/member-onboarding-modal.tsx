"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MemberOnboardingModalProps = {
  fullName: string;
  isSeen: boolean;
};

const onboardingItems = [
  {
    title: "Plans",
    body: "Training, nutrition, supplements, cardio, and misc files all live inside Plans.",
  },
  {
    title: "Check-ins",
    body: "Log bodyweight, hydration, and sleep daily. Add workout notes after each training session.",
  },
  {
    title: "Messages",
    body: "Use Messages for questions, feedback, travel updates, and anything that needs a direct reply.",
  },
  {
    title: "Billing",
    body: "Use Billing for invoices, payment method updates, and subscription status.",
  },
];

export function MemberOnboardingModal({
  fullName,
  isSeen,
}: MemberOnboardingModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(!isSeen);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSeen) {
      setIsOpen(false);
    }
  }, [isSeen]);

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

      const response = await fetch("/api/member/onboarding", {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save the portal overview state.");
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
          : "Unable to save the portal overview state.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <section aria-labelledby="member-overview-title" aria-modal="true" role="dialog" className="modal-shell">
      <div className="modal-card relative z-10 w-full max-w-4xl">
        <div className="rounded-[1.6rem] border border-[var(--line)] bg-[rgba(246,239,230,0.96)] px-5 py-5 shadow-[var(--shadow)] sm:px-6 sm:py-6">
          <p className="eyebrow">Portal overview</p>
          <h2
            id="member-overview-title"
            className="mt-3 text-2xl font-semibold text-[var(--ink)] sm:text-3xl"
          >
            Start here, {fullName.split(" ")[0]}.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
            This portal is where your plan, day-to-day tracking, communication, and billing all stay organized.
            The main habit is simple: log your weigh-in, hydration, and sleep daily, then add workout notes after
            each session so adjustments are based on real data.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {onboardingItems.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.4rem] border border-[var(--line)] bg-white/74 px-4 py-4"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ink)]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[1.35rem] border border-[rgba(141,107,61,0.22)] bg-[rgba(141,107,61,0.08)] px-4 py-4 text-sm leading-6 text-[var(--ink)]">
            Weekly average bodyweight is calculated automatically from the weigh-ins you log. If the daily entries are
            sloppy, the weekly read is sloppy too.
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => acknowledge({ redirectTo: "/member/check-ins" })}
              className="btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Open check-ins"}
            </button>

            <button
              type="button"
              onClick={() => acknowledge()}
              className="btn-secondary"
              disabled={isSaving}
            >
              Continue to portal
            </button>

            {error ? <p className="text-sm text-[var(--muted)]">{error}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

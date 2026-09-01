"use client";

import { useState } from "react";
import {
  getGuideAttribution,
  getGuideVisitorId,
  GUIDE_LEAD_STORAGE_KEY,
} from "@/lib/guide/browser";

export function GuidePreviewForm() {
  const [status, setStatus] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);
      setStatus("");
      const response = await fetch("/api/guide/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          email: form.get("email"),
          marketingConsent: form.get("marketingConsent") === "on",
          website: form.get("website"),
          visitorId: getGuideVisitorId(),
          attribution: getGuideAttribution(),
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string; leadId?: string; downloadUrl?: string }
        | null;

      if (!response.ok || !result?.downloadUrl) {
        throw new Error(result?.error || "Unable to send the preview.");
      }

      if (result.leadId) {
        window.localStorage.setItem(GUIDE_LEAD_STORAGE_KEY, result.leadId);
      }

      setDownloadUrl(result.downloadUrl);
      setStatus("The preview is in your inbox and ready below.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send the preview.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (downloadUrl) {
    return (
      <div className="rounded-[1.3rem] border border-[rgba(77,151,82,0.35)] bg-[rgba(56,126,63,0.08)] p-5">
        <p className="font-semibold text-[var(--forest)]">{status}</p>
        <a
          href={downloadUrl}
          download
          className="btn-primary btn-guide-glow mt-4 inline-flex w-full sm:w-auto"
        >
          Open the free 5-page preview
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
          First name
          <input
            name="firstName"
            autoComplete="given-name"
            required
            className="min-h-13 rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="min-h-13 rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 text-base font-normal outline-none focus:border-[var(--accent)]"
          />
        </label>
      </div>
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px]"
        aria-hidden="true"
      />
      <label className="flex items-start gap-3 rounded-[1rem] border border-[var(--line)] bg-white/55 p-3 text-xs leading-5 text-[var(--muted)]">
        <input name="marketingConsent" type="checkbox" className="mt-1 size-4 shrink-0" />
        Email me three practical follow-ups about using the guide and the current offer. Unsubscribe anytime.
      </label>
      <button
        type="submit"
        className="btn-secondary min-h-13 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending preview..." : "Email me the free preview"}
      </button>
      {status ? (
        <p className="text-sm leading-6 text-[var(--muted)]" aria-live="polite">
          {status}
        </p>
      ) : null}
    </form>
  );
}

"use client";

import { useState } from "react";

export function AdminSeedMembersButton() {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    try {
      setIsSubmitting(true);
      setStatus("");

      const response = await fetch("/api/admin/test-members", {
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to create test members.");
      }

      setStatus(payload?.message || "Test members created.");
      window.setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to create test members.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="btn-secondary"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating test members..." : "Create test members"}
      </button>
      {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
    </div>
  );
}

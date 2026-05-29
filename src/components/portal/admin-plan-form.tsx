"use client";

import { useEffect, useState } from "react";
import {
  PLAN_SECTION_KEYS,
  PLAN_SECTION_LABELS,
  type PlanSectionKey,
} from "@/lib/portal/plan-sections";

type AdminPlanFormProps = {
  allowSubmit?: boolean;
  initialMemberId?: string;
  memberName?: string;
  heading?: string;
};

export function AdminPlanForm({
  allowSubmit = true,
  initialMemberId = "",
  memberName,
  heading = "Create a coaching plan",
}: AdminPlanFormProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [cadence, setCadence] = useState("");
  const [training, setTraining] = useState("");
  const [nutrition, setNutrition] = useState("");
  const [supplements, setSupplements] = useState("");
  const [cardio, setCardio] = useState("");
  const [misc, setMisc] = useState("");
  const [memberId, setMemberId] = useState(initialMemberId);
  const [startsOn, setStartsOn] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<PlanSectionKey>("training");

  useEffect(() => {
    setMemberId(initialMemberId);
  }, [initialMemberId]);

  const sectionValues: Record<PlanSectionKey, string> = {
    training,
    nutrition,
    supplements,
    cardio,
    misc,
  };

  const sectionSetters: Record<PlanSectionKey, (value: string) => void> = {
    training: setTraining,
    nutrition: setNutrition,
    supplements: setSupplements,
    cardio: setCardio,
    misc: setMisc,
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setStatus("");

      if (!allowSubmit) {
        setStatus("Preview mode only. Live plan saving starts after backend setup.");
        return;
      }

      const response = await fetch("/api/admin/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          summary,
          cadence,
          sections: sectionValues,
          memberId,
          startsOn,
          notes,
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
      setTraining("");
      setNutrition("");
      setSupplements("");
      setCardio("");
      setMisc("");
      setMemberId(initialMemberId || "");
      setStartsOn("");
      setNotes("");
      setStatus(payload?.message || "Plan saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save the plan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasLockedMember = Boolean(initialMemberId);

  return (
    <form onSubmit={handleSubmit} className="surface-panel grid grid-cols-1 gap-4 p-6">
      <div>
        <p className="eyebrow">Admin</p>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">{heading}</h3>
        {memberName ? (
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Assign directly to {memberName}.
          </p>
        ) : null}
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Plan title"
        disabled={!allowSubmit}
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <input
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
        placeholder="Short summary"
        disabled={!allowSubmit}
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <input
        value={cadence}
        onChange={(event) => setCadence(event.target.value)}
        placeholder="Cadence, schedule, and main guardrails"
        disabled={!allowSubmit}
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {PLAN_SECTION_KEYS.map((sectionKey) => (
            <button
              key={sectionKey}
              type="button"
              onClick={() => setActiveSection(sectionKey)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                activeSection === sectionKey
                  ? "border-[var(--accent)] bg-[rgba(141,107,61,0.12)] text-[var(--ink)]"
                  : "border-[var(--line)] bg-white/80 text-[var(--muted)] hover:bg-white"
              }`}
            >
              {PLAN_SECTION_LABELS[sectionKey]}
            </button>
          ))}
        </div>
        <textarea
          value={sectionValues[activeSection]}
          onChange={(event) => sectionSetters[activeSection](event.target.value)}
          rows={8}
          placeholder={`Write the ${PLAN_SECTION_LABELS[activeSection].toLowerCase()} details...`}
          disabled={!allowSubmit}
          className="mt-4 w-full rounded-[1rem] border border-[var(--line)] bg-white/90 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
      </div>
      {hasLockedMember ? (
        <div className="rounded-[1rem] border border-[var(--line)] bg-white/55 px-4 py-3 text-sm text-[var(--muted)]">
          Assigned member ID: {memberId}
        </div>
      ) : (
        <input
          value={memberId}
          onChange={(event) => setMemberId(event.target.value)}
          placeholder="Assign to member ID (optional)"
          disabled={!allowSubmit}
          className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
      )}
      <input
        type="date"
        value={startsOn}
        onChange={(event) => setStartsOn(event.target.value)}
        disabled={!allowSubmit}
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={3}
        placeholder="Assignment note for this member (optional)"
        disabled={!allowSubmit}
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className={allowSubmit ? "btn-primary" : "btn-disabled"}
          disabled={!allowSubmit || isSubmitting}
        >
          {allowSubmit ? (isSubmitting ? "Saving..." : "Save plan") : "Preview only"}
        </button>
        {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
      </div>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  getPopulatedPlanSectionKeys,
  PLAN_SECTION_KEYS,
  PLAN_SECTION_LABELS,
  type PlanSectionKey,
} from "@/lib/portal/plan-sections";
import { formatPortalDate } from "@/lib/portal/format";
import type { PlanAssignment } from "@/types/portal";

type PlanAssignmentWorkspaceProps = {
  assignments: PlanAssignment[];
  emptyLabel: string;
};

function getInitialSectionKey(assignment?: PlanAssignment | null) {
  if (!assignment) {
    return "training" as PlanSectionKey;
  }

  return getPopulatedPlanSectionKeys(assignment.plan.sections)[0] || "training";
}

export function PlanAssignmentWorkspace({
  assignments,
  emptyLabel,
}: PlanAssignmentWorkspaceProps) {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || "");
  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => assignment.id === selectedAssignmentId) || assignments[0],
    [assignments, selectedAssignmentId],
  );
  const [selectedSection, setSelectedSection] = useState<PlanSectionKey>(
    getInitialSectionKey(assignments[0]),
  );

  const sectionKeys = selectedAssignment
    ? getPopulatedPlanSectionKeys(selectedAssignment.plan.sections)
    : [];
  const visibleSectionKeys = sectionKeys.length ? sectionKeys : PLAN_SECTION_KEYS;

  if (!assignments.length || !selectedAssignment) {
    return (
      <div className="rounded-[1.3rem] border border-dashed border-[var(--line)] bg-white/40 px-5 py-6 text-sm leading-7 text-[var(--muted)]">
        {emptyLabel}
      </div>
    );
  }

  const activeSectionKey = visibleSectionKeys.includes(selectedSection)
    ? selectedSection
    : visibleSectionKeys[0];
  const activeContent = selectedAssignment.plan.sections[activeSectionKey]?.trim();

  return (
    <div className="space-y-4">
      {assignments.length > 1 ? (
        <div className="flex flex-wrap gap-3">
          {assignments.map((assignment) => (
            <button
              key={assignment.id}
              type="button"
              onClick={() => {
                setSelectedAssignmentId(assignment.id);
                setSelectedSection(getInitialSectionKey(assignment));
              }}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                selectedAssignment.id === assignment.id
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--line)] bg-white/70 text-[var(--muted)] hover:bg-white"
              }`}
            >
              {assignment.plan.title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="rounded-[1.35rem] border border-[var(--line)] bg-white/78 px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Current plan</p>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
              {selectedAssignment.plan.title}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {selectedAssignment.plan.summary}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-right sm:grid-cols-2 sm:text-left">
            <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--canvas)] px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                Status
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                {selectedAssignment.status}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--canvas)] px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                Starts
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                {formatPortalDate(selectedAssignment.startsOn)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[1.15rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Cadence
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--ink)]">
            {selectedAssignment.plan.cadence || "No cadence saved yet."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {visibleSectionKeys.map((sectionKey) => (
            <button
              key={sectionKey}
              type="button"
              onClick={() => setSelectedSection(sectionKey)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                activeSectionKey === sectionKey
                  ? "border-[var(--accent)] bg-[rgba(141,107,61,0.12)] text-[var(--ink)]"
                  : "border-[var(--line)] bg-white/70 text-[var(--muted)] hover:bg-white"
              }`}
            >
              {PLAN_SECTION_LABELS[sectionKey]}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-[1.2rem] border border-[rgba(141,107,61,0.16)] bg-[rgba(141,107,61,0.07)] px-5 py-5">
          <p className="eyebrow">{PLAN_SECTION_LABELS[activeSectionKey]}</p>
          <div className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--ink)]">
            {activeContent || "No details saved in this section yet."}
          </div>
        </div>

        {selectedAssignment.notes ? (
          <div className="mt-5 rounded-[1.15rem] border border-[var(--line)] bg-white px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
              Coach note
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--ink)]">
              {selectedAssignment.notes}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeWeeklyWeightAverages,
  getCurrentWeekAverageWeight,
  getTodayIsoDate,
} from "@/lib/portal/checkin-stats";
import {
  formatHydrationOunces,
  formatPortalDate,
  formatSleepHours,
  formatWeightPounds,
} from "@/lib/portal/format";
import type { DailyCheckinEntry } from "@/types/portal";

type MemberCheckinWorkspaceProps = {
  initialCheckins: DailyCheckinEntry[];
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toUtcDateFromIsoDate(value: string) {
  return new Date(`${value}T12:00:00.000Z`);
}

function toIsoDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getMonthStartIsoDate(value: string) {
  const date = toUtcDateFromIsoDate(value);
  date.setUTCDate(1);
  return toIsoDateString(date);
}

function shiftMonth(monthStartIsoDate: string, offset: number) {
  const date = toUtcDateFromIsoDate(monthStartIsoDate);
  const shifted = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1, 12, 0, 0),
  );
  return toIsoDateString(shifted);
}

function formatMonthLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(toUtcDateFromIsoDate(value));
}

function buildCalendarDays(monthStartIsoDate: string, selectedDate: string, entries: Map<string, DailyCheckinEntry>) {
  const monthStart = toUtcDateFromIsoDate(monthStartIsoDate);
  const monthIndex = monthStart.getUTCMonth();
  const weekday = monthStart.getUTCDay();
  const gridStart = addUtcDays(monthStart, weekday === 0 ? -6 : 1 - weekday);
  const todayIsoDate = getTodayIsoDate();

  return Array.from({ length: 42 }, (_, index) => {
    const date = addUtcDays(gridStart, index);
    const isoDate = toIsoDateString(date);

    return {
      isoDate,
      dayNumber: date.getUTCDate(),
      isCurrentMonth: date.getUTCMonth() === monthIndex,
      isToday: isoDate === todayIsoDate,
      isSelected: isoDate === selectedDate,
      entry: entries.get(isoDate) || null,
    };
  });
}

export function MemberCheckinWorkspace({
  initialCheckins,
}: MemberCheckinWorkspaceProps) {
  const [checkins, setCheckins] = useState(initialCheckins);
  const [checkinDate, setCheckinDate] = useState(getTodayIsoDate());
  const [visibleMonthStart, setVisibleMonthStart] = useState(
    getMonthStartIsoDate(getTodayIsoDate()),
  );
  const [weightPounds, setWeightPounds] = useState("");
  const [hydrationOunces, setHydrationOunces] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCheckins(initialCheckins);
  }, [initialCheckins]);

  useEffect(() => {
    setVisibleMonthStart(getMonthStartIsoDate(checkinDate));
  }, [checkinDate]);

  const selectedEntry = useMemo(
    () => checkins.find((entry) => entry.checkinDate === checkinDate) || null,
    [checkinDate, checkins],
  );

  const entriesByDate = useMemo(
    () => new Map(checkins.map((entry) => [entry.checkinDate, entry])),
    [checkins],
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonthStart, checkinDate, entriesByDate),
    [visibleMonthStart, checkinDate, entriesByDate],
  );

  useEffect(() => {
    if (selectedEntry) {
      setWeightPounds(
        typeof selectedEntry.weightPounds === "number"
          ? selectedEntry.weightPounds.toFixed(1)
          : "",
      );
      setHydrationOunces(
        typeof selectedEntry.hydrationOunces === "number"
          ? String(selectedEntry.hydrationOunces)
          : "",
      );
      setSleepHours(
        typeof selectedEntry.sleepHours === "number"
          ? selectedEntry.sleepHours.toFixed(1)
          : "",
      );
      setWorkoutNotes(selectedEntry.workoutNotes || "");
      return;
    }

    setWeightPounds("");
    setHydrationOunces("");
    setSleepHours("");
    setWorkoutNotes("");
  }, [selectedEntry]);

  const weeklyAverages = useMemo(
    () => computeWeeklyWeightAverages(checkins),
    [checkins],
  );
  const currentWeekAverageWeightPounds = useMemo(
    () => getCurrentWeekAverageWeight(weeklyAverages),
    [weeklyAverages],
  );
  const latestCheckin = checkins[0] || null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setStatus("");

      const response = await fetch("/api/member/check-ins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkinDate,
          weightPounds,
          hydrationOunces,
          sleepHours,
          workoutNotes,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save the daily check-in.");
      }

      const normalizedWeight = Number(weightPounds);
      const normalizedHydration = hydrationOunces.trim()
        ? Number(hydrationOunces)
        : null;
      const normalizedSleep = sleepHours.trim() ? Number(sleepHours) : null;
      const nextEntry: DailyCheckinEntry = selectedEntry
        ? {
            ...selectedEntry,
            weightPounds: normalizedWeight,
            hydrationOunces: normalizedHydration,
            sleepHours: normalizedSleep,
            workoutNotes: workoutNotes.trim() || null,
            updatedAt: new Date().toISOString(),
          }
        : {
            id: `local-${checkinDate}`,
            memberId: initialCheckins[0]?.memberId || "",
            checkinDate,
            weightPounds: normalizedWeight,
            hydrationOunces: normalizedHydration,
            sleepHours: normalizedSleep,
            workoutNotes: workoutNotes.trim() || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

      setCheckins((current) => {
        const withoutSelectedDate = current.filter(
          (entry) => entry.checkinDate !== checkinDate,
        );
        return [nextEntry, ...withoutSelectedDate].sort((left, right) =>
          right.checkinDate.localeCompare(left.checkinDate),
        );
      });
      setStatus(payload?.message || "Daily check-in saved.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to save the daily check-in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="surface-panel p-6">
          <p className="eyebrow">Current week average</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
            {formatWeightPounds(currentWeekAverageWeightPounds)}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Based on the weigh-ins logged this week.
          </p>
        </article>

        <article className="surface-panel p-6">
          <p className="eyebrow">Latest weigh-in</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
            {formatWeightPounds(latestCheckin?.weightPounds)}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {latestCheckin
              ? `Logged ${formatPortalDate(latestCheckin.checkinDate)}`
              : "No bodyweight logged yet."}
          </p>
        </article>

        <article className="surface-panel p-6">
          <p className="eyebrow">Latest hydration</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
            {formatHydrationOunces(latestCheckin?.hydrationOunces)}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Water logged for the most recent day on file.
          </p>
        </article>

        <article className="surface-panel p-6">
          <p className="eyebrow">Latest sleep</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
            {formatSleepHours(latestCheckin?.sleepHours)}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Sleep logged for the most recent day on file.
          </p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="surface-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Calendar view</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
                Expand any day and look back at your log.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Move month to month, then click a day to load that date’s weight, sleep,
                hydration, and workout notes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibleMonthStart((current) => shiftMonth(current, -1))}
                className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)] hover:bg-white"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setVisibleMonthStart((current) => shiftMonth(current, 1))}
                className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)] hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="type-display text-2xl uppercase text-[var(--ink)]">
              {formatMonthLabel(visibleMonthStart)}
            </p>
            <button
              type="button"
              onClick={() => {
                const todayIsoDate = getTodayIsoDate();
                setCheckinDate(todayIsoDate);
                setVisibleMonthStart(getMonthStartIsoDate(todayIsoDate));
              }}
              className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)] hover:bg-white"
            >
              Today
            </button>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2">
            {weekdayLabels.map((label) => (
              <p
                key={label}
                className="px-1 pb-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
              >
                {label}
              </p>
            ))}

            {calendarDays.map((day) => (
              <button
                key={day.isoDate}
                type="button"
                onClick={() => setCheckinDate(day.isoDate)}
                className={[
                  "min-h-[5.75rem] rounded-[1.1rem] border px-2 py-2 text-left",
                  day.isSelected
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                    : day.entry
                      ? "border-[rgba(141,107,61,0.22)] bg-[rgba(141,107,61,0.09)] text-[var(--ink)] hover:bg-[rgba(141,107,61,0.15)]"
                      : "border-[var(--line)] bg-white/62 text-[var(--ink)] hover:bg-white/82",
                  day.isCurrentMonth ? "" : "opacity-45",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{day.dayNumber}</span>
                  {day.isToday ? (
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]",
                        day.isSelected ? "bg-white/16 text-white" : "bg-[var(--ink)]/8 text-[var(--muted)]",
                      ].join(" ")}
                    >
                      Today
                    </span>
                  ) : null}
                </div>

                {day.entry ? (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium">
                      {formatWeightPounds(day.entry.weightPounds)}
                    </p>
                    <div
                      className={[
                        "flex flex-wrap gap-1 text-[10px] uppercase tracking-[0.12em]",
                        day.isSelected ? "text-white/78" : "text-[var(--muted)]",
                      ].join(" ")}
                    >
                      <span>{formatHydrationOunces(day.entry.hydrationOunces)}</span>
                      <span>{formatSleepHours(day.entry.sleepHours)}</span>
                    </div>
                  </div>
                ) : (
                  <p
                    className={[
                      "mt-3 text-[11px] leading-5",
                      day.isSelected ? "text-white/78" : "text-[var(--muted)]",
                    ].join(" ")}
                  >
                    No log
                  </p>
                )}
              </button>
            ))}
          </div>
        </article>

        <article className="surface-panel p-6">
          <p className="eyebrow">Selected day</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
            {formatPortalDate(checkinDate)}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Clicking a day opens the log for that date and also loads it into the editor
            below.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-[1.15rem] border border-[var(--line)] bg-white/72 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Weight
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                {formatWeightPounds(selectedEntry?.weightPounds)}
              </p>
            </div>
            <div className="rounded-[1.15rem] border border-[var(--line)] bg-white/72 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Hydration
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                {formatHydrationOunces(selectedEntry?.hydrationOunces)}
              </p>
            </div>
            <div className="rounded-[1.15rem] border border-[var(--line)] bg-white/72 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Sleep
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                {formatSleepHours(selectedEntry?.sleepHours)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.2rem] border border-[var(--line)] bg-white/72 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Workout notes
            </p>
            {selectedEntry?.workoutNotes ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--ink)]">
                {selectedEntry.workoutNotes}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                No workout notes logged for this day.
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const editor = document.getElementById("daily-checkin-editor");
                editor?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="btn-secondary"
            >
              Edit this day
            </button>
            <p className="text-sm text-[var(--muted)]">
              {selectedEntry
                ? `Last updated ${formatPortalDate(selectedEntry.updatedAt)}`
                : "No saved entry yet for this date."}
            </p>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          id="daily-checkin-editor"
          onSubmit={handleSubmit}
          className="surface-panel grid grid-cols-1 gap-4 p-6"
        >
          <div>
            <p className="eyebrow">Daily check-in</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
              Log bodyweight, hydration, sleep, and workout notes.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Log the weigh-in, water, and sleep daily. Add workout notes right after you
              train so the weekly average and session feedback stay usable.
            </p>
          </div>

          <input
            type="date"
            value={checkinDate}
            onChange={(event) => setCheckinDate(event.target.value)}
            max={getTodayIsoDate()}
            className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />

          <input
            type="number"
            step="0.1"
            min="1"
            value={weightPounds}
            onChange={(event) => setWeightPounds(event.target.value)}
            placeholder="Bodyweight (lb)"
            className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="number"
              step="1"
              min="0"
              value={hydrationOunces}
              onChange={(event) => setHydrationOunces(event.target.value)}
              placeholder="Hydration (oz)"
              className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            />

            <input
              type="number"
              step="0.1"
              min="0"
              max="24"
              value={sleepHours}
              onChange={(event) => setSleepHours(event.target.value)}
              placeholder="Sleep (hours)"
              className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <textarea
            value={workoutNotes}
            onChange={(event) => setWorkoutNotes(event.target.value)}
            rows={8}
            placeholder="Workout notes, performance notes, pumps, energy, digestion, recovery, or anything worth flagging for the day."
            className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : selectedEntry
                  ? "Update check-in"
                  : "Save check-in"}
            </button>
            {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
          </div>
        </form>

        <div className="space-y-6">
          <article className="surface-panel p-6">
            <p className="eyebrow">Weekly average weight</p>
            <div className="mt-5 grid grid-cols-1 gap-4">
              {weeklyAverages.length ? (
                weeklyAverages.slice(0, 8).map((average) => (
                  <div
                    key={average.weekStart}
                    className="rounded-[1.15rem] border border-[var(--line)] bg-white/70 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--ink)]">
                          {formatPortalDate(average.weekStart)} to{" "}
                          {formatPortalDate(average.weekEnd)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                          {average.entryCount} weigh-ins
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-[var(--ink)]">
                        {formatWeightPounds(average.averageWeightPounds)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.15rem] border border-dashed border-[var(--line)] bg-white/45 px-4 py-5 text-sm leading-6 text-[var(--muted)]">
                  Weekly averages will appear after weigh-ins are logged.
                </div>
              )}
            </div>
          </article>

          <article className="surface-panel p-6">
            <p className="eyebrow">Recent entries</p>
            <div className="mt-5 grid grid-cols-1 gap-4">
              {checkins.length ? (
                checkins.slice(0, 10).map((entry) => (
                  <button
                    key={`${entry.id}-${entry.checkinDate}`}
                    type="button"
                    onClick={() => setCheckinDate(entry.checkinDate)}
                    className="rounded-[1.15rem] border border-[var(--line)] bg-white/70 px-4 py-4 text-left hover:bg-white"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="font-medium text-[var(--ink)]">
                        {formatPortalDate(entry.checkinDate)}
                      </p>
                      <p className="text-sm font-medium text-[var(--ink)]">
                        {formatWeightPounds(entry.weightPounds)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                      <span>{formatHydrationOunces(entry.hydrationOunces)}</span>
                      <span>{formatSleepHours(entry.sleepHours)}</span>
                    </div>
                    {entry.workoutNotes ? (
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--muted)]">
                        {entry.workoutNotes}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                        No workout notes saved for this day.
                      </p>
                    )}
                  </button>
                ))
              ) : (
                <div className="rounded-[1.15rem] border border-dashed border-[var(--line)] bg-white/45 px-4 py-5 text-sm leading-6 text-[var(--muted)]">
                  No daily entries yet.
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

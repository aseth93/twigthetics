import type { DailyCheckinEntry, WeeklyWeightAverage } from "@/types/portal";

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

export function getWeekStartIsoDate(value: string) {
  const date = toUtcDateFromIsoDate(value);
  const day = date.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  return toIsoDateString(addUtcDays(date, offset));
}

export function getTodayIsoDate() {
  return toIsoDateString(new Date());
}

export function computeWeeklyWeightAverages(checkins: DailyCheckinEntry[]) {
  const weekBuckets = new Map<
    string,
    {
      sum: number;
      count: number;
    }
  >();

  checkins.forEach((checkin) => {
    if (typeof checkin.weightPounds !== "number") {
      return;
    }

    const weekStart = getWeekStartIsoDate(checkin.checkinDate);
    const bucket = weekBuckets.get(weekStart) || { sum: 0, count: 0 };
    bucket.sum += checkin.weightPounds;
    bucket.count += 1;
    weekBuckets.set(weekStart, bucket);
  });

  return [...weekBuckets.entries()]
    .map(([weekStart, bucket]) => {
      const averageWeightPounds =
        Math.round((bucket.sum / bucket.count) * 10) / 10;
      const weekEnd = toIsoDateString(addUtcDays(toUtcDateFromIsoDate(weekStart), 6));

      return {
        weekStart,
        weekEnd,
        averageWeightPounds,
        entryCount: bucket.count,
      } satisfies WeeklyWeightAverage;
    })
    .sort((left, right) => right.weekStart.localeCompare(left.weekStart));
}

export function getCurrentWeekAverageWeight(
  weeklyAverages: WeeklyWeightAverage[],
  todayIsoDate = getTodayIsoDate(),
) {
  const currentWeekStart = getWeekStartIsoDate(todayIsoDate);
  return (
    weeklyAverages.find((average) => average.weekStart === currentWeekStart)
      ?.averageWeightPounds || null
  );
}

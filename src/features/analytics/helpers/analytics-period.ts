import { TZDateMini } from "@date-fns/tz";
import { addDays, addHours, addMonths } from "date-fns";

import type {
  AnalyticsFilters,
  AnalyticsPeriod,
  AnalyticsTimePoint,
} from "@/features/analytics/types/analytics";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(value: Date, timezone: string) {
  const date = new TZDateMini(value.getTime(), timezone);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function localStart(value: string, timezone: string) {
  return new TZDateMini(`${value}T00:00:00`, timezone);
}

function validDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1]) &&
    date.getUTCMonth() === Number(match[2]) - 1 &&
    date.getUTCDate() === Number(match[3]);
}

function daysBetween(startDate: string, endDate: string) {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000) + 1;
}

function defaultWeek(timezone: string, reference: Date) {
  const today = localStart(dateKey(reference, timezone), timezone);
  const offset = (today.getDay() + 6) % 7;
  return { start: addDays(today, -offset), days: 7, period: "week" as const };
}

export function resolveAnalyticsPeriod(
  filters: AnalyticsFilters,
  timezone: string,
  reference = new Date(),
) {
  const today = localStart(dateKey(reference, timezone), timezone);
  let start = today;
  let days = 1;
  let period: AnalyticsPeriod = filters.period;

  if (period === "week") {
    const current = defaultWeek(timezone, reference);
    start = current.start;
    days = current.days;
  } else if (period === "last7") {
    start = addDays(today, -6);
    days = 7;
  } else if (period === "last30") {
    start = addDays(today, -29);
    days = 30;
  } else if (period === "last90") {
    start = addDays(today, -89);
    days = 90;
  } else if (period === "custom") {
    const validRange = validDateKey(filters.startDate) &&
      validDateKey(filters.endDate) &&
      filters.startDate <= filters.endDate;
    const rangeDays = validRange ? daysBetween(filters.startDate, filters.endDate) : 0;
    if (!validRange || rangeDays < 1 || rangeDays > 366) {
      const current = defaultWeek(timezone, reference);
      start = current.start;
      days = current.days;
      period = current.period;
    } else {
      start = localStart(filters.startDate, timezone);
      days = rangeDays;
    }
  }

  const end = addDays(start, days);
  const inclusiveEnd = addDays(end, -1);
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  });
  const granularity = days === 1
    ? "hour" as const
    : days <= 31
      ? "day" as const
      : days <= 120
        ? "week" as const
        : "month" as const;

  return {
    period,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    startDate: dateKey(start, timezone),
    endDate: dateKey(inclusiveEnd, timezone),
    label: days === 1
      ? dateFormatter.format(start)
      : `${dateFormatter.format(start)} — ${dateFormatter.format(inclusiveEnd)}`,
    days,
    granularity,
  };
}

export function buildAnalyticsIntervals(
  period: ReturnType<typeof resolveAnalyticsPeriod>,
  timezone: string,
): AnalyticsTimePoint[] {
  const start = new TZDateMini(period.startsAt, timezone);
  const end = new TZDateMini(period.endsAt, timezone);
  const points: AnalyticsTimePoint[] = [];
  let cursor = start;
  let index = 0;
  const shortDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone,
  });
  const fullDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: timezone,
  });
  const month = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
    timeZone: timezone,
  });

  while (cursor < end) {
    let next = period.granularity === "hour"
      ? addHours(cursor, 1)
      : period.granularity === "day"
        ? addDays(cursor, 1)
        : period.granularity === "week"
          ? addDays(cursor, 7)
          : addMonths(cursor, 1);
    if (next > end) next = end;
    const label = period.granularity === "hour"
      ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: timezone }).format(cursor)
      : period.granularity === "month"
        ? month.format(cursor).replace(" de ", "/")
        : shortDate.format(cursor);
    const tooltipLabel = period.granularity === "hour"
      ? `${fullDate.format(cursor)}, ${label}`
      : period.granularity === "week"
        ? `${shortDate.format(cursor)} a ${shortDate.format(addDays(next, -1))}`
        : period.granularity === "month"
          ? new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: timezone }).format(cursor)
          : fullDate.format(cursor);
    points.push({
      key: `${period.granularity}-${index}`,
      label,
      tooltipLabel,
      startsAt: cursor.toISOString(),
      endsAt: next.toISOString(),
      value: 0,
    });
    cursor = next;
    index += 1;
  }
  return points;
}

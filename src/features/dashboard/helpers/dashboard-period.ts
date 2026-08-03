import { TZDateMini } from "@date-fns/tz";
import { addDays } from "date-fns";

import type {
  DashboardDayPoint,
  DashboardPeriod,
} from "@/features/dashboard/types/operational-dashboard";

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

export function resolveDashboardPeriod(
  period: DashboardPeriod,
  timezone: string,
  reference = new Date(),
) {
  const todayKey = dateKey(reference, timezone);
  const today = localStart(todayKey, timezone);
  let start = today;
  let days = 1;
  if (period === "week") {
    const offset = (today.getDay() + 6) % 7;
    start = addDays(today, -offset);
    days = 7;
  } else if (period === "next7") {
    days = 7;
  } else if (period === "next30") {
    days = 30;
  }
  const end = addDays(start, days);
  const inclusiveEnd = addDays(end, -1);
  const labelFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  });
  return {
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    startDate: dateKey(start, timezone),
    endDate: dateKey(inclusiveEnd, timezone),
    label: days === 1
      ? labelFormatter.format(start)
      : `${labelFormatter.format(start)} — ${labelFormatter.format(inclusiveEnd)}`,
    days,
  };
}

export function buildDashboardDays(
  startsAt: string,
  days: number,
  timezone: string,
): Array<DashboardDayPoint & { startsAt: string; endsAt: string }> {
  const start = new TZDateMini(startsAt, timezone);
  return Array.from({ length: days }, (_, index) => {
    const dayStart = addDays(start, index);
    const dayEnd = addDays(dayStart, 1);
    return {
      date: dateKey(dayStart, timezone),
      weekday: new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
        timeZone: timezone,
      }).format(dayStart).replace(".", ""),
      dateLabel: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: timezone,
      }).format(dayStart),
      count: 0,
      startsAt: dayStart.toISOString(),
      endsAt: dayEnd.toISOString(),
    };
  });
}

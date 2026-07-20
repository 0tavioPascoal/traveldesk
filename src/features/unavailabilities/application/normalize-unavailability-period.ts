import "server-only";

import { TZDateMini } from "@date-fns/tz";
import { addDays } from "date-fns";

import type { UnavailabilityFormInput } from "@/features/unavailabilities/schemas/unavailability-schema";

type PeriodResult =
  | { success: true; startsAt: string; endsAt: string }
  | { success: false };

function parts(value: string) {
  const [date, time = "00:00"] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return { year, month, day, hour, minute };
}

function localDate(value: string, timezone: string) {
  const item = parts(value);
  const date = new TZDateMini(
    item.year,
    item.month - 1,
    item.day,
    item.hour,
    item.minute,
    0,
    0,
    timezone,
  );
  const valid = date.getFullYear() === item.year
    && date.getMonth() === item.month - 1
    && date.getDate() === item.day
    && date.getHours() === item.hour
    && date.getMinutes() === item.minute;
  return valid ? date : null;
}

export function normalizeUnavailabilityPeriod(
  input: Pick<UnavailabilityFormInput, "startsAt" | "endsAt" | "allDay">,
  timezone: string,
): PeriodResult {
  try {
    const start = localDate(input.startsAt, timezone);
    const inclusiveEnd = localDate(input.endsAt, timezone);
    if (!start || !inclusiveEnd) return { success: false };
    const end = input.allDay ? addDays(inclusiveEnd, 1) : inclusiveEnd;
    if (end.getTime() <= start.getTime()) return { success: false };
    return {
      success: true,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
    };
  } catch {
    return { success: false };
  }
}

export function normalizeUnavailabilityFilterPeriod(
  startsOn: string,
  endsOn: string,
  timezone: string,
) {
  try {
    const start = startsOn ? localDate(startsOn, timezone) : null;
    const inclusiveEnd = endsOn ? localDate(endsOn, timezone) : null;
    return {
      startsAt: start?.toISOString() ?? null,
      endsAt: inclusiveEnd ? addDays(inclusiveEnd, 1).toISOString() : null,
    };
  } catch {
    return { startsAt: null, endsAt: null };
  }
}

export function formatUnavailabilityPeriodForForm(
  startsAt: string,
  endsAt: string,
  allDay: boolean,
  timezone: string,
) {
  const format = (value: Date, includeTime: boolean) => {
    const year = String(value.getFullYear()).padStart(4, "0");
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    if (!includeTime) return `${year}-${month}-${day}`;
    const hour = String(value.getHours()).padStart(2, "0");
    const minute = String(value.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };
  const start = new TZDateMini(startsAt, timezone);
  const exclusiveEnd = new TZDateMini(endsAt, timezone);
  const visibleEnd = allDay ? addDays(exclusiveEnd, -1) : exclusiveEnd;
  return {
    startsAt: format(start, !allDay),
    endsAt: format(visibleEnd, !allDay),
  };
}

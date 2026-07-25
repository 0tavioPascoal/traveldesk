import "server-only";

import { TZDateMini } from "@date-fns/tz";
import { addDays } from "date-fns";

import type { TripFormInput } from "@/features/trips/schemas/trip-schema";

function localDateTime(value: string, timezone: string) {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const result = new TZDateMini(year, month - 1, day, hour, minute, 0, 0, timezone);
  return result.getFullYear() === year && result.getMonth() === month - 1
    && result.getDate() === day && result.getHours() === hour && result.getMinutes() === minute
    ? result : null;
}

export function normalizeTripPeriods(input: TripFormInput, timezone: string) {
  try {
    const convert = (value: string | null) => value ? localDateTime(value, timezone)?.toISOString() ?? null : null;
    const travelStartsAt = convert(input.travelStartsAt);
    const travelEndsAt = convert(input.travelEndsAt);
    const serviceStartsAt = convert(input.serviceStartsAt);
    const serviceEndsAt = convert(input.serviceEndsAt);
    if (Boolean(input.travelStartsAt) !== Boolean(travelStartsAt)
      || Boolean(input.travelEndsAt) !== Boolean(travelEndsAt)
      || Boolean(input.serviceStartsAt) !== Boolean(serviceStartsAt)
      || Boolean(input.serviceEndsAt) !== Boolean(serviceEndsAt)) return { success: false as const };
    if (travelStartsAt && travelEndsAt && travelEndsAt <= travelStartsAt) return { success: false as const };
    if (serviceStartsAt && serviceEndsAt && serviceEndsAt <= serviceStartsAt) return { success: false as const };
    if (serviceStartsAt && (!travelStartsAt || !travelEndsAt || serviceStartsAt < travelStartsAt || serviceEndsAt! > travelEndsAt)) return { success: false as const };
    return { success: true as const, travelStartsAt, travelEndsAt, serviceStartsAt, serviceEndsAt };
  } catch { return { success: false as const }; }
}

export function normalizeTripFilterPeriod(startsOn: string, endsOn: string, timezone: string) {
  try {
    const start = startsOn ? new TZDateMini(`${startsOn}T00:00:00`, timezone) : null;
    const end = endsOn ? addDays(new TZDateMini(`${endsOn}T00:00:00`, timezone), 1) : null;
    return { startsAt: start?.toISOString() ?? null, endsAt: end?.toISOString() ?? null };
  } catch { return { startsAt: null, endsAt: null }; }
}

export function formatTripDateTimeForForm(value: string | null, timezone: string) {
  if (!value) return "";
  const date = new TZDateMini(value, timezone);
  const part = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`;
}

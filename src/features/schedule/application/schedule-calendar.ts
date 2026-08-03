import { TZDateMini } from "@date-fns/tz";
import { addDays } from "date-fns";

import type {
  ScheduleCalendarLayout,
  ScheduleDay,
  ScheduleEvent,
  ScheduleEventSegment,
} from "@/features/schedule/types/schedule";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function localDateKey(value: Date | string, timezone: string) {
  const date = typeof value === "string"
    ? new TZDateMini(value, timezone)
    : new TZDateMini(value.getTime(), timezone);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function validLocalDate(value: string, timezone: string) {
  try {
    const date = new TZDateMini(`${value}T00:00:00`, timezone);
    return localDateKey(date, timezone) === value ? date : null;
  } catch {
    return null;
  }
}

export function resolveWeekStart(
  value: string,
  timezone: string,
  reference = new Date(),
) {
  const date = validLocalDate(value, timezone) ?? new TZDateMini(reference, timezone);
  const offset = (date.getDay() + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - offset);
  return localDateKey(date, timezone);
}

export function getWeekPeriod(weekStart: string, timezone: string) {
  const start = validLocalDate(weekStart, timezone);
  if (!start) throw new Error("Não foi possível determinar a semana.");
  const end = addDays(start, 7);
  return {
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    endKey: localDateKey(end, timezone),
  };
}

export function moveWeek(weekStart: string, timezone: string, amount: number) {
  const start = validLocalDate(weekStart, timezone);
  if (!start) return weekStart;
  return localDateKey(addDays(start, amount * 7), timezone);
}

function assignLanes(segments: ScheduleEventSegment[]) {
  const sorted = [...segments].sort(
    (left, right) =>
      left.startMinute - right.startMinute ||
      left.endMinute - right.endMinute ||
      left.segmentId.localeCompare(right.segmentId),
  );
  let group: ScheduleEventSegment[] = [];
  let groupEnd = -1;

  function finishGroup() {
    if (group.length === 0) return;
    const laneEnds: number[] = [];
    for (const segment of group) {
      let lane = laneEnds.findIndex((end) => end <= segment.startMinute);
      if (lane < 0) lane = laneEnds.length;
      laneEnds[lane] = segment.endMinute;
      segment.lane = lane;
    }
    for (const segment of group) segment.laneCount = laneEnds.length;
    group = [];
  }

  for (const segment of sorted) {
    if (group.length > 0 && segment.startMinute >= groupEnd) finishGroup();
    group.push(segment);
    groupEnd = Math.max(groupEnd, segment.endMinute);
  }
  finishGroup();
}

export function buildScheduleCalendarLayout(
  events: ScheduleEvent[],
  weekStart: string,
  timezone: string,
  reference = new Date(),
): ScheduleCalendarLayout {
  const week = validLocalDate(weekStart, timezone);
  if (!week) throw new Error("Não foi possível montar o calendário.");
  const todayKey = localDateKey(reference, timezone);
  const days: ScheduleDay[] = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(week, index);
    return {
      key: localDateKey(date, timezone),
      shortLabel: new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: timezone }).format(date).replace(".", ""),
      dateLabel: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: timezone }).format(date),
      longLabel: new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: timezone }).format(date),
      isToday: localDateKey(date, timezone) === todayKey,
      isWeekend: index >= 5,
    };
  });
  const segments: ScheduleEventSegment[] = [];

  for (const event of events) {
    const eventStart = new Date(event.startsAt).getTime();
    const eventEnd = new Date(event.endsAt).getTime();
    if (!(eventStart < eventEnd)) continue;
    for (const day of days) {
      const dayStart = validLocalDate(day.key, timezone);
      if (!dayStart) continue;
      const dayEnd = addDays(dayStart, 1);
      const start = Math.max(eventStart, dayStart.getTime());
      const end = Math.min(eventEnd, dayEnd.getTime());
      if (start >= end) continue;
      const localStart = new TZDateMini(start, timezone);
      const localEnd = new TZDateMini(end, timezone);
      const coversDay = start === dayStart.getTime() && end === dayEnd.getTime();
      const allDay = (event.type !== "trip" && event.allDay) || coversDay;
      segments.push({
        segmentId: `${event.type}:${event.id}:${day.key}`,
        event,
        dayKey: day.key,
        startsAt: new Date(start).toISOString(),
        endsAt: new Date(end).toISOString(),
        startMinute: start === dayStart.getTime() ? 0 : localStart.getHours() * 60 + localStart.getMinutes(),
        endMinute: end === dayEnd.getTime() ? 1440 : localEnd.getHours() * 60 + localEnd.getMinutes(),
        allDay,
        continuesBefore: eventStart < dayStart.getTime(),
        continuesAfter: eventEnd > dayEnd.getTime(),
        lane: 0,
        laneCount: 1,
      });
    }
  }

  const timed = segments.filter((segment) => !segment.allDay);
  for (const day of days) assignLanes(timed.filter((segment) => segment.dayKey === day.key));
  const minimum = timed.length ? Math.min(...timed.map((segment) => segment.startMinute)) : 6 * 60;
  const maximum = timed.length ? Math.max(...timed.map((segment) => segment.endMinute)) : 20 * 60;
  const startHour = Math.max(0, Math.min(6, Math.floor(minimum / 60)));
  const endHour = Math.min(24, Math.max(20, Math.ceil(maximum / 60)));
  const now = new TZDateMini(reference, timezone);
  const currentDayKey = days.some((day) => day.key === todayKey) ? todayKey : null;

  return {
    days,
    segments,
    startHour,
    endHour,
    currentDayKey,
    currentMinute: currentDayKey ? now.getHours() * 60 + now.getMinutes() : null,
  };
}

export function formatSchedulePeriod(
  startsAt: string,
  endsAt: string,
  timezone: string,
) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: timezone,
  });
  return `${formatter.format(new Date(startsAt))} → ${formatter.format(new Date(endsAt))}`;
}

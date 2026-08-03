"use client";

import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null;
}

function dateKey(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function todayInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: "year" | "month" | "day") =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatBrazilianDate(value: string) {
  const parsed = parseDateKey(value);
  return parsed
    ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(parsed)
    : "";
}

function monthStart(value: string, fallback: string) {
  const parsed = parseDateKey(value) ?? parseDateKey(fallback) ?? new Date();
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), 1));
}

export function DatePicker({
  id,
  name,
  label,
  defaultValue,
  value: controlledValue,
  onValueChange,
  timezone,
  disabled = false,
  required = false,
  ariaInvalid,
  ariaDescribedBy,
}: {
  id: string;
  name?: string;
  label: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  timezone: string;
  disabled?: boolean;
  required?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}) {
  const today = todayInTimezone(timezone);
  const initialValue = defaultValue ?? controlledValue ?? "";
  const [internalValue, setInternalValue] = useState(parseDateKey(initialValue) ? initialValue : "");
  const value = controlledValue ?? internalValue;
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(initialValue, today));
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `${id}-calendar-title`;
  const firstWeekDay = (visibleMonth.getUTCDay() + 6) % 7;
  const gridStart = new Date(visibleMonth);
  gridStart.setUTCDate(gridStart.getUTCDate() - firstWeekDay);
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setUTCDate(day.getUTCDate() + index);
    return day;
  });
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(visibleMonth);

  function moveMonth(amount: number) {
    setVisibleMonth((current) =>
      new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + amount, 1)),
    );
  }

  function selectDate(nextValue: string) {
    if (controlledValue === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setVisibleMonth(monthStart(nextValue, today));
    dialogRef.current?.close();
  }

  function moveCalendarFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const offsets: Partial<Record<string, number>> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -(index % 7),
      End: 6 - (index % 7),
    };
    const offset = offsets[event.key];
    if (offset === undefined) return;
    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= days.length) return;
    event.preventDefault();
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      "[data-calendar-day]",
    );
    buttons?.[targetIndex]?.focus();
  }

  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}{" "}
        {required ? (
          <>
            <span className="text-destructive" aria-hidden="true">*</span>
            <span className="sr-only"> (obrigatório)</span>
          </>
        ) : null}
      </label>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        data-invalid={ariaInvalid || undefined}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-input bg-background px-3 text-left text-sm text-foreground outline-none transition hover:bg-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 data-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
      >
        <span className={value ? "truncate" : "truncate text-muted-foreground"}>
          {value ? formatBrazilianDate(value) : "dd/mm/aaaa"}
        </span>
        <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[min(22rem,calc(100%-2rem))] rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl backdrop:bg-background/75 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              aria-label="Mês anterior"
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
            <h2 id={titleId} className="capitalize font-semibold">
              {monthLabel}
            </h2>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              aria-label="Próximo mês"
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>

          <div role="grid" aria-label={`Calendário de ${monthLabel}`} className="mt-3 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <span
                key={day}
                role="columnheader"
                className="grid h-8 place-items-center text-xs font-semibold text-muted-foreground"
              >
                {day}
              </span>
            ))}
            {days.map((day, index) => {
              const key = dateKey(day);
              const outside = day.getUTCMonth() !== visibleMonth.getUTCMonth();
              const selected = key === value;
              const isToday = key === today;
              return (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  data-calendar-day=""
                  aria-label={new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "full",
                    timeZone: "UTC",
                  }).format(day)}
                  aria-selected={selected}
                  aria-current={isToday ? "date" : undefined}
                  onClick={() => selectDate(key)}
                  onKeyDown={(event) => moveCalendarFocus(event, index)}
                  className={`grid size-10 place-items-center rounded-lg text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring ${
                    selected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : isToday
                        ? "border border-primary text-primary"
                        : outside
                          ? "text-muted-foreground/55 hover:bg-muted"
                          : "hover:bg-muted"
                  }`}
                >
                  {day.getUTCDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => {
                if (controlledValue === undefined) setInternalValue("");
                onValueChange?.("");
                dialogRef.current?.close();
              }}
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className={buttonStyles({ variant: "secondary", size: "sm" })}
            >
              <X aria-hidden="true" className="size-4" />
              Fechar
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

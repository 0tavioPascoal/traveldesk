"use client";

import { useState } from "react";

import {
  formControlClassName,
  formErrorClassName,
  formHelpClassName,
  formLabelClassName,
  RequiredIndicator,
} from "@/components/forms/form-layout";
import { DatePicker } from "@/components/ui/date-picker";

function splitDateTime(value: string) {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(value);
  return { date: match?.[1] ?? "", time: match?.[2] ?? "" };
}

export function DateTimePicker({
  id,
  name,
  label,
  defaultValue,
  timezone,
  disabled = false,
  required = false,
  error,
  help,
  onValueChange,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  timezone: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  help?: string;
  onValueChange?: (value: string) => void;
}) {
  const initial = splitDateTime(defaultValue);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = error ? errorId : help ? helpId : undefined;

  function updateDate(nextDate: string) {
    setDate(nextDate);
    onValueChange?.(nextDate && time ? `${nextDate}T${time}` : "");
  }

  function updateTime(nextTime: string) {
    setTime(nextTime);
    onValueChange?.(date && nextTime ? `${date}T${nextTime}` : "");
  }

  return (
    <fieldset className="min-w-0">
      <legend className={`${formLabelClassName} mb-1.5`}>
        {label} {required ? <RequiredIndicator /> : null}
      </legend>
      <input type="hidden" name={name} value={date && time ? `${date}T${time}` : ""} />
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7.5rem]">
        <DatePicker
          id={`${id}-date`}
          label="Data"
          value={date}
          onValueChange={updateDate}
          timezone={timezone}
          disabled={disabled}
          ariaInvalid={Boolean(error)}
          ariaDescribedBy={describedBy}
        />
        <div className="space-y-1.5">
          <label htmlFor={`${id}-time`} className={formLabelClassName}>
            Horário
          </label>
          <input
            id={`${id}-time`}
            type="time"
            step={60}
            value={time}
            disabled={disabled}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            onChange={(event) => updateTime(event.target.value)}
            className={formControlClassName}
          />
        </div>
      </div>
      {help ? (
        <p id={helpId} className={`${formHelpClassName} mt-1.5`}>
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className={`${formErrorClassName} mt-1.5`}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

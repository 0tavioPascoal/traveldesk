"use client";

import { useState } from "react";

import {
  formErrorClassName,
  formHelpClassName,
  formSectionClassName,
} from "@/components/forms/form-layout";
import { DatePicker } from "@/components/ui/date-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import type {
  UnavailabilityFieldErrors,
  UnavailabilityFormValues,
} from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityPeriodFields({
  values,
  errors,
  disabled,
  timezone,
}: {
  values: Pick<UnavailabilityFormValues, "startsAt" | "endsAt" | "allDay">;
  errors: UnavailabilityFieldErrors;
  disabled: boolean;
  timezone: string;
}) {
  const [allDay, setAllDay] = useState(values.allDay);
  const startError = errors.startsAt?.[0];
  const endError = errors.endsAt?.[0];

  return (
    <fieldset className={formSectionClassName}>
      <legend className="sr-only">Período</legend>
      <div>
        <h2 className="text-base font-semibold text-foreground">Período</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Defina quando o recurso ficará indisponível.
        </p>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <input
          name="allDay"
          type="checkbox"
          checked={allDay}
          disabled={disabled}
          onChange={(event) => setAllDay(event.target.checked)}
          className="mt-0.5 size-4 rounded border-input accent-primary"
        />
        <span>
          <span className="block text-sm font-medium text-foreground">Dia inteiro</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            Use datas inteiras quando não houver um horário específico.
          </span>
        </span>
      </label>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {allDay ? (
          <>
            <div>
              <DatePicker
                id="startsAt"
                name="startsAt"
                label="Data inicial"
                defaultValue={values.startsAt}
                timezone={timezone}
                disabled={disabled}
                required
                ariaInvalid={Boolean(startError)}
                ariaDescribedBy={startError ? "startsAt-error" : undefined}
              />
              {startError ? (
                <p id="startsAt-error" role="alert" className={`${formErrorClassName} mt-1.5`}>
                  {startError}
                </p>
              ) : null}
            </div>
            <div>
              <DatePicker
                id="endsAt"
                name="endsAt"
                label="Data final (inclusiva)"
                defaultValue={values.endsAt}
                timezone={timezone}
                disabled={disabled}
                required
                ariaInvalid={Boolean(endError)}
                ariaDescribedBy={endError ? "endsAt-error" : undefined}
              />
              {endError ? (
                <p id="endsAt-error" role="alert" className={`${formErrorClassName} mt-1.5`}>
                  {endError}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <DateTimePicker
              id="startsAt"
              name="startsAt"
              label="Início"
              defaultValue={values.startsAt}
              timezone={timezone}
              disabled={disabled}
              required
              error={startError}
            />
            <DateTimePicker
              id="endsAt"
              name="endsAt"
              label="Final"
              defaultValue={values.endsAt}
              timezone={timezone}
              disabled={disabled}
              required
              error={endError}
            />
          </>
        )}
      </div>
      <p className={`${formHelpClassName} mt-5`}>
        Horários interpretados em {timezone}. O período segue [início, fim): o instante final
        não fica bloqueado.
      </p>
    </fieldset>
  );
}

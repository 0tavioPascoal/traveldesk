"use client";

import { useState } from "react";

import type { UnavailabilityFieldErrors, UnavailabilityFormValues } from "@/features/unavailabilities/types/unavailability";

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
  const input = "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:bg-zinc-100";
  return (
    <fieldset className="grid gap-5 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2">
      <legend className="px-1 font-semibold">Período</legend>
      <label className="flex items-center gap-3 sm:col-span-2"><input name="allDay" type="checkbox" checked={allDay} disabled={disabled} onChange={(event) => setAllDay(event.target.checked)} /><span className="text-sm font-medium">Dia inteiro</span></label>
      <div className="space-y-2"><label htmlFor="startsAt" className="block text-sm font-medium">{allDay ? "Data inicial" : "Início"}</label><input key={`start-${allDay}`} id="startsAt" name="startsAt" type={allDay ? "date" : "datetime-local"} required disabled={disabled} defaultValue={values.startsAt} aria-invalid={errors.startsAt ? true : undefined} className={input} />{errors.startsAt?.[0] ? <p role="alert" className="text-sm text-red-700">{errors.startsAt[0]}</p> : null}</div>
      <div className="space-y-2"><label htmlFor="endsAt" className="block text-sm font-medium">{allDay ? "Data final (inclusiva)" : "Final"}</label><input key={`end-${allDay}`} id="endsAt" name="endsAt" type={allDay ? "date" : "datetime-local"} required disabled={disabled} defaultValue={values.endsAt} aria-invalid={errors.endsAt ? true : undefined} className={input} />{errors.endsAt?.[0] ? <p role="alert" className="text-sm text-red-700">{errors.endsAt[0]}</p> : null}</div>
      <p className="text-xs text-zinc-500 sm:col-span-2">Horários interpretados em {timezone}. O fim não bloqueia o instante seguinte.</p>
    </fieldset>
  );
}

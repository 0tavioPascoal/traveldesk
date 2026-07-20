"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createTechnicianUnavailabilityAction } from "@/features/unavailabilities/actions/create-technician-unavailability-action";
import { createVehicleUnavailabilityAction } from "@/features/unavailabilities/actions/create-vehicle-unavailability-action";
import { updateTechnicianUnavailabilityAction } from "@/features/unavailabilities/actions/update-technician-unavailability-action";
import { updateVehicleUnavailabilityAction } from "@/features/unavailabilities/actions/update-vehicle-unavailability-action";
import { UnavailabilityPeriodFields } from "@/features/unavailabilities/components/unavailability-period-fields";
import type { UnavailabilityActionState, UnavailabilityFormValues, UnavailabilityResourceKind, UnavailabilityTypeOption } from "@/features/unavailabilities/types/unavailability";

type ResourceOption = { id: string; label: string; active: boolean; description?: string };

export function UnavailabilityForm({
  organizationSlug,
  resource,
  timezone,
  resources,
  types,
  initialValues,
  unavailabilityId,
}: {
  organizationSlug: string;
  resource: UnavailabilityResourceKind;
  timezone: string;
  resources: ResourceOption[];
  types: UnavailabilityTypeOption[];
  initialValues: UnavailabilityFormValues;
  unavailabilityId?: string;
}) {
  const action = resource === "technicians"
    ? unavailabilityId
      ? updateTechnicianUnavailabilityAction.bind(null, organizationSlug, unavailabilityId)
      : createTechnicianUnavailabilityAction.bind(null, organizationSlug)
    : unavailabilityId
      ? updateVehicleUnavailabilityAction.bind(null, organizationSlug, unavailabilityId)
      : createVehicleUnavailabilityAction.bind(null, organizationSlug);
  const [state, formAction, pending] = useActionState(action, {
    status: "idle", message: null, fieldErrors: {}, values: initialValues,
  } satisfies UnavailabilityActionState);
  const listPath = `/app/${organizationSlug}/planejamento/indisponibilidades?resource=${resource}`;
  const input = "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:bg-zinc-100";
  return (
    <form action={formAction} noValidate className="space-y-6">
      <fieldset className="grid gap-5 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2">
        <legend className="px-1 font-semibold">Recurso e motivo</legend>
        <div className="space-y-2"><label htmlFor="resourceId" className="block text-sm font-medium">{resource === "technicians" ? "Técnico" : "Veículo"}</label><select id="resourceId" name="resourceId" required disabled={pending} defaultValue={state.values.resourceId} aria-invalid={state.fieldErrors.resourceId ? true : undefined} className={input}><option value="">Selecione</option>{resources.map((item) => <option key={item.id} value={item.id}>{item.label}{item.active ? "" : " (inativo)"}</option>)}</select>{state.fieldErrors.resourceId?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.resourceId[0]}</p> : null}</div>
        <div className="space-y-2"><label htmlFor="unavailabilityTypeId" className="block text-sm font-medium">Tipo de indisponibilidade</label><select id="unavailabilityTypeId" name="unavailabilityTypeId" required disabled={pending} defaultValue={state.values.unavailabilityTypeId} aria-invalid={state.fieldErrors.unavailabilityTypeId ? true : undefined} className={input}><option value="">Selecione</option>{types.map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? "" : " (inativo)"}</option>)}</select>{state.fieldErrors.unavailabilityTypeId?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.unavailabilityTypeId[0]}</p> : null}</div>
        <div className="space-y-2 sm:col-span-2"><label htmlFor="reason" className="block text-sm font-medium">Motivo resumido</label><input id="reason" name="reason" maxLength={500} disabled={pending} defaultValue={state.values.reason} aria-invalid={state.fieldErrors.reason ? true : undefined} className={input} />{state.fieldErrors.reason?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.reason[0]}</p> : null}</div>
      </fieldset>
      <UnavailabilityPeriodFields values={state.values} errors={state.fieldErrors} disabled={pending} timezone={timezone} />
      <div className="space-y-2"><label htmlFor="notes" className="block text-sm font-medium">Observações</label><textarea id="notes" name="notes" rows={5} maxLength={2000} disabled={pending} defaultValue={state.values.notes} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" />{state.fieldErrors.notes?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.notes[0]}</p> : null}</div>
      {state.message ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={listPath} className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold">Cancelar</Link><button type="submit" disabled={pending} className="h-11 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Salvando..." : "Salvar indisponibilidade"}</button></div>
    </form>
  );
}

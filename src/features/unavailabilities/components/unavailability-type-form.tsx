"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createTechnicianUnavailabilityTypeAction } from "@/features/unavailabilities/actions/create-technician-unavailability-type-action";
import { createVehicleUnavailabilityTypeAction } from "@/features/unavailabilities/actions/create-vehicle-unavailability-type-action";
import { updateTechnicianUnavailabilityTypeAction } from "@/features/unavailabilities/actions/update-technician-unavailability-type-action";
import { updateVehicleUnavailabilityTypeAction } from "@/features/unavailabilities/actions/update-vehicle-unavailability-type-action";
import type { UnavailabilityResourceKind, UnavailabilityTypeActionState, UnavailabilityTypeFormValues } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityTypeForm({
  organizationSlug,
  resource,
  initialValues,
  typeId,
}: {
  organizationSlug: string;
  resource: UnavailabilityResourceKind;
  initialValues: UnavailabilityTypeFormValues;
  typeId?: string;
}) {
  const action = resource === "technicians"
    ? typeId
      ? updateTechnicianUnavailabilityTypeAction.bind(null, organizationSlug, typeId)
      : createTechnicianUnavailabilityTypeAction.bind(null, organizationSlug)
    : typeId
      ? updateVehicleUnavailabilityTypeAction.bind(null, organizationSlug, typeId)
      : createVehicleUnavailabilityTypeAction.bind(null, organizationSlug);
  const [state, formAction, pending] = useActionState(action, {
    status: "idle", message: null, fieldErrors: {}, values: initialValues,
  } satisfies UnavailabilityTypeActionState);
  const category = resource === "technicians" ? "tecnicos" : "veiculos";
  const listPath = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/${category}`;
  return (
    <form action={formAction} noValidate className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-zinc-800">Nome</label>
        <input id="name" name="name" required minLength={2} maxLength={120} autoFocus disabled={pending} defaultValue={state.values.name} aria-invalid={state.fieldErrors.name ? true : undefined} className="h-11 w-full rounded-lg border border-zinc-300 px-3 text-base outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 sm:text-sm" />
        {state.fieldErrors.name?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.name[0]}</p> : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-zinc-800">Descrição</label>
        <textarea id="description" name="description" rows={5} maxLength={1000} disabled={pending} defaultValue={state.values.description} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" />
        {state.fieldErrors.description?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.description[0]}</p> : null}
      </div>
      <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4">
        <input name="active" type="checkbox" defaultChecked={state.values.active} disabled={pending} className="mt-0.5 size-4" />
        <span><span className="block text-sm font-medium">Ativo</span><span className="text-xs text-zinc-500">Tipos ativos podem ser usados em novas indisponibilidades.</span></span>
      </label>
      {state.message ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={listPath} className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold">Cancelar</Link>
        <button type="submit" disabled={pending} className="h-11 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Salvando..." : "Salvar tipo"}</button>
      </div>
    </form>
  );
}

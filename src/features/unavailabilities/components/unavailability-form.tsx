"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { createTechnicianUnavailabilityAction } from "@/features/unavailabilities/actions/create-technician-unavailability-action";
import { createVehicleUnavailabilityAction } from "@/features/unavailabilities/actions/create-vehicle-unavailability-action";
import { updateTechnicianUnavailabilityAction } from "@/features/unavailabilities/actions/update-technician-unavailability-action";
import { updateVehicleUnavailabilityAction } from "@/features/unavailabilities/actions/update-vehicle-unavailability-action";
import { UnavailabilityPeriodFields } from "@/features/unavailabilities/components/unavailability-period-fields";
import type { UnavailabilityActionState, UnavailabilityFormValues, UnavailabilityResourceKind, UnavailabilityTypeOption } from "@/features/unavailabilities/types/unavailability";

type ResourceOption = { id: string; label: string; active: boolean; description?: string };

export function UnavailabilityForm({ organizationSlug, resource, timezone, resources, types, initialValues, unavailabilityId }: { organizationSlug: string; resource: UnavailabilityResourceKind; timezone: string; resources: ResourceOption[]; types: UnavailabilityTypeOption[]; initialValues: UnavailabilityFormValues; unavailabilityId?: string }) {
  const action = resource === "technicians"
    ? unavailabilityId ? updateTechnicianUnavailabilityAction.bind(null, organizationSlug, unavailabilityId) : createTechnicianUnavailabilityAction.bind(null, organizationSlug)
    : unavailabilityId ? updateVehicleUnavailabilityAction.bind(null, organizationSlug, unavailabilityId) : createVehicleUnavailabilityAction.bind(null, organizationSlug);
  const [state, formAction, pending] = useActionState(action, { status: "idle", message: null, fieldErrors: {}, values: initialValues } satisfies UnavailabilityActionState);
  const [notesLength, setNotesLength] = useState(state.values.notes.length);
  const listPath = `/app/${organizationSlug}/planejamento/indisponibilidades?resource=${resource}`;
  const control = "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:bg-muted";
  const resourceLabel = resource === "technicians" ? "Técnico" : "Veículo";
  const noResources = resources.length === 0;
  const noTypes = types.length === 0;

  return <form action={formAction} noValidate className="space-y-6">
    <fieldset className="grid gap-5 rounded-xl border border-border p-4 sm:grid-cols-2">
      <legend className="px-1 font-semibold">Recurso e tipo</legend>
      <div className="space-y-1.5"><label htmlFor="resourceId" className="block text-sm font-medium">{resourceLabel}</label><select id="resourceId" name="resourceId" required disabled={pending || noResources} defaultValue={state.values.resourceId} aria-invalid={state.fieldErrors.resourceId?.[0] ? true : undefined} aria-describedby={state.fieldErrors.resourceId?.[0] ? "resourceId-error" : noResources ? "resourceId-empty" : undefined} className={control}><option value="">{noResources ? `Nenhum ${resourceLabel.toLocaleLowerCase("pt-BR")} disponível` : "Selecione"}</option>{resources.map((item) => <option key={item.id} value={item.id}>{item.label}{item.active ? "" : " (inativo)"}</option>)}</select>{noResources ? <p id="resourceId-empty" className="text-xs leading-5 text-muted-foreground">Nenhum recurso ativo está disponível para este cadastro.</p> : null}{state.fieldErrors.resourceId?.[0] ? <p id="resourceId-error" role="alert" className="text-sm text-destructive">{state.fieldErrors.resourceId[0]}</p> : null}</div>
      <div className="space-y-1.5"><label htmlFor="unavailabilityTypeId" className="block text-sm font-medium">Tipo de indisponibilidade</label><select id="unavailabilityTypeId" name="unavailabilityTypeId" required disabled={pending || noTypes} defaultValue={state.values.unavailabilityTypeId} aria-invalid={state.fieldErrors.unavailabilityTypeId?.[0] ? true : undefined} aria-describedby={state.fieldErrors.unavailabilityTypeId?.[0] ? "unavailabilityTypeId-error" : noTypes ? "unavailabilityTypeId-empty" : undefined} className={control}><option value="">{noTypes ? "Nenhum tipo disponível" : "Selecione"}</option>{types.map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? "" : " (inativo)"}</option>)}</select>{noTypes ? <p id="unavailabilityTypeId-empty" className="text-xs leading-5 text-muted-foreground">Nenhum tipo de indisponibilidade está disponível para este recurso.</p> : null}{state.fieldErrors.unavailabilityTypeId?.[0] ? <p id="unavailabilityTypeId-error" role="alert" className="text-sm text-destructive">{state.fieldErrors.unavailabilityTypeId[0]}</p> : null}</div>
    </fieldset>
    <UnavailabilityPeriodFields values={state.values} errors={state.fieldErrors} disabled={pending} timezone={timezone} />
    <fieldset className="space-y-5 rounded-xl border border-border p-4"><legend className="px-1 font-semibold">Motivo e observações</legend>
      <div className="space-y-1.5"><label htmlFor="reason" className="block text-sm font-medium">Motivo resumido <span className="font-normal text-muted-foreground">(opcional)</span></label><input id="reason" name="reason" maxLength={500} disabled={pending} defaultValue={state.values.reason} aria-invalid={state.fieldErrors.reason?.[0] ? true : undefined} aria-describedby={state.fieldErrors.reason?.[0] ? "reason-error" : "reason-help"} className={control} /><p id="reason-help" className="text-xs leading-5 text-muted-foreground">Use uma descrição objetiva para facilitar a consulta.</p>{state.fieldErrors.reason?.[0] ? <p id="reason-error" role="alert" className="text-sm text-destructive">{state.fieldErrors.reason[0]}</p> : null}</div>
      <div className="space-y-1.5"><label htmlFor="notes" className="block text-sm font-medium">Observações <span className="font-normal text-muted-foreground">(opcional)</span></label><textarea id="notes" name="notes" rows={5} maxLength={2000} disabled={pending} defaultValue={state.values.notes} onChange={(event) => setNotesLength(event.target.value.length)} aria-invalid={state.fieldErrors.notes?.[0] ? true : undefined} aria-describedby={`unavailability-notes-help${state.fieldErrors.notes?.[0] ? " notes-error" : ""}`} className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" /><div id="unavailability-notes-help" className="flex justify-between gap-4 text-xs text-muted-foreground"><span>As quebras de linha serão preservadas.</span><span>{notesLength}/2.000</span></div>{state.fieldErrors.notes?.[0] ? <p id="notes-error" role="alert" className="text-sm text-destructive">{state.fieldErrors.notes[0]}</p> : null}</div>
    </fieldset>
    {state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={listPath} className={buttonStyles({ variant: "secondary" })}>Cancelar</Link><button type="submit" disabled={pending || noResources || noTypes} className={buttonStyles()}>{pending ? "Salvando..." : unavailabilityId ? "Salvar alterações" : "Registrar indisponibilidade"}</button></div>
  </form>;
}

"use client";

import { useActionState, useState } from "react";

import { FormCancelLink } from "@/components/forms/form-cancel-link";
import {
  FormActions,
  formControlClassName,
  formSectionClassName,
  formTextareaClassName,
  RequiredIndicator,
} from "@/components/forms/form-layout";
import { useFocusFirstInvalid } from "@/components/forms/use-focus-first-invalid";
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
  const formRef = useFocusFirstInvalid(state.fieldErrors);
  const [notesLength, setNotesLength] = useState(state.values.notes.length);
  const [dirty, setDirty] = useState(false);
  const listPath = `/app/${organizationSlug}/planejamento/indisponibilidades?resource=${resource}`;
  const control = formControlClassName;
  const resourceLabel = resource === "technicians" ? "Técnico" : "Veículo";
  const noResources = resources.length === 0;
  const noTypes = types.length === 0;

  return <form ref={formRef} action={formAction} noValidate onChange={() => setDirty(true)} className="space-y-6">
    <fieldset className={`${formSectionClassName} grid gap-5 sm:grid-cols-2`}>
      <legend className="sr-only">Recurso e tipo</legend>
      <div className="sm:col-span-2"><h2 className="text-base font-semibold">Recurso e tipo</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Selecione o recurso afetado e o motivo do bloqueio.</p></div>
      <div className="space-y-1.5"><label htmlFor="resourceId" className="block text-sm font-medium">{resourceLabel} <RequiredIndicator /></label><select id="resourceId" name="resourceId" required disabled={pending || noResources} defaultValue={state.values.resourceId} aria-invalid={state.fieldErrors.resourceId?.[0] ? true : undefined} aria-describedby={state.fieldErrors.resourceId?.[0] ? "resourceId-error" : noResources ? "resourceId-empty" : undefined} className={control}><option value="">{noResources ? `Nenhum ${resourceLabel.toLocaleLowerCase("pt-BR")} disponível` : "Selecione"}</option>{resources.map((item) => <option key={item.id} value={item.id}>{item.label}{item.active ? "" : " (inativo)"}</option>)}</select>{noResources ? <p id="resourceId-empty" className="text-xs leading-5 text-muted-foreground">Nenhum recurso ativo está disponível para este cadastro.</p> : null}{state.fieldErrors.resourceId?.[0] ? <p id="resourceId-error" role="alert" className="text-sm text-destructive">{state.fieldErrors.resourceId[0]}</p> : null}</div>
      <div className="space-y-1.5"><label htmlFor="unavailabilityTypeId" className="block text-sm font-medium">Tipo de indisponibilidade <RequiredIndicator /></label><select id="unavailabilityTypeId" name="unavailabilityTypeId" required disabled={pending || noTypes} defaultValue={state.values.unavailabilityTypeId} aria-invalid={state.fieldErrors.unavailabilityTypeId?.[0] ? true : undefined} aria-describedby={state.fieldErrors.unavailabilityTypeId?.[0] ? "unavailabilityTypeId-error" : noTypes ? "unavailabilityTypeId-empty" : undefined} className={control}><option value="">{noTypes ? "Nenhum tipo disponível" : "Selecione"}</option>{types.map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? "" : " (inativo)"}</option>)}</select>{noTypes ? <p id="unavailabilityTypeId-empty" className="text-xs leading-5 text-muted-foreground">Nenhum tipo de indisponibilidade está disponível para este recurso.</p> : null}{state.fieldErrors.unavailabilityTypeId?.[0] ? <p id="unavailabilityTypeId-error" role="alert" className="text-sm text-destructive">{state.fieldErrors.unavailabilityTypeId[0]}</p> : null}</div>
    </fieldset>
    <UnavailabilityPeriodFields values={state.values} errors={state.fieldErrors} disabled={pending} timezone={timezone} />
    <fieldset className={`${formSectionClassName} space-y-5`}><legend className="sr-only">Motivo e observações</legend><div><h2 className="text-base font-semibold">Motivo e observações</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Adicione o contexto necessário para a equipe de planejamento.</p></div>
      <div className="space-y-1.5"><label htmlFor="reason" className="block text-sm font-medium">Motivo resumido <span className="font-normal text-muted-foreground">(opcional)</span></label><input id="reason" name="reason" maxLength={500} disabled={pending} defaultValue={state.values.reason} aria-invalid={state.fieldErrors.reason?.[0] ? true : undefined} aria-describedby={state.fieldErrors.reason?.[0] ? "reason-error" : "reason-help"} className={control} /><p id="reason-help" className="text-xs leading-5 text-muted-foreground">Use uma descrição objetiva para facilitar a consulta.</p>{state.fieldErrors.reason?.[0] ? <p id="reason-error" role="alert" className="text-sm text-destructive">{state.fieldErrors.reason[0]}</p> : null}</div>
      <div className="space-y-1.5"><label htmlFor="notes" className="block text-sm font-medium">Observações <span className="font-normal text-muted-foreground">(opcional)</span></label><textarea id="notes" name="notes" rows={5} maxLength={2000} disabled={pending} defaultValue={state.values.notes} onChange={(event) => setNotesLength(event.target.value.length)} aria-invalid={state.fieldErrors.notes?.[0] ? true : undefined} aria-describedby={`unavailability-notes-help${state.fieldErrors.notes?.[0] ? " notes-error" : ""}`} className={formTextareaClassName} /><div id="unavailability-notes-help" className="flex justify-between gap-4 text-xs text-muted-foreground"><span>As quebras de linha serão preservadas.</span><span>{notesLength}/2.000</span></div>{state.fieldErrors.notes?.[0] ? <p id="notes-error" role="alert" className="text-sm text-destructive">{state.fieldErrors.notes[0]}</p> : null}</div>
    </fieldset>
    {state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}
    <FormActions><FormCancelLink href={listPath} dirty={dirty} /><button type="submit" disabled={pending || noResources || noTypes} className={buttonStyles()}>{pending ? "Salvando..." : unavailabilityId ? "Salvar alterações" : "Registrar indisponibilidade"}</button></FormActions>
  </form>;
}

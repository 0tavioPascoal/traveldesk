"use client";

import { useActionState, useState } from "react";

import { CatalogFormFields } from "@/components/catalog/catalog-form-fields";
import { FormCancelLink } from "@/components/forms/form-cancel-link";
import { FormActions, FormSurface } from "@/components/forms/form-layout";
import { useFocusFirstInvalid } from "@/components/forms/use-focus-first-invalid";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
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
  const formRef = useFocusFirstInvalid(state.fieldErrors);
  const [dirty, setDirty] = useState(false);
  const category = resource === "technicians" ? "tecnicos" : "veiculos";
  const listPath = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/${category}`;
  return (
    <form ref={formRef} action={formAction} noValidate onChange={() => setDirty(true)} className="space-y-6">
      <FormSurface><div className="space-y-5"><CatalogFormFields idPrefix={`unavailability-type-${resource}`} values={state.values} errors={state.fieldErrors} pending={pending} namePlaceholder={resource === "technicians" ? "Ex.: Férias" : "Ex.: Manutenção preventiva"} descriptionHelp="Explique de forma breve quando este motivo deve ser utilizado. Máximo de 1.000 caracteres." activeHelp="Tipos ativos podem ser usados em novas indisponibilidades deste recurso." /></div></FormSurface>
      {state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}
      <FormActions>
        <FormCancelLink href={listPath} dirty={dirty} />
        <button type="submit" disabled={pending} className={buttonStyles()}>{pending ? "Salvando..." : typeId ? "Salvar alterações" : "Criar tipo"}</button>
      </FormActions>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";

import { CatalogFormFields } from "@/components/catalog/catalog-form-fields";
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
  const category = resource === "technicians" ? "tecnicos" : "veiculos";
  const listPath = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/${category}`;
  return (
    <form action={formAction} noValidate className="space-y-6">
      <CatalogFormFields idPrefix={`unavailability-type-${resource}`} values={state.values} errors={state.fieldErrors} pending={pending} namePlaceholder={resource === "technicians" ? "Ex.: Férias" : "Ex.: Manutenção preventiva"} descriptionHelp="Explique de forma breve quando este motivo deve ser utilizado. Máximo de 1.000 caracteres." activeHelp="Tipos ativos podem ser usados em novas indisponibilidades deste recurso." />
      {state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={listPath} className={buttonStyles({ variant: "secondary" })}>Cancelar</Link>
        <button type="submit" disabled={pending} className={buttonStyles()}>{pending ? "Salvando..." : typeId ? "Salvar alterações" : "Criar tipo"}</button>
      </div>
    </form>
  );
}

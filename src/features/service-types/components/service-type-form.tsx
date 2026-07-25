"use client";

import Link from "next/link";
import { useActionState } from "react";

import { CatalogFormFields } from "@/components/catalog/catalog-form-fields";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { createServiceTypeAction } from "@/features/service-types/actions/create-service-type-action";
import { updateServiceTypeAction } from "@/features/service-types/actions/update-service-type-action";
import type {
  ServiceTypeActionState,
  ServiceTypeFormValues,
} from "@/features/service-types/types/service-type";

type ServiceTypeFormProps = {
  organizationSlug: string;
  initialValues: ServiceTypeFormValues;
  serviceTypeId?: string;
};

export function ServiceTypeForm({
  organizationSlug,
  initialValues,
  serviceTypeId,
}: ServiceTypeFormProps) {
  const action = serviceTypeId
    ? updateServiceTypeAction.bind(null, organizationSlug, serviceTypeId)
    : createServiceTypeAction.bind(null, organizationSlug);
  const initialState: ServiceTypeActionState = {
    status: "idle",
    fieldErrors: {},
    message: null,
    values: initialValues,
  };
  const [state, formAction, pending] = useActionState(action, initialState);
  const listPath = `/app/${organizationSlug}/cadastros/tipos-atendimento`;

  return (
    <form action={formAction} noValidate className="space-y-6">
      <CatalogFormFields idPrefix="service-type" values={state.values} errors={state.fieldErrors} pending={pending} namePlaceholder="Ex.: Implantação" descriptionHelp="Informe quando este tipo de atendimento deve ser utilizado. Máximo de 1.000 caracteres." activeHelp="Tipos ativos ficam disponíveis para classificar novos atendimentos." />

      {state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={listPath}
          className={buttonStyles({ variant: "secondary" })}
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className={buttonStyles()}
        >
          {pending ? "Salvando..." : serviceTypeId ? "Salvar alterações" : "Criar tipo de atendimento"}
        </button>
      </div>
    </form>
  );
}

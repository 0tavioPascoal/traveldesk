"use client";

import Link from "next/link";
import { useActionState } from "react";

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
  const nameError = state.fieldErrors.name?.[0];
  const descriptionError = state.fieldErrors.description?.[0];
  const activeError = state.fieldErrors.active?.[0];
  const listPath = `/app/${organizationSlug}/cadastros/tipos-atendimento`;

  return (
    <form action={formAction} noValidate className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-zinc-800">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          autoFocus
          disabled={pending}
          defaultValue={state.values.name}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? "name-error" : "name-help"}
          className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:bg-zinc-100 sm:text-sm"
        />
        <p id="name-help" className="text-xs text-zinc-500">
          Entre 2 e 120 caracteres. O nome deve ser único na organização.
        </p>
        {nameError ? (
          <p id="name-error" role="alert" className="text-sm text-red-700">
            {nameError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-800"
        >
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={1000}
          disabled={pending}
          defaultValue={state.values.description}
          aria-invalid={descriptionError ? true : undefined}
          aria-describedby={
            descriptionError ? "description-error" : "description-help"
          }
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:bg-zinc-100 sm:text-sm"
        />
        <p id="description-help" className="text-xs text-zinc-500">
          Opcional, com no máximo 1.000 caracteres.
        </p>
        {descriptionError ? (
          <p id="description-error" role="alert" className="text-sm text-red-700">
            {descriptionError}
          </p>
        ) : null}
      </div>

      <div>
        <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4">
          <input
            name="active"
            type="checkbox"
            defaultChecked={state.values.active}
            disabled={pending}
            aria-describedby={activeError ? "active-error" : "active-help"}
            className="mt-0.5 size-4 rounded border-zinc-300"
          />
          <span>
            <span className="block text-sm font-medium text-zinc-900">Ativo</span>
            <span id="active-help" className="mt-1 block text-xs text-zinc-500">
              Registros ativos ficam disponíveis para novas operações.
            </span>
          </span>
        </label>
        {activeError ? (
          <p id="active-error" role="alert" className="mt-2 text-sm text-red-700">
            {activeError}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={listPath}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar tipo de atendimento"}
        </button>
      </div>
    </form>
  );
}

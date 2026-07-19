"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createClientAction } from "@/features/clients/actions/create-client-action";
import { updateClientAction } from "@/features/clients/actions/update-client-action";
import type {
  ClientActionState,
  ClientFormValues,
} from "@/features/clients/types/client";

type ClientFormProps = {
  organizationSlug: string;
  initialValues: ClientFormValues;
  clientId?: string;
};

const inputClassName =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:bg-zinc-100 sm:text-sm";

export function ClientForm({
  organizationSlug,
  initialValues,
  clientId,
}: ClientFormProps) {
  const action = clientId
    ? updateClientAction.bind(null, organizationSlug, clientId)
    : createClientAction.bind(null, organizationSlug);
  const initialState: ClientActionState = {
    status: "idle",
    fieldErrors: {},
    message: null,
    values: initialValues,
  };
  const [state, formAction, pending] = useActionState(action, initialState);
  const cancelPath = clientId
    ? `/app/${organizationSlug}/cadastros/clientes/${clientId}`
    : `/app/${organizationSlug}/cadastros/clientes`;

  return (
    <form action={formAction} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="legalName" className="block text-sm font-medium text-zinc-800">
            Razão social
          </label>
          <input
            id="legalName"
            name="legalName"
            required
            minLength={2}
            maxLength={200}
            autoFocus
            disabled={pending}
            defaultValue={state.values.legalName}
            aria-invalid={state.fieldErrors.legalName ? true : undefined}
            aria-describedby={
              state.fieldErrors.legalName ? "legal-name-error" : undefined
            }
            className={inputClassName}
          />
          {state.fieldErrors.legalName?.[0] ? (
            <p id="legal-name-error" role="alert" className="text-sm text-red-700">
              {state.fieldErrors.legalName[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="tradeName" className="block text-sm font-medium text-zinc-800">
            Nome fantasia
          </label>
          <input
            id="tradeName"
            name="tradeName"
            maxLength={200}
            disabled={pending}
            defaultValue={state.values.tradeName}
            aria-invalid={state.fieldErrors.tradeName ? true : undefined}
            aria-describedby={
              state.fieldErrors.tradeName ? "trade-name-error" : undefined
            }
            className={inputClassName}
          />
          {state.fieldErrors.tradeName?.[0] ? (
            <p id="trade-name-error" role="alert" className="text-sm text-red-700">
              {state.fieldErrors.tradeName[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="taxId" className="block text-sm font-medium text-zinc-800">
            CNPJ
          </label>
          <input
            id="taxId"
            name="taxId"
            inputMode="numeric"
            autoComplete="off"
            placeholder="00.000.000/0000-00"
            disabled={pending}
            defaultValue={state.values.taxId}
            aria-invalid={state.fieldErrors.taxId ? true : undefined}
            aria-describedby={state.fieldErrors.taxId ? "tax-id-error" : undefined}
            className={inputClassName}
          />
          {state.fieldErrors.taxId?.[0] ? (
            <p id="tax-id-error" role="alert" className="text-sm text-red-700">
              {state.fieldErrors.taxId[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="segment" className="block text-sm font-medium text-zinc-800">
            Segmento
          </label>
          <input
            id="segment"
            name="segment"
            maxLength={120}
            disabled={pending}
            defaultValue={state.values.segment}
            aria-invalid={state.fieldErrors.segment ? true : undefined}
            aria-describedby={
              state.fieldErrors.segment ? "segment-error" : undefined
            }
            className={inputClassName}
          />
          {state.fieldErrors.segment?.[0] ? (
            <p id="segment-error" role="alert" className="text-sm text-red-700">
              {state.fieldErrors.segment[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-zinc-800">
            Observações
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            maxLength={2000}
            disabled={pending}
            defaultValue={state.values.notes}
            aria-invalid={state.fieldErrors.notes ? true : undefined}
            aria-describedby={state.fieldErrors.notes ? "notes-error" : undefined}
            className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:bg-zinc-100 sm:text-sm"
          />
          {state.fieldErrors.notes?.[0] ? (
            <p id="notes-error" role="alert" className="text-sm text-red-700">
              {state.fieldErrors.notes[0]}
            </p>
          ) : null}
        </div>
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
          href={cancelPath}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar cliente"}
        </button>
      </div>
    </form>
  );
}

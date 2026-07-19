"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createClientUnitAction } from "@/features/clients/actions/create-client-unit-action";
import { updateClientUnitAction } from "@/features/clients/actions/update-client-unit-action";
import type {
  ClientUnitActionState,
  ClientUnitFormValues,
} from "@/features/clients/types/client";

type ClientUnitFormProps = {
  organizationSlug: string;
  clientId: string;
  clientName: string;
  initialValues: ClientUnitFormValues;
  unitId?: string;
};

const states = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
  "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO",
] as const;

const inputClassName =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:bg-zinc-100 sm:text-sm";

export function ClientUnitForm({
  organizationSlug,
  clientId,
  clientName,
  initialValues,
  unitId,
}: ClientUnitFormProps) {
  const action = unitId
    ? updateClientUnitAction.bind(null, organizationSlug, clientId, unitId)
    : createClientUnitAction.bind(null, organizationSlug, clientId);
  const initialState: ClientUnitActionState = {
    status: "idle",
    fieldErrors: {},
    message: null,
    values: initialValues,
  };
  const [state, formAction, pending] = useActionState(action, initialState);
  const detailPath = `/app/${organizationSlug}/cadastros/clientes/${clientId}`;

  const error = (field: keyof ClientUnitFormValues) =>
    state.fieldErrors[field]?.[0];

  return (
    <form action={formAction} noValidate className="space-y-8">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Cliente
        </p>
        <p className="mt-1 font-semibold text-zinc-950">{clientName}</p>
        <p className="mt-1 text-xs text-zinc-500">
          O vínculo não pode ser alterado após o cadastro.
        </p>
      </div>

      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-zinc-950">
          Identificação
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-zinc-800">
              Nome da unidade
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={160}
              autoFocus
              disabled={pending}
              defaultValue={state.values.name}
              aria-invalid={error("name") ? true : undefined}
              aria-describedby={error("name") ? "name-error" : undefined}
              className={inputClassName}
            />
            {error("name") ? <p id="name-error" role="alert" className="text-sm text-red-700">{error("name")}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="taxId" className="block text-sm font-medium text-zinc-800">CNPJ</label>
            <input id="taxId" name="taxId" inputMode="numeric" placeholder="00.000.000/0000-00" disabled={pending} defaultValue={state.values.taxId} aria-invalid={error("taxId") ? true : undefined} aria-describedby={error("taxId") ? "tax-id-error" : undefined} className={inputClassName} />
            {error("taxId") ? <p id="tax-id-error" role="alert" className="text-sm text-red-700">{error("taxId")}</p> : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-zinc-950">Endereço</legend>
        <div className="grid gap-5 sm:grid-cols-6">
          <div className="space-y-2 sm:col-span-4">
            <label htmlFor="addressLine" className="block text-sm font-medium text-zinc-800">Logradouro</label>
            <input id="addressLine" name="addressLine" maxLength={200} disabled={pending} defaultValue={state.values.addressLine} aria-invalid={error("addressLine") ? true : undefined} aria-describedby={error("addressLine") ? "address-line-error" : undefined} className={inputClassName} />
            {error("addressLine") ? <p id="address-line-error" role="alert" className="text-sm text-red-700">{error("addressLine")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="addressNumber" className="block text-sm font-medium text-zinc-800">Número</label>
            <input id="addressNumber" name="addressNumber" maxLength={30} disabled={pending} defaultValue={state.values.addressNumber} aria-invalid={error("addressNumber") ? true : undefined} aria-describedby={error("addressNumber") ? "address-number-error" : undefined} className={inputClassName} />
            {error("addressNumber") ? <p id="address-number-error" role="alert" className="text-sm text-red-700">{error("addressNumber")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-3">
            <label htmlFor="addressComplement" className="block text-sm font-medium text-zinc-800">Complemento</label>
            <input id="addressComplement" name="addressComplement" maxLength={120} disabled={pending} defaultValue={state.values.addressComplement} aria-invalid={error("addressComplement") ? true : undefined} aria-describedby={error("addressComplement") ? "address-complement-error" : undefined} className={inputClassName} />
            {error("addressComplement") ? <p id="address-complement-error" role="alert" className="text-sm text-red-700">{error("addressComplement")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-3">
            <label htmlFor="district" className="block text-sm font-medium text-zinc-800">Bairro</label>
            <input id="district" name="district" maxLength={120} disabled={pending} defaultValue={state.values.district} aria-invalid={error("district") ? true : undefined} aria-describedby={error("district") ? "district-error" : undefined} className={inputClassName} />
            {error("district") ? <p id="district-error" role="alert" className="text-sm text-red-700">{error("district")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-3">
            <label htmlFor="city" className="block text-sm font-medium text-zinc-800">Cidade</label>
            <input id="city" name="city" required maxLength={120} disabled={pending} defaultValue={state.values.city} aria-invalid={error("city") ? true : undefined} aria-describedby={error("city") ? "city-error" : undefined} className={inputClassName} />
            {error("city") ? <p id="city-error" role="alert" className="text-sm text-red-700">{error("city")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-1">
            <label htmlFor="state" className="block text-sm font-medium text-zinc-800">UF</label>
            <select id="state" name="state" required disabled={pending} defaultValue={state.values.state} aria-invalid={error("state") ? true : undefined} aria-describedby={error("state") ? "state-error" : undefined} className={inputClassName}>
              <option value="">Selecione</option>
              {states.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
            {error("state") ? <p id="state-error" role="alert" className="text-sm text-red-700">{error("state")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="postalCode" className="block text-sm font-medium text-zinc-800">CEP</label>
            <input id="postalCode" name="postalCode" inputMode="numeric" placeholder="00000-000" disabled={pending} defaultValue={state.values.postalCode} aria-invalid={error("postalCode") ? true : undefined} aria-describedby={error("postalCode") ? "postal-code-error" : undefined} className={inputClassName} />
            {error("postalCode") ? <p id="postal-code-error" role="alert" className="text-sm text-red-700">{error("postalCode")}</p> : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-zinc-950">Contato principal</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="contactName" className="block text-sm font-medium text-zinc-800">Nome</label>
            <input id="contactName" name="contactName" maxLength={160} disabled={pending} defaultValue={state.values.contactName} aria-invalid={error("contactName") ? true : undefined} aria-describedby={error("contactName") ? "contact-name-error" : undefined} className={inputClassName} />
            {error("contactName") ? <p id="contact-name-error" role="alert" className="text-sm text-red-700">{error("contactName")}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="contactEmail" className="block text-sm font-medium text-zinc-800">E-mail</label>
            <input id="contactEmail" name="contactEmail" type="email" maxLength={254} disabled={pending} defaultValue={state.values.contactEmail} aria-invalid={error("contactEmail") ? true : undefined} aria-describedby={error("contactEmail") ? "contact-email-error" : undefined} className={inputClassName} />
            {error("contactEmail") ? <p id="contact-email-error" role="alert" className="text-sm text-red-700">{error("contactEmail")}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="contactPhone" className="block text-sm font-medium text-zinc-800">Telefone</label>
            <input id="contactPhone" name="contactPhone" type="tel" inputMode="tel" placeholder="(00) 00000-0000" disabled={pending} defaultValue={state.values.contactPhone} aria-invalid={error("contactPhone") ? true : undefined} aria-describedby={error("contactPhone") ? "contact-phone-error" : undefined} className={inputClassName} />
            {error("contactPhone") ? <p id="contact-phone-error" role="alert" className="text-sm text-red-700">{error("contactPhone")}</p> : null}
          </div>
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="accessInstructions" className="block text-sm font-medium text-zinc-800">Instruções de acesso</label>
          <textarea id="accessInstructions" name="accessInstructions" rows={5} maxLength={2000} disabled={pending} defaultValue={state.values.accessInstructions} aria-invalid={error("accessInstructions") ? true : undefined} aria-describedby={error("accessInstructions") ? "access-instructions-error" : undefined} className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:bg-zinc-100" />
          {error("accessInstructions") ? <p id="access-instructions-error" role="alert" className="text-sm text-red-700">{error("accessInstructions")}</p> : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-zinc-800">Observações</label>
          <textarea id="notes" name="notes" rows={5} maxLength={2000} disabled={pending} defaultValue={state.values.notes} aria-invalid={error("notes") ? true : undefined} aria-describedby={error("notes") ? "notes-error" : undefined} className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:bg-zinc-100" />
          {error("notes") ? <p id="notes-error" role="alert" className="text-sm text-red-700">{error("notes")}</p> : null}
        </div>
      </div>

      {state.message ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={detailPath} className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">Cancelar</Link>
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Salvando..." : "Salvar unidade"}</button>
      </div>
    </form>
  );
}

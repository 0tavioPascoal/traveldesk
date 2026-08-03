"use client";

import { Building2, Save } from "lucide-react";
import { useActionState, useState } from "react";

import {
  FormActions,
  formControlClassName,
  formSectionClassName,
  formTextareaClassName,
} from "@/components/forms/form-layout";
import { useFocusFirstInvalid } from "@/components/forms/use-focus-first-invalid";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { createClientUnitAction } from "@/features/clients/actions/create-client-unit-action";
import { updateClientUnitAction } from "@/features/clients/actions/update-client-unit-action";
import { ClientFormCancel } from "@/features/clients/components/client-form-cancel";
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

const inputClassName = formControlClassName;
const textareaClassName = formTextareaClassName;

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
  const formRef = useFocusFirstInvalid(state.fieldErrors);
  const [dirty, setDirty] = useState(false);
  const detailPath = `/app/${organizationSlug}/cadastros/clientes/${clientId}`;

  const error = (field: keyof ClientUnitFormValues) =>
    state.fieldErrors[field]?.[0];

  return (
    <form ref={formRef} action={formAction} noValidate onChange={() => setDirty(true)} className="space-y-6">
      {state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}

      <div className="rounded-2xl border border-border bg-accent/45 px-4 py-4 sm:px-5">
        <div className="flex gap-3">
          <Building2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Cliente
          </p>
        <p className="mt-1 font-semibold text-foreground">{clientName}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          O vínculo não pode ser alterado após o cadastro.
        </p></div></div>
      </div>

      <fieldset className={`${formSectionClassName} space-y-5`}>
        <legend className="px-1 text-lg font-semibold text-foreground">
          Identificação
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Nome da unidade <span className="text-destructive" aria-hidden="true">*</span><span className="sr-only"> (obrigatório)</span>
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
            {error("name") ? <p id="name-error" role="alert" className="text-sm text-destructive">{error("name")}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="taxId" className="block text-sm font-medium text-foreground">CNPJ</label>
            <input id="taxId" name="taxId" inputMode="numeric" placeholder="00.000.000/0000-00" disabled={pending} defaultValue={state.values.taxId} aria-invalid={error("taxId") ? true : undefined} aria-describedby={error("taxId") ? "tax-id-error" : undefined} className={inputClassName} />
            {error("taxId") ? <p id="tax-id-error" role="alert" className="text-sm text-destructive">{error("taxId")}</p> : null}
          </div>
        </div>
      </fieldset>

      <fieldset className={`${formSectionClassName} space-y-5`}>
        <legend className="px-1 text-lg font-semibold text-foreground">Endereço</legend>
        <div className="grid gap-5 sm:grid-cols-6">
          <div className="space-y-2 sm:col-span-4">
            <label htmlFor="addressLine" className="block text-sm font-medium text-foreground">Logradouro</label>
            <input id="addressLine" name="addressLine" maxLength={200} disabled={pending} defaultValue={state.values.addressLine} aria-invalid={error("addressLine") ? true : undefined} aria-describedby={error("addressLine") ? "address-line-error" : undefined} className={inputClassName} />
            {error("addressLine") ? <p id="address-line-error" role="alert" className="text-sm text-destructive">{error("addressLine")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="addressNumber" className="block text-sm font-medium text-foreground">Número</label>
            <input id="addressNumber" name="addressNumber" maxLength={30} disabled={pending} defaultValue={state.values.addressNumber} aria-invalid={error("addressNumber") ? true : undefined} aria-describedby={error("addressNumber") ? "address-number-error" : undefined} className={inputClassName} />
            {error("addressNumber") ? <p id="address-number-error" role="alert" className="text-sm text-destructive">{error("addressNumber")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-3">
            <label htmlFor="addressComplement" className="block text-sm font-medium text-foreground">Complemento</label>
            <input id="addressComplement" name="addressComplement" maxLength={120} disabled={pending} defaultValue={state.values.addressComplement} aria-invalid={error("addressComplement") ? true : undefined} aria-describedby={error("addressComplement") ? "address-complement-error" : undefined} className={inputClassName} />
            {error("addressComplement") ? <p id="address-complement-error" role="alert" className="text-sm text-destructive">{error("addressComplement")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-3">
            <label htmlFor="district" className="block text-sm font-medium text-foreground">Bairro</label>
            <input id="district" name="district" maxLength={120} disabled={pending} defaultValue={state.values.district} aria-invalid={error("district") ? true : undefined} aria-describedby={error("district") ? "district-error" : undefined} className={inputClassName} />
            {error("district") ? <p id="district-error" role="alert" className="text-sm text-destructive">{error("district")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-3">
            <label htmlFor="city" className="block text-sm font-medium text-foreground">Cidade <span className="text-destructive" aria-hidden="true">*</span><span className="sr-only"> (obrigatório)</span></label>
            <input id="city" name="city" required maxLength={120} disabled={pending} defaultValue={state.values.city} aria-invalid={error("city") ? true : undefined} aria-describedby={error("city") ? "city-error" : undefined} className={inputClassName} />
            {error("city") ? <p id="city-error" role="alert" className="text-sm text-destructive">{error("city")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-1">
            <label htmlFor="state" className="block text-sm font-medium text-foreground">UF <span className="text-destructive" aria-hidden="true">*</span><span className="sr-only"> (obrigatório)</span></label>
            <select id="state" name="state" required disabled={pending} defaultValue={state.values.state} aria-invalid={error("state") ? true : undefined} aria-describedby={error("state") ? "state-error" : undefined} className={inputClassName}>
              <option value="">Selecione</option>
              {states.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
            {error("state") ? <p id="state-error" role="alert" className="text-sm text-destructive">{error("state")}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="postalCode" className="block text-sm font-medium text-foreground">CEP</label>
            <input id="postalCode" name="postalCode" inputMode="numeric" placeholder="00000-000" disabled={pending} defaultValue={state.values.postalCode} aria-invalid={error("postalCode") ? true : undefined} aria-describedby={error("postalCode") ? "postal-code-error" : undefined} className={inputClassName} />
            {error("postalCode") ? <p id="postal-code-error" role="alert" className="text-sm text-destructive">{error("postalCode")}</p> : null}
          </div>
        </div>
      </fieldset>

      <fieldset className={`${formSectionClassName} space-y-5`}>
        <legend className="px-1 text-lg font-semibold text-foreground">Contato principal</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="contactName" className="block text-sm font-medium text-foreground">Nome</label>
            <input id="contactName" name="contactName" maxLength={160} disabled={pending} defaultValue={state.values.contactName} aria-invalid={error("contactName") ? true : undefined} aria-describedby={error("contactName") ? "contact-name-error" : undefined} className={inputClassName} />
            {error("contactName") ? <p id="contact-name-error" role="alert" className="text-sm text-destructive">{error("contactName")}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="contactEmail" className="block text-sm font-medium text-foreground">E-mail</label>
            <input id="contactEmail" name="contactEmail" type="email" maxLength={254} disabled={pending} defaultValue={state.values.contactEmail} aria-invalid={error("contactEmail") ? true : undefined} aria-describedby={error("contactEmail") ? "contact-email-error" : undefined} className={inputClassName} />
            {error("contactEmail") ? <p id="contact-email-error" role="alert" className="text-sm text-destructive">{error("contactEmail")}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="contactPhone" className="block text-sm font-medium text-foreground">Telefone</label>
            <input id="contactPhone" name="contactPhone" type="tel" inputMode="tel" placeholder="(00) 00000-0000" disabled={pending} defaultValue={state.values.contactPhone} aria-invalid={error("contactPhone") ? true : undefined} aria-describedby={error("contactPhone") ? "contact-phone-error" : undefined} className={inputClassName} />
            {error("contactPhone") ? <p id="contact-phone-error" role="alert" className="text-sm text-destructive">{error("contactPhone")}</p> : null}
          </div>
        </div>
      </fieldset>

      <fieldset className={formSectionClassName}>
        <legend className="px-1 text-lg font-semibold text-foreground">Orientações e observações</legend>
      <div className="mt-1 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="accessInstructions" className="block text-sm font-medium text-foreground">Instruções de acesso</label>
          <textarea id="accessInstructions" name="accessInstructions" rows={5} maxLength={2000} disabled={pending} defaultValue={state.values.accessInstructions} aria-invalid={error("accessInstructions") ? true : undefined} aria-describedby={error("accessInstructions") ? "access-instructions-error" : undefined} className={textareaClassName} />
          {error("accessInstructions") ? <p id="access-instructions-error" role="alert" className="text-sm text-destructive">{error("accessInstructions")}</p> : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-foreground">Observações</label>
          <textarea id="notes" name="notes" rows={5} maxLength={2000} disabled={pending} defaultValue={state.values.notes} aria-invalid={error("notes") ? true : undefined} aria-describedby={error("notes") ? "notes-error" : undefined} className={textareaClassName} />
          {error("notes") ? <p id="notes-error" role="alert" className="text-sm text-destructive">{error("notes")}</p> : null}
        </div>
      </div>
      </fieldset>

      <FormActions>
        <ClientFormCancel href={detailPath} dirty={dirty} />
        <button type="submit" disabled={pending} className={buttonStyles()}><Save aria-hidden="true" className="size-4" />{pending ? "Salvando..." : unitId ? "Salvar alterações" : "Criar unidade"}</button>
      </FormActions>
    </form>
  );
}

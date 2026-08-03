"use client";

import { Building2, FileText } from "lucide-react";
import { useActionState, useState } from "react";

import {
  FormActions,
  formControlClassName,
  formSectionClassName,
  formTextareaClassName,
} from "@/components/forms/form-layout";
import { useFocusFirstInvalid } from "@/components/forms/use-focus-first-invalid";
import { SectionHeader } from "@/components/page/section-header";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { createClientAction } from "@/features/clients/actions/create-client-action";
import { updateClientAction } from "@/features/clients/actions/update-client-action";
import { ClientFormCancel } from "@/features/clients/components/client-form-cancel";
import type { ClientActionState, ClientFormValues } from "@/features/clients/types/client";

type ClientFormProps = { organizationSlug: string; initialValues: ClientFormValues; clientId?: string };

const inputClassName = formControlClassName;
const textareaClassName = formTextareaClassName;

export function ClientForm({ organizationSlug, initialValues, clientId }: ClientFormProps) {
  const action = clientId ? updateClientAction.bind(null, organizationSlug, clientId) : createClientAction.bind(null, organizationSlug);
  const initialState: ClientActionState = { status: "idle", fieldErrors: {}, message: null, values: initialValues };
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useFocusFirstInvalid(state.fieldErrors);
  const [dirty, setDirty] = useState(false);
  const cancelPath = clientId ? `/app/${organizationSlug}/cadastros/clientes/${clientId}` : `/app/${organizationSlug}/cadastros/clientes`;
  const error = (field: keyof ClientFormValues) => state.fieldErrors[field]?.[0];

  return (
    <form ref={formRef} action={formAction} noValidate onChange={() => setDirty(true)} className="space-y-6">
      {state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}

      <section aria-labelledby="client-main-title" className={formSectionClassName}>
        <SectionHeader id="client-main-title" title="Informações principais" description="Identificação cadastral utilizada em viagens e unidades." />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="legalName" className="text-sm font-medium text-foreground">Razão social <span className="text-destructive" aria-hidden="true">*</span><span className="sr-only"> (obrigatório)</span></label>
            <input id="legalName" name="legalName" required minLength={2} maxLength={200} autoFocus disabled={pending} defaultValue={state.values.legalName} aria-invalid={Boolean(error("legalName"))} aria-describedby={error("legalName") ? "legal-name-error" : "legal-name-help"} className={inputClassName} />
            <p id="legal-name-help" className="text-xs text-muted-foreground">Nome jurídico utilizado na identificação do cliente.</p>
            {error("legalName") ? <p id="legal-name-error" role="alert" className="text-sm text-destructive">{error("legalName")}</p> : null}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tradeName" className="text-sm font-medium text-foreground">Nome fantasia</label>
            <input id="tradeName" name="tradeName" maxLength={200} disabled={pending} defaultValue={state.values.tradeName} aria-invalid={Boolean(error("tradeName"))} aria-describedby={error("tradeName") ? "trade-name-error" : undefined} className={inputClassName} />
            {error("tradeName") ? <p id="trade-name-error" role="alert" className="text-sm text-destructive">{error("tradeName")}</p> : null}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="taxId" className="text-sm font-medium text-foreground">CNPJ</label>
            <input id="taxId" name="taxId" inputMode="numeric" autoComplete="off" placeholder="00.000.000/0000-00" disabled={pending} defaultValue={state.values.taxId} aria-invalid={Boolean(error("taxId"))} aria-describedby={error("taxId") ? "tax-id-error" : undefined} className={inputClassName} />
            {error("taxId") ? <p id="tax-id-error" role="alert" className="text-sm text-destructive">{error("taxId")}</p> : null}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="segment" className="text-sm font-medium text-foreground">Segmento</label>
            <input id="segment" name="segment" maxLength={120} disabled={pending} defaultValue={state.values.segment} placeholder="Ex.: Logística, indústria ou varejo" aria-invalid={Boolean(error("segment"))} aria-describedby={error("segment") ? "segment-error" : undefined} className={inputClassName} />
            {error("segment") ? <p id="segment-error" role="alert" className="text-sm text-destructive">{error("segment")}</p> : null}
          </div>
        </div>
      </section>

      <section aria-labelledby="client-notes-title" className={formSectionClassName}>
        <SectionHeader id="client-notes-title" title="Observações" description="Informações adicionais úteis para a coordenação." />
        <div className="mt-6 space-y-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-foreground">Observações internas</label>
          <textarea id="notes" name="notes" rows={6} maxLength={2000} disabled={pending} defaultValue={state.values.notes} placeholder="Registre contexto relevante para o atendimento..." aria-invalid={Boolean(error("notes"))} aria-describedby={error("notes") ? "notes-error" : "notes-help"} className={textareaClassName} />
          <p id="notes-help" className="text-xs text-muted-foreground">Até 2.000 caracteres.</p>
          {error("notes") ? <p id="notes-error" role="alert" className="text-sm text-destructive">{error("notes")}</p> : null}
        </div>
      </section>

      <aside className="rounded-2xl border border-border bg-muted/45 p-4 sm:p-5" aria-label="Resumo do cadastro">
        <div className="flex gap-3"><Building2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" /><div><h2 className="font-semibold text-foreground">Após salvar</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">O cliente será criado ativo. Endereço e contato são cadastrados no contexto de cada unidade.</p></div></div>
      </aside>

      <FormActions>
        <ClientFormCancel href={cancelPath} dirty={dirty} />
        <button type="submit" disabled={pending} className={buttonStyles()}><FileText aria-hidden="true" className="size-4" />{pending ? "Salvando..." : clientId ? "Salvar alterações" : "Criar cliente"}</button>
      </FormActions>
    </form>
  );
}

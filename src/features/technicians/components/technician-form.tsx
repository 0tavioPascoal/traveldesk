"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { SectionHeader } from "@/components/page/section-header";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { createTechnicianAction } from "@/features/technicians/actions/create-technician-action";
import { updateTechnicianAction } from "@/features/technicians/actions/update-technician-action";
import { TechnicianSkillFields } from "@/features/technicians/components/technician-skill-fields";
import type { TechnicianActionState, TechnicianFormValues } from "@/features/technicians/types/technician";

type Props = { organizationSlug: string; initialValues: TechnicianFormValues; skillOptions: Array<{ id: string; name: string; active: boolean }>; technicianId?: string };
const control = "h-11 w-full rounded-lg border border-input bg-card px-3 text-base text-card-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:bg-muted disabled:text-muted-foreground sm:text-sm";
const states = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export function TechnicianForm({ organizationSlug, initialValues, skillOptions, technicianId }: Props) {
  const action = technicianId ? updateTechnicianAction.bind(null, organizationSlug, technicianId) : createTechnicianAction.bind(null, organizationSlug);
  const [state, formAction, pending] = useActionState(action, { status: "idle", fieldErrors: {}, message: null, values: initialValues } satisfies TechnicianActionState);
  const [canDrive, setCanDrive] = useState(state.values.canDriveCompanyVehicle);
  const [notesLength, setNotesLength] = useState(state.values.notes.length);
  const cancel = technicianId ? `/app/${organizationSlug}/cadastros/tecnicos/${technicianId}` : `/app/${organizationSlug}/cadastros/tecnicos`;
  const field = (name: keyof TechnicianFormValues, label: string, attributes: React.InputHTMLAttributes<HTMLInputElement> = {}) => {
    const error = state.fieldErrors[name]?.[0];
    const errorId = `${name}-error`;
    return <div className="space-y-1.5"><label htmlFor={name} className="block text-sm font-medium text-foreground">{label}</label><input id={name} name={name} disabled={pending} defaultValue={String(state.values[name] ?? "")} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} className={control} {...attributes} />{error ? <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p> : null}</div>;
  };

  return <form action={formAction} noValidate className="space-y-6">
    <section aria-labelledby="personal-data-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6"><SectionHeader id="personal-data-title" title="Informações pessoais" description="Dados de identificação e contato do técnico operacional." /><div className="mt-6 grid gap-5 sm:grid-cols-2"><div className="sm:col-span-2">{field("name", "Nome", { required: true, minLength: 2, maxLength: 160, autoFocus: true, autoComplete: "name" })}</div>{field("document", "CPF", { inputMode: "numeric", placeholder: "000.000.000-00" })}{field("email", "E-mail", { type: "email", maxLength: 254, autoComplete: "email" })}{field("phone", "Telefone", { inputMode: "tel", autoComplete: "tel", placeholder: "(00) 00000-0000" })}</div><p className="mt-4 text-xs leading-5 text-muted-foreground">O e-mail do técnico não cria nem vincula automaticamente um usuário de acesso.</p></section>

    <section aria-labelledby="professional-data-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6"><SectionHeader id="professional-data-title" title="Dados profissionais" description="Informações usadas para identificar a função e as competências do técnico." /><div className="mt-6">{field("jobTitle", "Cargo ou função", { maxLength: 120 })}</div></section>

    <section aria-labelledby="base-location-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6"><SectionHeader id="base-location-title" title="Localidade-base" description="Referência operacional usada no planejamento das viagens." /><div className="mt-6 grid gap-5 sm:grid-cols-[1fr_10rem]">{field("baseCity", "Cidade-base", { required: true, maxLength: 120 })}<div className="space-y-1.5"><label htmlFor="baseState" className="block text-sm font-medium text-foreground">Estado-base</label><select id="baseState" name="baseState" required disabled={pending} defaultValue={state.values.baseState} aria-invalid={state.fieldErrors.baseState?.[0] ? true : undefined} aria-describedby={state.fieldErrors.baseState?.[0] ? "baseState-error" : undefined} className={control}><option value="">UF</option>{states.map((uf) => <option key={uf}>{uf}</option>)}</select>{state.fieldErrors.baseState?.[0] ? <p id="baseState-error" role="alert" className="text-sm text-destructive">{state.fieldErrors.baseState[0]}</p> : null}</div></div></section>

    <div id="especialidades" className="scroll-mt-6"><TechnicianSkillFields options={skillOptions} initialValues={state.values.skillAssignments} disabled={pending} error={state.fieldErrors.skillAssignments?.[0]} /></div>

    <section aria-labelledby="driver-license-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6"><SectionHeader id="driver-license-title" title="Habilitação" description="Autorização para conduzir veículos da empresa e dados da CNH." /><label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/50 p-4"><input type="checkbox" name="canDriveCompanyVehicle" checked={canDrive} disabled={pending} aria-controls="driver-license-fields" aria-expanded={canDrive} onChange={(event) => setCanDrive(event.target.checked)} className="mt-0.5 size-4" /><span><span className="block text-sm font-semibold text-foreground">Autorizado a dirigir veículos da empresa</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Quando autorizado, número, categoria e validade da CNH são obrigatórios.</span></span></label><div id="driver-license-fields" aria-hidden={!canDrive} className={`mt-5 grid gap-5 sm:grid-cols-3 ${canDrive ? "" : "hidden"}`}>{field("driverLicenseNumber", "Número da CNH", { inputMode: "numeric", maxLength: 14, required: canDrive })}<div className="space-y-1.5"><label htmlFor="driverLicenseCategory" className="block text-sm font-medium text-foreground">Categoria</label><select id="driverLicenseCategory" name="driverLicenseCategory" disabled={pending} required={canDrive} defaultValue={state.values.driverLicenseCategory} aria-invalid={state.fieldErrors.driverLicenseCategory?.[0] ? true : undefined} aria-describedby={state.fieldErrors.driverLicenseCategory?.[0] ? "driverLicenseCategory-error" : undefined} className={control}><option value="">Selecione</option>{["A","B","C","D","E","AB","AC","AD","AE"].map((category) => <option key={category}>{category}</option>)}</select>{state.fieldErrors.driverLicenseCategory?.[0] ? <p id="driverLicenseCategory-error" role="alert" className="text-sm text-destructive">{state.fieldErrors.driverLicenseCategory[0]}</p> : null}</div>{field("driverLicenseExpiresAt", "Data de validade", { type: "date", required: canDrive })}</div>{!canDrive ? <p className="mt-4 text-sm text-muted-foreground">Os dados de CNH existentes são preservados ao retirar a autorização, conforme o comportamento atual do domínio.</p> : null}</section>

    <section aria-labelledby="notes-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6"><SectionHeader id="notes-title" title="Observações" description="Informações profissionais adicionais relevantes ao planejamento." /><div className="mt-6 space-y-1.5"><label htmlFor="notes" className="sr-only">Observações</label><textarea id="notes" name="notes" rows={5} maxLength={2000} disabled={pending} defaultValue={state.values.notes} onChange={(event) => setNotesLength(event.target.value.length)} aria-invalid={state.fieldErrors.notes?.[0] ? true : undefined} aria-describedby="notes-help" className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 text-card-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" /><div id="notes-help" className="flex justify-between gap-4 text-xs text-muted-foreground"><span>As quebras de linha serão preservadas.</span><span>{notesLength}/2.000</span></div>{state.fieldErrors.notes?.[0] ? <p role="alert" className="text-sm text-destructive">{state.fieldErrors.notes[0]}</p> : null}</div></section>

    {state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}
    <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end"><Link href={cancel} className={buttonStyles({ variant: "secondary" })}>Cancelar</Link><button type="submit" disabled={pending} className={buttonStyles()}>{pending ? "Salvando..." : technicianId ? "Salvar alterações" : "Criar técnico"}</button></div>
  </form>;
}

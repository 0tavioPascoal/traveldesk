"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createTechnicianAction } from "@/features/technicians/actions/create-technician-action";
import { updateTechnicianAction } from "@/features/technicians/actions/update-technician-action";
import { TechnicianSkillFields } from "@/features/technicians/components/technician-skill-fields";
import type { TechnicianActionState, TechnicianFormValues } from "@/features/technicians/types/technician";

type Props = { organizationSlug: string; initialValues: TechnicianFormValues; skillOptions: Array<{ id: string; name: string; active: boolean }>; technicianId?: string };
const input = "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:bg-zinc-100 sm:text-sm";
const states = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export function TechnicianForm({ organizationSlug, initialValues, skillOptions, technicianId }: Props) {
  const action = technicianId ? updateTechnicianAction.bind(null, organizationSlug, technicianId) : createTechnicianAction.bind(null, organizationSlug);
  const [state, formAction, pending] = useActionState(action, { status: "idle", fieldErrors: {}, message: null, values: initialValues } satisfies TechnicianActionState);
  const cancel = technicianId ? `/app/${organizationSlug}/cadastros/tecnicos/${technicianId}` : `/app/${organizationSlug}/cadastros/tecnicos`;
  const field = (name: keyof TechnicianFormValues, label: string, attributes: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="space-y-2"><label htmlFor={name} className="block text-sm font-medium text-zinc-800">{label}</label><input id={name} name={name} disabled={pending} defaultValue={String(state.values[name] ?? "")} aria-invalid={state.fieldErrors[name] ? true : undefined} className={input} {...attributes} />{state.fieldErrors[name]?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors[name][0]}</p> : null}</div>
  );
  return (
    <form action={formAction} noValidate className="space-y-6">
      <fieldset className="grid gap-5 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2"><legend className="px-1 font-semibold text-zinc-950">Dados pessoais</legend>
        <div className="sm:col-span-2">{field("name", "Nome", { required: true, minLength: 2, maxLength: 160, autoFocus: true })}</div>
        {field("document", "CPF", { inputMode: "numeric", placeholder: "000.000.000-00" })}
        {field("email", "E-mail", { type: "email", maxLength: 254, autoComplete: "email" })}
        {field("phone", "Telefone", { inputMode: "tel", autoComplete: "tel", placeholder: "(00) 00000-0000" })}
        {field("jobTitle", "Cargo", { maxLength: 120 })}
      </fieldset>
      <fieldset className="grid gap-5 rounded-xl border border-zinc-200 p-4 sm:grid-cols-[1fr_10rem]"><legend className="px-1 font-semibold text-zinc-950">Base operacional</legend>
        {field("baseCity", "Cidade-base", { required: true, maxLength: 120 })}
        <div className="space-y-2"><label htmlFor="baseState" className="block text-sm font-medium text-zinc-800">Estado-base</label><select id="baseState" name="baseState" required disabled={pending} defaultValue={state.values.baseState} className={input}><option value="">UF</option>{states.map((uf) => <option key={uf}>{uf}</option>)}</select>{state.fieldErrors.baseState?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.baseState[0]}</p> : null}</div>
      </fieldset>
      <TechnicianSkillFields options={skillOptions} initialValues={state.values.skillAssignments} disabled={pending} error={state.fieldErrors.skillAssignments?.[0]} />
      <fieldset className="grid gap-5 rounded-xl border border-zinc-200 p-4 sm:grid-cols-3"><legend className="px-1 font-semibold text-zinc-950">Condução de veículo</legend>
        <label className="flex items-center gap-3 sm:col-span-3"><input type="checkbox" name="canDriveCompanyVehicle" defaultChecked={state.values.canDriveCompanyVehicle} disabled={pending} /><span className="text-sm font-medium text-zinc-800">Pode dirigir veículo da empresa</span></label>
        {field("driverLicenseNumber", "Número da CNH", { inputMode: "numeric", maxLength: 14 })}
        <div className="space-y-2"><label htmlFor="driverLicenseCategory" className="block text-sm font-medium text-zinc-800">Categoria</label><select id="driverLicenseCategory" name="driverLicenseCategory" disabled={pending} defaultValue={state.values.driverLicenseCategory} className={input}><option value="">Selecione</option>{["A","B","C","D","E","AB","AC","AD","AE"].map((category) => <option key={category}>{category}</option>)}</select>{state.fieldErrors.driverLicenseCategory?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.driverLicenseCategory[0]}</p> : null}</div>
        {field("driverLicenseExpiresAt", "Validade", { type: "date" })}
      </fieldset>
      <div className="space-y-2"><label htmlFor="notes" className="block text-sm font-medium text-zinc-800">Observações</label><textarea id="notes" name="notes" rows={5} maxLength={2000} disabled={pending} defaultValue={state.values.notes} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />{state.fieldErrors.notes?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.notes[0]}</p> : null}</div>
      {state.message ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={cancel} className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold">Cancelar</Link><button type="submit" disabled={pending} className="h-11 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Salvando..." : "Salvar técnico"}</button></div>
    </form>
  );
}

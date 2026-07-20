"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createVehicleAction } from "@/features/vehicles/actions/create-vehicle-action";
import { updateVehicleAction } from "@/features/vehicles/actions/update-vehicle-action";
import type { VehicleActionState, VehicleFormValues } from "@/features/vehicles/types/vehicle";

type Props = {
  organizationSlug: string;
  initialValues: VehicleFormValues;
  role: "admin" | "coordinator";
  currentMileage: number | null;
  vehicleId?: string;
};

const inputClass = "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:bg-zinc-100 sm:text-sm";
const states = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function maskPlate(value: string) {
  const normalized = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7);
  return /^[A-Z]{3}\d{1,4}$/.test(normalized) && normalized.length > 3
    ? `${normalized.slice(0, 3)}-${normalized.slice(3)}`
    : normalized;
}

export function VehicleForm({ organizationSlug, initialValues, role, currentMileage, vehicleId }: Props) {
  const action = vehicleId
    ? updateVehicleAction.bind(null, organizationSlug, vehicleId)
    : createVehicleAction.bind(null, organizationSlug);
  const [state, formAction, pending] = useActionState(action, {
    status: "idle", fieldErrors: {}, message: null, values: initialValues,
  } satisfies VehicleActionState);
  const cancelPath = vehicleId
    ? `/app/${organizationSlug}/cadastros/veiculos/${vehicleId}`
    : `/app/${organizationSlug}/cadastros/veiculos`;
  const field = (name: keyof VehicleFormValues, label: string, attributes: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-zinc-800">{label}</label>
      <input id={name} name={name} disabled={pending} defaultValue={String(state.values[name] ?? "")} aria-invalid={state.fieldErrors[name] ? true : undefined} className={inputClass} {...attributes} />
      {state.fieldErrors[name]?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors[name][0]}</p> : null}
    </div>
  );

  return <form action={formAction} noValidate className="space-y-6">
    <fieldset className="grid gap-5 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <legend className="px-1 font-semibold text-zinc-950">Identificação</legend>
      <div className="space-y-2"><label htmlFor="plate" className="block text-sm font-medium text-zinc-800">Placa</label><input id="plate" name="plate" required maxLength={8} autoFocus disabled={pending} defaultValue={maskPlate(state.values.plate)} onInput={(event) => { event.currentTarget.value = maskPlate(event.currentTarget.value); }} placeholder="ABC-1234" aria-invalid={state.fieldErrors.plate ? true : undefined} className={inputClass} />{state.fieldErrors.plate?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.plate[0]}</p> : null}</div>
      <div className="lg:col-span-2">{field("brand", "Marca", { required: true, maxLength: 80 })}</div>
      <div className="lg:col-span-2">{field("model", "Modelo", { required: true, maxLength: 120 })}</div>
      {field("manufactureYear", "Ano de fabricação", { type: "number", min: 1900, max: new Date().getFullYear() + 1 })}
      {field("modelYear", "Ano do modelo", { type: "number", min: 1900, max: new Date().getFullYear() + 1 })}
    </fieldset>

    <fieldset className="grid gap-5 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_10rem]">
      <legend className="px-1 font-semibold text-zinc-950">Capacidade e base</legend>
      <div>{field("passengerCapacity", "Capacidade total", { type: "number", required: true, min: 1, max: 99 })}<p className="mt-1 text-xs text-zinc-500">Inclui o motorista.</p></div>
      {field("baseCity", "Cidade-base", { required: true, maxLength: 120 })}
      <div className="space-y-2"><label htmlFor="baseState" className="block text-sm font-medium text-zinc-800">Estado-base</label><select id="baseState" name="baseState" required disabled={pending} defaultValue={state.values.baseState} className={inputClass}><option value="">UF</option>{states.map((stateCode) => <option key={stateCode}>{stateCode}</option>)}</select>{state.fieldErrors.baseState?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.baseState[0]}</p> : null}</div>
    </fieldset>

    <fieldset className="grid gap-5 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2">
      <legend className="px-1 font-semibold text-zinc-950">Controle operacional</legend>
      <div>{field("currentMileage", "Quilometragem atual", { type: "number", min: role === "coordinator" && currentMileage !== null ? currentMileage : 0, step: 1 })}<p className="mt-1 text-xs text-zinc-500">{role === "admin" ? "Reduções são tratadas como correção administrativa." : "A quilometragem registrada não pode ser reduzida."}</p></div>
      <div className="space-y-2"><label htmlFor="operationalStatus" className="block text-sm font-medium text-zinc-800">Condição operacional</label><select id="operationalStatus" name="operationalStatus" disabled={pending} defaultValue={state.values.operationalStatus} className={inputClass}><option value="available">Disponível</option><option value="maintenance">Em manutenção</option><option value="blocked">Bloqueado</option></select>{state.fieldErrors.operationalStatus?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.operationalStatus[0]}</p> : null}</div>
    </fieldset>

    <fieldset className="grid gap-5 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2">
      <legend className="px-1 font-semibold text-zinc-950">Documentação e manutenção</legend>
      {field("licensingExpiresAt", "Validade do licenciamento", { type: "date" })}
      {field("maintenanceDueAt", "Próxima manutenção", { type: "date" })}
    </fieldset>

    <div className="space-y-2"><label htmlFor="notes" className="block text-sm font-medium text-zinc-800">Observações</label><textarea id="notes" name="notes" rows={5} maxLength={2000} disabled={pending} defaultValue={state.values.notes} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" />{state.fieldErrors.notes?.[0] ? <p role="alert" className="text-sm text-red-700">{state.fieldErrors.notes[0]}</p> : null}</div>
    {state.message ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p> : null}
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={cancelPath} className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-800">Cancelar</Link><button type="submit" disabled={pending} className="h-11 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Salvando..." : "Salvar veículo"}</button></div>
  </form>;
}

import Link from "next/link";

import { VehicleActiveStateAction } from "@/features/vehicles/components/vehicle-active-state-action";
import { VehicleStatusAction } from "@/features/vehicles/components/vehicle-status-action";
import type { Vehicle } from "@/features/vehicles/types/vehicle";

function displayDate(value: string | null) { return value ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "—"; }
function plate(value: string) { return value.replace(/^([A-Z]{3})([0-9]{4})$/, "$1-$2"); }

export function VehicleDetails({ organizationSlug, vehicle, timezone }: { organizationSlug: string; vehicle: Vehicle; timezone: string }) {
  const updatedAt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone }).format(new Date(vehicle.updated_at));
  const rows = [
    ["Placa", plate(vehicle.plate)], ["Marca", vehicle.brand], ["Modelo", vehicle.model],
    ["Ano fabricação/modelo", `${vehicle.manufacture_year ?? "—"}/${vehicle.model_year ?? "—"}`],
    ["Capacidade total", `${vehicle.passenger_capacity} pessoas`], ["Base", `${vehicle.base_city}/${vehicle.base_state}`],
    ["Quilometragem", vehicle.current_mileage === null ? "Não informada" : `${new Intl.NumberFormat("pt-BR").format(vehicle.current_mileage)} km`],
    ["Licenciamento", displayDate(vehicle.licensing_expires_at)], ["Próxima manutenção", displayDate(vehicle.maintenance_due_at)],
    ["Atualizado em", updatedAt],
  ];
  return <div className="space-y-6"><section className="rounded-xl border border-zinc-200 bg-white p-5"><div className="flex flex-col gap-4 sm:flex-row sm:justify-between"><div><h2 className="text-xl font-semibold">{vehicle.brand} {vehicle.model}</h2><p className="mt-1 font-mono text-sm text-zinc-600">{plate(vehicle.plate)}</p></div><span className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${vehicle.active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"}`}>{vehicle.active ? "Ativo" : "Inativo"}</span></div><dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">{rows.map(([label, value]) => <div key={label}><dt className="text-zinc-500">{label}</dt><dd className="mt-1 font-medium text-zinc-900">{value}</dd></div>)}</dl></section>
    {vehicle.notes ? <section className="rounded-xl border border-zinc-200 bg-white p-5"><h2 className="font-semibold">Observações</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{vehicle.notes}</p></section> : null}
    <section className="rounded-xl border border-zinc-200 bg-white p-5"><h2 className="font-semibold">Condição operacional</h2><div className="mt-4"><VehicleStatusAction organizationSlug={organizationSlug} vehicleId={vehicle.id} currentStatus={vehicle.operational_status} /></div></section>
    <div className="flex flex-wrap items-start gap-4"><Link href={`/app/${organizationSlug}/cadastros/veiculos/${vehicle.id}/editar`} className="inline-flex h-10 items-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white">Editar veículo</Link><VehicleActiveStateAction organizationSlug={organizationSlug} vehicleId={vehicle.id} active={vehicle.active} /></div>
  </div>;
}

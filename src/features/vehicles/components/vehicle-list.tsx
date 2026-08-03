import Link from "next/link";
import { MapPin, Users } from "lucide-react";

import {
  DataTableShell,
  dataTableHeaderStyles,
  dataTableStyles,
} from "@/components/list-page/data-table-shell";
import {
  MobileRecordCard,
  MobileRecordList,
} from "@/components/list-page/mobile-record-list";
import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { NoResultsState } from "@/components/ui/no-results-state";
import { formatDateOnly, formatVehiclePlate, getVehicleDateState } from "@/features/vehicles/application/vehicle-presentation";
import { VehicleDateBadge, VehicleOperationalBadge } from "@/features/vehicles/components/vehicle-badges";
import { VehicleRowActions } from "@/features/vehicles/components/vehicle-row-actions";
import type { VehicleListViewItem } from "@/features/vehicles/types/vehicle";

function Availability({ vehicle, timezone }: { vehicle: VehicleListViewItem; timezone: string }) {
  if (!vehicle.availability) return <p className="text-sm font-medium text-success">Sem bloqueio cadastrado</p>;
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: timezone });
  const labels = {
    unavailability_current: ["Indisponível", `até ${date.format(new Date(vehicle.availability.endsAt))}`],
    unavailability_future: ["Indisponibilidade futura", `em ${date.format(new Date(vehicle.availability.startsAt))}`],
    reservation_current: ["Em reserva", `até ${date.format(new Date(vehicle.availability.endsAt))}`],
    reservation_future: ["Reserva futura", `em ${date.format(new Date(vehicle.availability.startsAt))}`],
  } as const;
  const [label, detail] = labels[vehicle.availability.kind];
  return <div><p className="text-sm font-medium text-foreground">{label}</p><p className="mt-0.5 text-xs text-muted-foreground">{detail}</p></div>;
}

export function VehicleList({ organizationSlug, vehicles, timezone, referenceDate, hasFilters }: { organizationSlug: string; vehicles: VehicleListViewItem[]; timezone: string; referenceDate: string; hasFilters: boolean }) {
  const base = `/app/${organizationSlug}/cadastros/veiculos`;
  if (!vehicles.length) return hasFilters ? <NoResultsState description="Revise os filtros ou limpe a pesquisa." action={{ href: base, label: "Limpar filtros" }} /> : <EmptyState title="Nenhum veículo cadastrado" description="Cadastre o primeiro veículo para começar a planejar o transporte das viagens." action={{ href: `${base}/novo`, label: "Novo veículo" }} />;
  return <><DataTableShell><table className={`${dataTableStyles} table-fixed`}><thead className={dataTableHeaderStyles}><tr><th scope="col" className="w-[20%] px-4 py-3">Veículo</th><th scope="col" className="w-[11%] px-4 py-3">Capacidade</th><th scope="col" className="w-[11%] px-4 py-3">Base</th><th scope="col" className="w-[14%] px-4 py-3">Situação operacional</th><th scope="col" className="w-[15%] px-4 py-3">Disponibilidade</th><th scope="col" className="w-[17%] px-4 py-3">Licenciamento</th><th scope="col" className="w-[9%] px-4 py-3">Situação</th><th scope="col" className="w-[6%] px-2 py-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-border">{vehicles.map((vehicle) => { const licensingState = getVehicleDateState(vehicle.licensing_expires_at, referenceDate); return <tr key={vehicle.id} className="align-top hover:bg-muted/30"><td className="px-4 py-4"><Link href={`${base}/${vehicle.id}`} className="font-mono text-base font-semibold text-foreground hover:text-primary hover:underline">{formatVehiclePlate(vehicle.plate)}</Link><p className="mt-1 truncate text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}{vehicle.model_year ? ` · ${vehicle.model_year}` : ""}</p></td><td className="px-4 py-4 text-sm"><p className="font-medium">{vehicle.passenger_capacity} pessoas</p><p className="mt-0.5 text-xs text-muted-foreground">incluindo motorista</p></td><td className="px-4 py-4 text-sm">{vehicle.base_city}/{vehicle.base_state}</td><td className="px-4 py-4"><VehicleOperationalBadge status={vehicle.operational_status} /></td><td className="px-4 py-4"><Availability vehicle={vehicle} timezone={timezone} /></td><td className="px-4 py-4"><VehicleDateBadge state={licensingState} subject="Licenciamento" /><p className="mt-1.5 text-xs text-muted-foreground">{vehicle.licensing_expires_at ? `até ${formatDateOnly(vehicle.licensing_expires_at)}` : "Data não informada"}</p></td><td className="px-4 py-4"><ActiveStatusBadge active={vehicle.active} /></td><td className="px-2 py-3"><VehicleRowActions organizationSlug={organizationSlug} vehicleId={vehicle.id} plate={formatVehiclePlate(vehicle.plate)} active={vehicle.active} operationalStatus={vehicle.operational_status} /></td></tr>; })}</tbody></table></DataTableShell><MobileRecordList label="Veículos cadastrados">{vehicles.map((vehicle) => <MobileRecordCard key={vehicle.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`${base}/${vehicle.id}`} className="font-mono text-base font-semibold hover:underline">{formatVehiclePlate(vehicle.plate)}</Link><p className="mt-1 truncate text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}{vehicle.model_year ? ` · ${vehicle.model_year}` : ""}</p></div><ActiveStatusBadge active={vehicle.active} /></div><div className="mt-3"><VehicleOperationalBadge status={vehicle.operational_status} /></div><div className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2"><p className="flex items-center gap-2 text-muted-foreground"><Users aria-hidden="true" className="size-4" />{vehicle.passenger_capacity} pessoas, incluindo motorista</p><p className="flex items-center gap-2 text-muted-foreground"><MapPin aria-hidden="true" className="size-4" />{vehicle.base_city}/{vehicle.base_state}</p><div><VehicleDateBadge state={getVehicleDateState(vehicle.licensing_expires_at, referenceDate)} subject="Licenciamento" /><p className="mt-1 text-xs text-muted-foreground">{formatDateOnly(vehicle.licensing_expires_at)}</p></div></div><div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3"><Availability vehicle={vehicle} timezone={timezone} /><VehicleRowActions organizationSlug={organizationSlug} vehicleId={vehicle.id} plate={formatVehiclePlate(vehicle.plate)} active={vehicle.active} operationalStatus={vehicle.operational_status} /></div></MobileRecordCard>)}</MobileRecordList></>;
}

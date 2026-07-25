import Link from "next/link";
import { Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { vehicleOperationalLabel } from "@/features/vehicles/application/vehicle-presentation";
import type { VehicleFilters as FilterValues } from "@/features/vehicles/types/vehicle";

export function VehicleFilters({ organizationSlug, filters }: { organizationSlug: string; filters: FilterValues }) {
  const path = `/app/${organizationSlug}/cadastros/veiculos`;
  const control = "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-card-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";
  const activeFilters = [
    filters.query ? `Busca: ${filters.query}` : null,
    filters.activeState === "active" ? "Situação: Ativos" : filters.activeState === "inactive" ? "Situação: Inativos" : null,
    filters.operationalStatus !== "all" ? `Condição: ${vehicleOperationalLabel(filters.operationalStatus)}` : null,
    filters.minimumCapacity ? `Capacidade: ${filters.minimumCapacity} ou mais` : null,
    filters.baseState ? `Localidade: ${filters.baseState}` : null,
  ].filter((value): value is string => Boolean(value));
  return <div className="space-y-4"><form action={path} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,2fr)_1fr_1.2fr_10rem_7rem_auto] xl:items-end"><div className="space-y-1.5 sm:col-span-2 xl:col-span-1"><label htmlFor="query" className="text-sm font-medium">Pesquisar veículo</label><div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" /><input id="query" name="query" type="search" maxLength={160} defaultValue={filters.query} placeholder="Buscar por placa, marca ou modelo..." className={`${control} pl-9`} /></div></div><div className="space-y-1.5"><label htmlFor="activeState" className="text-sm font-medium">Situação cadastral</label><select id="activeState" name="activeState" defaultValue={filters.activeState} className={control}><option value="all">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></div><div className="space-y-1.5"><label htmlFor="operationalStatus" className="text-sm font-medium">Condição operacional</label><select id="operationalStatus" name="operationalStatus" defaultValue={filters.operationalStatus} className={control}><option value="all">Todas</option><option value="available">Disponível</option><option value="maintenance">Em manutenção</option><option value="blocked">Bloqueado</option></select></div><div className="space-y-1.5"><label htmlFor="minimumCapacity" className="text-sm font-medium">Capacidade mínima</label><input id="minimumCapacity" name="minimumCapacity" type="number" min={1} max={99} defaultValue={filters.minimumCapacity} placeholder="Pessoas" className={control} /></div><div className="space-y-1.5"><label htmlFor="baseState" className="text-sm font-medium">UF-base</label><input id="baseState" name="baseState" maxLength={2} defaultValue={filters.baseState} placeholder="UF" className={`${control} uppercase`} /></div><button className={buttonStyles()}>Aplicar</button></form>{activeFilters.length ? <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4"><span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filtros ativos</span>{activeFilters.map((label) => <Badge key={label} tone="primary">{label}</Badge>)}<Link href={path} className={`${buttonStyles({ variant: "ghost", size: "sm" })} ml-auto`}><X aria-hidden="true" className="size-4" />Limpar filtros</Link></div> : null}</div>;
}

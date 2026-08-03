"use client";

import { Search } from "lucide-react";

import { ListActiveFilters } from "@/components/list-page/list-active-filters";
import { listControlStyles } from "@/components/list-page/list-controls";
import { ListFilterDialog } from "@/components/list-page/list-filter-dialog";
import {
  listToolbarSearchFormStyles,
  listToolbarUtilitiesStyles,
} from "@/components/list-page/list-toolbar";
import { DatePicker } from "@/components/ui/date-picker";
import type { UnavailabilityFilters as FilterValues, UnavailabilityTypeOption } from "@/features/unavailabilities/types/unavailability";

type ResourceOption = { id: string; label: string; active: boolean };

const temporalLabels = { current: "Atual", future: "Futura", past: "Encerrada" } as const;
const statusLabels = { active: "Ativa", inactive: "Inativa" } as const;

function FilterFields({ filters, resources, types, prefix, timezone }: { filters: FilterValues; resources: ResourceOption[]; types: UnavailabilityTypeOption[]; prefix: string; timezone: string }) {
  const isAll = filters.resource === "all";
  const fieldStyles = "min-w-0 space-y-1.5";
  const labelStyles = "block whitespace-nowrap text-sm font-medium";
  return <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div className={fieldStyles}><label htmlFor={`${prefix}-temporalStatus`} className={labelStyles}>Situação temporal</label><select id={`${prefix}-temporalStatus`} name="temporalStatus" defaultValue={filters.temporalStatus} className={listControlStyles}><option value="all">Todas</option><option value="current">Atuais</option><option value="future">Futuras</option><option value="past">Encerradas</option></select></div>
    <div className={fieldStyles}><label htmlFor={`${prefix}-status`} className={labelStyles}>Status do registro</label><select id={`${prefix}-status`} name="status" defaultValue={filters.status} className={listControlStyles}><option value="all">Todos</option><option value="active">Ativas</option><option value="inactive">Inativas</option></select></div>
    <div className={fieldStyles}><label htmlFor={`${prefix}-resourceId`} className={labelStyles}>{isAll ? "Recurso" : filters.resource === "technicians" ? "Técnico" : "Veículo"}</label><select id={`${prefix}-resourceId`} name="resourceId" disabled={isAll} defaultValue={isAll ? "" : filters.resourceId} className={listControlStyles}><option value="">{isAll ? "Selecione um tipo de recurso" : "Todos"}</option>{resources.map((item) => <option key={item.id} value={item.id}>{item.label}{item.active ? "" : " (inativo)"}</option>)}</select></div>
    <div className={fieldStyles}><label htmlFor={`${prefix}-unavailabilityTypeId`} className={labelStyles}>Tipo de indisponibilidade</label><select id={`${prefix}-unavailabilityTypeId`} name="unavailabilityTypeId" disabled={isAll} defaultValue={isAll ? "" : filters.unavailabilityTypeId} className={listControlStyles}><option value="">{isAll ? "Selecione um tipo de recurso" : "Todos"}</option>{types.map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? "" : " (inativo)"}</option>)}</select>{isAll ? <p className="text-xs leading-5 text-muted-foreground">Escolha Técnicos ou Veículos para filtrar pelos cadastros e tipos específicos.</p> : null}</div>
    <DatePicker id={`${prefix}-startsOn`} name="startsOn" label="Período a partir de" defaultValue={filters.startsOn} timezone={timezone} />
    <DatePicker id={`${prefix}-endsOn`} name="endsOn" label="Período até" defaultValue={filters.endsOn} timezone={timezone} />
  </div>;
}

export function UnavailabilityFilters({ organizationSlug, filters, resources, types, timezone }: { organizationSlug: string; filters: FilterValues; resources: ResourceOption[]; types: UnavailabilityTypeOption[]; timezone: string }) {
  const path = `/app/${organizationSlug}/planejamento/indisponibilidades`;
  const clearParams = new URLSearchParams();
  if (filters.resource !== "all") clearParams.set("resource", filters.resource);
  if (filters.pageSize !== 20) clearParams.set("pageSize", String(filters.pageSize));
  const clearQuery = clearParams.toString();
  const clearPath = clearQuery ? `${path}?${clearQuery}` : path;
  const activeFilters = [
    filters.query ? { key: "query", label: `Pesquisa: ${filters.query}` } : null,
    filters.temporalStatus !== "all" ? { key: "temporalStatus", label: `Situação temporal: ${temporalLabels[filters.temporalStatus]}` } : null,
    filters.status !== "all" ? { key: "status", label: `Situação: ${statusLabels[filters.status]}` } : null,
    filters.resourceId ? { key: "resourceId", label: `${filters.resource === "technicians" ? "Técnico" : "Veículo"}: ${resources.find((item) => item.id === filters.resourceId)?.label ?? "Selecionado"}` } : null,
    filters.unavailabilityTypeId ? { key: "unavailabilityTypeId", label: `Tipo: ${types.find((item) => item.id === filters.unavailabilityTypeId)?.name ?? "Selecionado"}` } : null,
    filters.startsOn ? { key: "startsOn", label: `De: ${filters.startsOn.split("-").reverse().join("/")}` } : null,
    filters.endsOn ? { key: "endsOn", label: `Até: ${filters.endsOn.split("-").reverse().join("/")}` } : null,
  ].filter((value): value is { key: string; label: string } => Boolean(value));

  function removeFilterHref(key: string) {
    const params = new URLSearchParams();
    if (filters.resource !== "all") params.set("resource", filters.resource);
    if (filters.query && key !== "query") params.set("query", filters.query);
    if (filters.temporalStatus !== "all" && key !== "temporalStatus") params.set("temporalStatus", filters.temporalStatus);
    if (filters.status !== "all" && key !== "status") params.set("status", filters.status);
    if (filters.resourceId && key !== "resourceId") params.set("resourceId", filters.resourceId);
    if (filters.unavailabilityTypeId && key !== "unavailabilityTypeId") params.set("unavailabilityTypeId", filters.unavailabilityTypeId);
    if (filters.startsOn && key !== "startsOn") params.set("startsOn", filters.startsOn);
    if (filters.endsOn && key !== "endsOn") params.set("endsOn", filters.endsOn);
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  return <>
    <div className={listToolbarUtilitiesStyles}><form action={path} className={listToolbarSearchFormStyles}><input type="hidden" name="resource" value={filters.resource} /><input type="hidden" name="temporalStatus" value={filters.temporalStatus} /><input type="hidden" name="status" value={filters.status} /><input type="hidden" name="startsOn" value={filters.startsOn} /><input type="hidden" name="endsOn" value={filters.endsOn} /><input type="hidden" name="pageSize" value={filters.pageSize} />{filters.resource !== "all" ? <><input type="hidden" name="resourceId" value={filters.resourceId} /><input type="hidden" name="unavailabilityTypeId" value={filters.unavailabilityTypeId} /></> : null}<div className="relative min-w-0"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><label htmlFor="mobile-query" className="sr-only">Pesquisar indisponibilidades</label><input id="mobile-query" name="query" type="search" maxLength={160} defaultValue={filters.query} placeholder="Pesquisar por recurso, tipo ou motivo..." className={`${listControlStyles} pl-9 pr-10`} /><button type="submit" aria-label="Pesquisar indisponibilidades" className="absolute right-0 top-0 grid size-10 place-items-center rounded-lg text-primary outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><Search aria-hidden="true" className="size-4" /></button></div></form>
      <ListFilterDialog action={path} title="Filtrar indisponibilidades" description="Combine situação, recurso, tipo e período." activeCount={activeFilters.filter((item) => item.key !== "query").length} clearHref={clearPath}>
        <input type="hidden" name="resource" value={filters.resource} />
        <input type="hidden" name="query" value={filters.query} />
        <input type="hidden" name="pageSize" value={filters.pageSize} />
        <FilterFields prefix="panel" filters={filters} resources={resources} types={types} timezone={timezone} />
      </ListFilterDialog>
    </div>
    <ListActiveFilters items={activeFilters.map((item) => ({ ...item, href: removeFilterHref(item.key) }))} clearHref={clearPath} />
  </>;
}

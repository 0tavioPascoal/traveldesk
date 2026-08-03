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
import type { TripFilters as Filters } from "@/features/trips/types/trip";

const statusLabels = {
  draft: "Rascunho",
  planned: "Planejada",
  confirmed: "Confirmada",
  traveling: "Em deslocamento",
  at_client: "No cliente",
  in_service: "Em atendimento",
  returning: "Em retorno",
  finished: "Finalizada",
  canceled: "Cancelada",
} as const;

const priorityLabels = { low: "Baixa", normal: "Normal", high: "Alta", urgent: "Urgente" } as const;
function dateLabel(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function FilterFields({
  filters,
  idPrefix,
  timezone,
}: {
  filters: Filters;
  idPrefix: string;
  timezone: string;
}) {
  return (
    <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="min-w-0 space-y-1.5">
        <label htmlFor={`${idPrefix}-status`} className="block whitespace-nowrap text-sm font-medium">Status</label>
        <select id={`${idPrefix}-status`} name="status" defaultValue={filters.status} className={listControlStyles}>
          <option value="all">Todos</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div className="min-w-0 space-y-1.5">
        <label htmlFor={`${idPrefix}-priority`} className="block whitespace-nowrap text-sm font-medium">Prioridade</label>
        <select id={`${idPrefix}-priority`} name="priority" defaultValue={filters.priority} className={listControlStyles}>
          <option value="all">Todas</option>
          {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <DatePicker id={`${idPrefix}-starts-on`} name="startsOn" label="Viagem a partir de" defaultValue={filters.startsOn} timezone={timezone} />
      <DatePicker id={`${idPrefix}-ends-on`} name="endsOn" label="Viagem até" defaultValue={filters.endsOn} timezone={timezone} />
    </div>
  );
}

export function TripFilters({
  organizationSlug,
  filters,
  timezone,
}: {
  organizationSlug: string;
  filters: Filters;
  timezone: string;
}) {
  const path = `/app/${organizationSlug}/planejamento/viagens`;
  const clearPath =
    filters.pageSize === 20 ? path : `${path}?pageSize=${filters.pageSize}`;
  const activeItems = [
    ...(filters.query ? [{ key: "query", label: `Pesquisa: ${filters.query}` }] : []),
    ...(filters.status !== "all" ? [{ key: "status", label: `Status: ${statusLabels[filters.status]}` }] : []),
    ...(filters.priority !== "all" ? [{ key: "priority", label: `Prioridade: ${priorityLabels[filters.priority]}` }] : []),
    ...(filters.startsOn ? [{ key: "startsOn", label: `A partir de: ${dateLabel(filters.startsOn)}` }] : []),
    ...(filters.endsOn ? [{ key: "endsOn", label: `Até: ${dateLabel(filters.endsOn)}` }] : []),
  ];
  const activeFilterCount = activeItems.filter((item) => item.key !== "query").length;

  function removeFilterHref(key: string) {
    const params = new URLSearchParams();
    if (filters.query && key !== "query") params.set("query", filters.query);
    if (filters.status !== "all" && key !== "status") params.set("status", filters.status);
    if (filters.priority !== "all" && key !== "priority") params.set("priority", filters.priority);
    if (filters.startsOn && key !== "startsOn") params.set("startsOn", filters.startsOn);
    if (filters.endsOn && key !== "endsOn") params.set("endsOn", filters.endsOn);
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  return (
    <>
      <div className={listToolbarUtilitiesStyles}>
        <form action={path} className={listToolbarSearchFormStyles}>
          <input type="hidden" name="status" value={filters.status} />
          <input type="hidden" name="priority" value={filters.priority} />
          <input type="hidden" name="startsOn" value={filters.startsOn} />
          <input type="hidden" name="endsOn" value={filters.endsOn} />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
          <div className="relative">
            <label htmlFor="mobile-trip-query" className="sr-only">Pesquisar viagens</label>
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input id="mobile-trip-query" name="query" type="search" maxLength={160} defaultValue={filters.query} placeholder="Pesquisar por código, título ou cliente..." className={`${listControlStyles} pl-9 pr-11`} />
            <button type="submit" aria-label="Pesquisar" className="absolute right-0 top-0 grid size-10 place-items-center rounded-lg text-primary"><Search aria-hidden="true" className="size-4" /></button>
          </div>
        </form>
        <ListFilterDialog
          action={path}
          title="Filtrar viagens"
          description="Combine status, prioridade e período da viagem."
          activeCount={activeFilterCount}
          clearHref={clearPath}
        >
          <input type="hidden" name="query" value={filters.query} />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
          <FilterFields filters={filters} idPrefix="panel" timezone={timezone} />
        </ListFilterDialog>
      </div>

      <ListActiveFilters
        items={activeItems.map((item) => ({
          ...item,
          href: removeFilterHref(item.key),
        }))}
        clearHref={clearPath}
      />
    </>
  );
}

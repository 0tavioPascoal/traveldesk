"use client";

import { Filter, Search, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
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
const inputStyles = "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-card-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20";

function dateLabel(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function FilterFields({ filters, idPrefix }: { filters: Filters; idPrefix: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-status`} className="text-sm font-medium">Status</label>
        <select id={`${idPrefix}-status`} name="status" defaultValue={filters.status} className={inputStyles}>
          <option value="all">Todos</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-priority`} className="text-sm font-medium">Prioridade</label>
        <select id={`${idPrefix}-priority`} name="priority" defaultValue={filters.priority} className={inputStyles}>
          <option value="all">Todas</option>
          {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-starts-on`} className="text-sm font-medium">Viagem a partir de</label>
        <input id={`${idPrefix}-starts-on`} name="startsOn" type="date" defaultValue={filters.startsOn} className={inputStyles} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-ends-on`} className="text-sm font-medium">Viagem até</label>
        <input id={`${idPrefix}-ends-on`} name="endsOn" type="date" defaultValue={filters.endsOn} className={inputStyles} />
      </div>
    </div>
  );
}

export function TripFilters({ organizationSlug, filters }: { organizationSlug: string; filters: Filters }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const path = `/app/${organizationSlug}/planejamento/viagens`;
  const activeItems = [
    ...(filters.query ? [{ key: "query", label: `Pesquisa: ${filters.query}` }] : []),
    ...(filters.status !== "all" ? [{ key: "status", label: `Status: ${statusLabels[filters.status]}` }] : []),
    ...(filters.priority !== "all" ? [{ key: "priority", label: `Prioridade: ${priorityLabels[filters.priority]}` }] : []),
    ...(filters.startsOn ? [{ key: "startsOn", label: `A partir de: ${dateLabel(filters.startsOn)}` }] : []),
    ...(filters.endsOn ? [{ key: "endsOn", label: `Até: ${dateLabel(filters.endsOn)}` }] : []),
  ];

  function removeFilterHref(key: string) {
    const params = new URLSearchParams();
    if (filters.query && key !== "query") params.set("query", filters.query);
    if (filters.status !== "all" && key !== "status") params.set("status", filters.status);
    if (filters.priority !== "all" && key !== "priority") params.set("priority", filters.priority);
    if (filters.startsOn && key !== "startsOn") params.set("startsOn", filters.startsOn);
    if (filters.endsOn && key !== "endsOn") params.set("endsOn", filters.endsOn);
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  return (
    <div className="space-y-4">
      <form action={path} className="hidden space-y-4 md:block">
        <div className="grid gap-3 xl:grid-cols-[minmax(20rem,1fr)_auto]">
          <div className="relative">
            <label htmlFor="desktop-trip-query" className="sr-only">Pesquisar viagens</label>
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input id="desktop-trip-query" name="query" type="search" maxLength={160} defaultValue={filters.query} placeholder="Buscar por código, título ou cliente..." className={`${inputStyles} pl-9`} />
          </div>
          <button className={buttonStyles({ size: "sm" })}>Pesquisar</button>
        </div>
        <FilterFields filters={filters} idPrefix="desktop" />
        <div className="flex gap-2">
          <button className={buttonStyles({ size: "sm" })}>Aplicar filtros</button>
          {activeItems.length > 0 ? <Link href={path} className={buttonStyles({ variant: "secondary", size: "sm" })}>Limpar filtros</Link> : null}
        </div>
      </form>

      <div className="flex gap-2 md:hidden">
        <form action={path} className="min-w-0 flex-1">
          <input type="hidden" name="status" value={filters.status} />
          <input type="hidden" name="priority" value={filters.priority} />
          <input type="hidden" name="startsOn" value={filters.startsOn} />
          <input type="hidden" name="endsOn" value={filters.endsOn} />
          <div className="relative">
            <label htmlFor="mobile-trip-query" className="sr-only">Pesquisar viagens</label>
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input id="mobile-trip-query" name="query" type="search" maxLength={160} defaultValue={filters.query} placeholder="Buscar viagens..." className={`${inputStyles} pl-9 pr-11`} />
            <button type="submit" aria-label="Pesquisar" className="absolute right-0 top-0 grid size-10 place-items-center rounded-lg text-primary"><Search aria-hidden="true" className="size-4" /></button>
          </div>
        </form>
        <button type="button" onClick={() => dialogRef.current?.showModal()} className={`${buttonStyles({ variant: "secondary", size: "sm" })} shrink-0`}>
          <Filter aria-hidden="true" className="size-4" />
          <span className="sr-only sm:not-sr-only">Filtros</span>
          {activeItems.filter((item) => item.key !== "query").length > 0 ? <Badge tone="primary">{activeItems.filter((item) => item.key !== "query").length}</Badge> : null}
        </button>
      </div>

      {activeItems.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filtros ativos</span>
          {activeItems.map((item) => (
            <Link key={item.key} href={removeFilterHref(item.key)} aria-label={`Remover filtro ${item.label}`} className="inline-flex min-h-8 items-center gap-1 rounded-full border border-border bg-muted px-3 text-xs font-medium text-muted-foreground hover:border-input hover:text-foreground">
              {item.label}<X aria-hidden="true" className="size-3" />
            </Link>
          ))}
          <Link href={path} className="min-h-8 px-2 py-1.5 text-xs font-semibold text-primary hover:underline">Limpar todos</Link>
        </div>
      ) : null}

      <dialog ref={dialogRef} aria-labelledby="trip-filter-dialog-title" className="m-auto w-[min(34rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl md:hidden">
        <form action={path} className="space-y-5 p-5">
          <input type="hidden" name="query" value={filters.query} />
          <div className="flex items-start justify-between gap-4">
            <div><h2 id="trip-filter-dialog-title" className="text-lg font-semibold">Filtrar viagens</h2><p className="mt-1 text-sm text-muted-foreground">Combine status, prioridade e período.</p></div>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar filtros" className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X aria-hidden="true" className="size-5" /></button>
          </div>
          <FilterFields filters={filters} idPrefix="mobile-dialog" />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {activeItems.length > 0 ? <Link href={path} className={buttonStyles({ variant: "secondary" })}>Limpar filtros</Link> : null}
            <button className={buttonStyles()}>Aplicar filtros</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

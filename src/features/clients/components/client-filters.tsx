"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import type { ClientFilters as ClientFilterValues } from "@/features/clients/types/client";

type ClientFiltersProps = {
  organizationSlug: string;
  filters: ClientFilterValues;
};

export function ClientFilters({
  organizationSlug,
  filters,
}: ClientFiltersProps) {
  const listPath = `/app/${organizationSlug}/cadastros/clientes`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeFilters = [
    ...(filters.query ? [{ key: "query", label: `Pesquisa: ${filters.query}` }] : []),
    ...(filters.status !== "all"
      ? [{ key: "status", label: filters.status === "active" ? "Situação: Ativos" : "Situação: Inativos" }]
      : []),
  ];

  function removeFilterHref(key: string) {
    const params = new URLSearchParams();
    if (filters.query && key !== "query") params.set("query", filters.query);
    if (filters.status !== "all" && key !== "status") params.set("status", filters.status);
    const query = params.toString();
    return query ? `${listPath}?${query}` : listPath;
  }

  const inputStyles = "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-card-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20";

  return (
    <div className="space-y-4">
      <form action={listPath} className="hidden items-end gap-3 md:grid md:grid-cols-[minmax(18rem,1fr)_12rem_auto]">
        <div className="space-y-1.5">
          <label htmlFor="desktop-client-query" className="text-sm font-medium text-foreground">Pesquisar</label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input id="desktop-client-query" name="query" type="search" maxLength={200} defaultValue={filters.query} placeholder="Buscar por nome ou documento..." className={`${inputStyles} pl-9`} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="desktop-client-status" className="text-sm font-medium text-foreground">Situação</label>
          <select id="desktop-client-status" name="status" defaultValue={filters.status} className={inputStyles}>
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
        <button type="submit" className={buttonStyles({ size: "sm" })}>Aplicar filtros</button>
      </form>

      <div className="flex gap-2 md:hidden">
        <form action={listPath} className="min-w-0 flex-1">
          <input type="hidden" name="status" value={filters.status} />
          <label htmlFor="mobile-client-query" className="sr-only">Pesquisar clientes</label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input id="mobile-client-query" name="query" type="search" maxLength={200} defaultValue={filters.query} placeholder="Buscar clientes..." className={`${inputStyles} pl-9 pr-10`} />
            <button type="submit" aria-label="Pesquisar clientes" className="absolute right-0 top-0 grid size-10 place-items-center rounded-lg text-primary"><Search aria-hidden="true" className="size-4" /></button>
          </div>
        </form>
        <button type="button" onClick={() => dialogRef.current?.showModal()} className={`${buttonStyles({ variant: "secondary", size: "sm" })} shrink-0`}>
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          <span className="sr-only">Filtrar por situação</span>
          {filters.status !== "all" ? <Badge tone="primary">1</Badge> : null}
        </button>
      </div>

      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filtros ativos</span>
          {activeFilters.map((filter) => (
            <Link key={filter.key} href={removeFilterHref(filter.key)} aria-label={`Remover filtro ${filter.label}`} className="inline-flex min-h-8 items-center gap-1 rounded-full border border-border bg-muted px-3 text-xs font-medium text-muted-foreground hover:border-input hover:text-foreground">
              {filter.label}<X aria-hidden="true" className="size-3" />
            </Link>
          ))}
          <Link href={listPath} className="min-h-8 px-2 py-1.5 text-xs font-semibold text-primary hover:underline">Limpar todos</Link>
        </div>
      ) : null}

      <dialog ref={dialogRef} aria-labelledby="client-filters-title" className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl md:hidden" onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}>
        <form action={listPath} className="space-y-5 p-5">
          <input type="hidden" name="query" value={filters.query} />
          <div className="flex items-start justify-between gap-4">
            <div><h2 id="client-filters-title" className="text-lg font-semibold">Filtrar clientes</h2><p className="mt-1 text-sm text-muted-foreground">Escolha a situação dos registros.</p></div>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar filtros" className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X aria-hidden="true" className="size-5" /></button>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="mobile-client-status" className="text-sm font-medium">Situação</label>
            <select id="mobile-client-status" name="status" defaultValue={filters.status} className={inputStyles}>
              <option value="all">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option>
            </select>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {activeFilters.length > 0 ? <Link href={listPath} className={buttonStyles({ variant: "secondary" })}>Limpar filtros</Link> : null}
            <button type="submit" className={buttonStyles()}>Aplicar filtros</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

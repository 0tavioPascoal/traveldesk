"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { ListActiveFilters } from "@/components/list-page/list-active-filters";
import { listControlStyles } from "@/components/list-page/list-controls";
import {
  listToolbarSearchFormStyles,
  listToolbarUtilitiesStyles,
} from "@/components/list-page/list-toolbar";
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
  const clearPath =
    filters.pageSize === 20
      ? listPath
      : `${listPath}?pageSize=${filters.pageSize}`;
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
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    const query = params.toString();
    return query ? `${listPath}?${query}` : listPath;
  }

  return (
    <>
      <div className={listToolbarUtilitiesStyles}>
        <form action={listPath} className={listToolbarSearchFormStyles}>
          <input type="hidden" name="status" value={filters.status} />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
          <label htmlFor="mobile-client-query" className="sr-only">Pesquisar clientes</label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input id="mobile-client-query" name="query" type="search" maxLength={200} defaultValue={filters.query} placeholder="Pesquisar cliente..." className={`${listControlStyles} pl-9 pr-10`} />
            <button type="submit" aria-label="Pesquisar clientes" className="absolute right-0 top-0 grid size-10 place-items-center rounded-lg text-primary"><Search aria-hidden="true" className="size-4" /></button>
          </div>
        </form>
        <button type="button" onClick={() => dialogRef.current?.showModal()} className={`${buttonStyles({ variant: "secondary", size: "sm" })} shrink-0`}>
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Filtros</span>
          <span className="sr-only sm:hidden">Filtrar clientes</span>
          {filters.status !== "all" ? <Badge tone="primary">1</Badge> : null}
        </button>
      </div>

      <ListActiveFilters
        items={activeFilters.map((filter) => ({
          ...filter,
          href: removeFilterHref(filter.key),
        }))}
        clearHref={clearPath}
      />

      <dialog ref={dialogRef} aria-labelledby="client-filters-title" className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl" onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}>
        <form action={listPath} className="space-y-5 p-5">
          <input type="hidden" name="query" value={filters.query} />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
          <div className="flex items-start justify-between gap-4">
            <div><h2 id="client-filters-title" className="text-lg font-semibold">Filtrar clientes</h2><p className="mt-1 text-sm text-muted-foreground">Escolha a situação dos registros.</p></div>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar filtros" className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X aria-hidden="true" className="size-5" /></button>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="mobile-client-status" className="text-sm font-medium">Situação</label>
            <select id="mobile-client-status" name="status" defaultValue={filters.status} className={listControlStyles}>
              <option value="all">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option>
            </select>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {activeFilters.length > 0 ? <Link href={clearPath} className={buttonStyles({ variant: "secondary" })}>Limpar filtros</Link> : null}
            <button type="submit" className={buttonStyles()}>Aplicar filtros</button>
          </div>
        </form>
      </dialog>
    </>
  );
}

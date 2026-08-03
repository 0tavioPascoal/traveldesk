"use client";

import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { ListActiveFilters } from "@/components/list-page/list-active-filters";
import {
  ListSearchField,
  listControlStyles,
} from "@/components/list-page/list-controls";
import {
  listToolbarSearchFormStyles,
  listToolbarUtilitiesStyles,
} from "@/components/list-page/list-toolbar";
import { buttonStyles } from "@/components/ui/button";
import type { ClientUnitListFilters } from "@/features/clients/types/client";

export function ClientUnitOverviewFilters({
  organizationSlug,
  filters,
}: {
  organizationSlug: string;
  filters: ClientUnitListFilters;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listPath = `/app/${organizationSlug}/cadastros/unidades`;
  const clearPath =
    filters.pageSize === 20
      ? listPath
      : `${listPath}?pageSize=${filters.pageSize}`;

  function hrefWithout(key: "query" | "status") {
    const params = new URLSearchParams();
    if (filters.query && key !== "query") params.set("query", filters.query);
    if (filters.status !== "all" && key !== "status") {
      params.set("status", filters.status);
    }
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    const query = params.toString();
    return query ? `${listPath}?${query}` : listPath;
  }

  const activeItems = [
    ...(filters.query
      ? [
          {
            key: "query",
            label: `Pesquisa: ${filters.query}`,
            href: hrefWithout("query"),
          },
        ]
      : []),
    ...(filters.status !== "all"
      ? [
          {
            key: "status",
            label:
              filters.status === "active"
                ? "Situação: Ativas"
                : "Situação: Inativas",
            href: hrefWithout("status"),
          },
        ]
      : []),
  ];

  return (
    <>
      <div className={listToolbarUtilitiesStyles}>
        <form action={listPath} className={listToolbarSearchFormStyles}>
          <input type="hidden" name="status" value={filters.status} />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
          <ListSearchField
            id="mobile-client-unit-query"
            label="Pesquisar"
            placeholder="Pesquisar unidade, cidade ou UF..."
            defaultValue={filters.query}
            compact
          />
        </form>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className={`${buttonStyles({ variant: "secondary", size: "sm" })} shrink-0`}
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filtros{filters.status !== "all" ? " (1)" : ""}
        </button>
      </div>

      <ListActiveFilters items={activeItems} clearHref={clearPath} />

      <dialog
        ref={dialogRef}
        aria-labelledby="client-unit-filters-title"
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form action={listPath} className="space-y-5 p-5">
          <input type="hidden" name="query" value={filters.query} />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="client-unit-filters-title"
                className="text-lg font-semibold"
              >
                Filtrar unidades
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha a situação cadastral dos registros.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Fechar filtros"
              className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="mobile-client-unit-status"
              className="text-sm font-medium"
            >
              Situação
            </label>
            <select
              id="mobile-client-unit-status"
              name="status"
              defaultValue={filters.status}
              className={listControlStyles}
            >
              <option value="all">Todas</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {activeItems.length > 0 ? (
              <Link
                href={clearPath}
                className={buttonStyles({ variant: "secondary" })}
              >
                Limpar filtros
              </Link>
            ) : null}
            <button type="submit" className={buttonStyles()}>
              Aplicar filtros
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

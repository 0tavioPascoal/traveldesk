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

type CatalogFiltersProps = {
  path: string;
  query: string;
  status: "all" | "active" | "inactive";
  placeholder: string;
};

export function CatalogFilters({
  path,
  query,
  status,
  placeholder,
}: CatalogFiltersProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hasFilters = query !== "" || status !== "all";
  const statusLabel = status === "active" ? "Ativos" : "Inativos";
  const activeItems = [
    ...(query
      ? [
          {
            key: "query",
            label: `Pesquisa: ${query}`,
            href: status === "all" ? path : `${path}?status=${status}`,
          },
        ]
      : []),
    ...(status !== "all"
      ? [
          {
            key: "status",
            label: `Situação: ${statusLabel}`,
            href: query ? `${path}?query=${encodeURIComponent(query)}` : path,
          },
        ]
      : []),
  ];

  return (
    <>
      <div className={listToolbarUtilitiesStyles}>
        <form action={path} className={listToolbarSearchFormStyles}>
          <input type="hidden" name="status" value={status} />
          <ListSearchField
            id="mobile-catalog-query"
            label="Pesquisar"
            placeholder={placeholder}
            defaultValue={query}
            compact
          />
        </form>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className={`${buttonStyles({ variant: "secondary", size: "sm" })} shrink-0`}
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filtros{status !== "all" ? " (1)" : ""}
        </button>
      </div>

      <ListActiveFilters items={activeItems} clearHref={path} />

      <dialog
        ref={dialogRef}
        aria-labelledby="catalog-filters-title"
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form action={path} className="space-y-5 p-5">
          <input type="hidden" name="query" value={query} />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="catalog-filters-title" className="text-lg font-semibold">
                Filtros
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Refine os registros pela situação cadastral.
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
              htmlFor="mobile-catalog-status"
              className="text-sm font-medium"
            >
              Situação
            </label>
            <select
              id="mobile-catalog-status"
              name="status"
              defaultValue={status}
              className={listControlStyles}
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {hasFilters ? (
              <Link
                href={path}
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

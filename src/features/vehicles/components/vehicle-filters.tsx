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
import { vehicleOperationalLabel } from "@/features/vehicles/application/vehicle-presentation";
import type { VehicleFilters as FilterValues } from "@/features/vehicles/types/vehicle";

function FilterFields({
  filters,
  prefix,
}: {
  filters: FilterValues;
  prefix: string;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <label
          htmlFor={`${prefix}-activeState`}
          className="text-sm font-medium"
        >
          Situação cadastral
        </label>
        <select
          id={`${prefix}-activeState`}
          name="activeState"
          defaultValue={filters.activeState}
          className={listControlStyles}
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor={`${prefix}-operationalStatus`}
          className="text-sm font-medium"
        >
          Situação operacional
        </label>
        <select
          id={`${prefix}-operationalStatus`}
          name="operationalStatus"
          defaultValue={filters.operationalStatus}
          className={listControlStyles}
        >
          <option value="all">Todas</option>
          <option value="available">Disponível</option>
          <option value="maintenance">Em manutenção</option>
          <option value="blocked">Bloqueado</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor={`${prefix}-minimumCapacity`}
          className="text-sm font-medium"
        >
          Capacidade mínima
        </label>
        <input
          id={`${prefix}-minimumCapacity`}
          name="minimumCapacity"
          type="number"
          min={1}
          max={99}
          defaultValue={filters.minimumCapacity}
          placeholder="Pessoas"
          className={listControlStyles}
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor={`${prefix}-baseState`}
          className="text-sm font-medium"
        >
          UF-base
        </label>
        <input
          id={`${prefix}-baseState`}
          name="baseState"
          maxLength={2}
          defaultValue={filters.baseState}
          placeholder="UF"
          className={`${listControlStyles} uppercase`}
        />
      </div>
    </>
  );
}

export function VehicleFilters({
  organizationSlug,
  filters,
}: {
  organizationSlug: string;
  filters: FilterValues;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const path = `/app/${organizationSlug}/cadastros/veiculos`;
  const clearPath =
    filters.pageSize === 20 ? path : `${path}?pageSize=${filters.pageSize}`;

  function hrefWithout(key: string) {
    const params = new URLSearchParams();
    if (filters.query && key !== "query") params.set("query", filters.query);
    if (filters.activeState !== "all" && key !== "activeState") {
      params.set("activeState", filters.activeState);
    }
    if (
      filters.operationalStatus !== "all" &&
      key !== "operationalStatus"
    ) {
      params.set("operationalStatus", filters.operationalStatus);
    }
    if (filters.minimumCapacity && key !== "minimumCapacity") {
      params.set("minimumCapacity", filters.minimumCapacity);
    }
    if (filters.baseState && key !== "baseState") {
      params.set("baseState", filters.baseState);
    }
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  const activeItems = [
    filters.query
      ? { key: "query", label: `Pesquisa: ${filters.query}` }
      : null,
    filters.activeState !== "all"
      ? {
          key: "activeState",
          label:
            filters.activeState === "active"
              ? "Situação: Ativos"
              : "Situação: Inativos",
        }
      : null,
    filters.operationalStatus !== "all"
      ? {
          key: "operationalStatus",
          label: `Situação operacional: ${vehicleOperationalLabel(filters.operationalStatus)}`,
        }
      : null,
    filters.minimumCapacity
      ? {
          key: "minimumCapacity",
          label: `Capacidade: ${filters.minimumCapacity} ou mais`,
        }
      : null,
    filters.baseState
      ? { key: "baseState", label: `UF-base: ${filters.baseState}` }
      : null,
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  return (
    <>
      <div className={listToolbarUtilitiesStyles}>
        <form action={path} className={listToolbarSearchFormStyles}>
          <input
            type="hidden"
            name="activeState"
            value={filters.activeState}
          />
          <input
            type="hidden"
            name="operationalStatus"
            value={filters.operationalStatus}
          />
          <input
            type="hidden"
            name="minimumCapacity"
            value={filters.minimumCapacity}
          />
          <input type="hidden" name="baseState" value={filters.baseState} />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
          <ListSearchField
            id="mobile-vehicle-query"
            label="Pesquisar"
            placeholder="Pesquisar por placa, marca ou modelo..."
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
          Filtros
          {activeItems.filter((item) => item.key !== "query").length
            ? ` (${activeItems.filter((item) => item.key !== "query").length})`
            : ""}
        </button>
      </div>

      <ListActiveFilters
        items={activeItems.map((item) => ({
          ...item,
          href: hrefWithout(item.key),
        }))}
        clearHref={clearPath}
      />

      <dialog
        ref={dialogRef}
        aria-labelledby="vehicle-filters-title"
        className="m-auto max-h-[min(42rem,calc(100dvh-2rem))] w-[min(32rem,calc(100%-2rem))] overflow-y-auto rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form action={path} className="space-y-5 p-5">
          <input type="hidden" name="query" value={filters.query} />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="vehicle-filters-title" className="text-lg font-semibold">
                Filtrar veículos
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Combine situação, capacidade e localidade.
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
          <div className="grid gap-4">
            <FilterFields filters={filters} prefix="panel" />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {activeItems.length ? (
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

"use client";

import { ChevronLeft, ChevronRight, Filter, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { RefreshListButton } from "@/components/list-page/refresh-list-button";
import { listControlStyles } from "@/components/list-page/list-controls";
import { buttonStyles } from "@/components/ui/button";
import {
  moveWeek,
  resolveWeekStart,
} from "@/features/schedule/application/schedule-calendar";
import type {
  ScheduleFilters,
  ScheduleResourceOption,
} from "@/features/schedule/types/schedule";
import { tripStatusPresentation } from "@/features/trips/components/trip-badges";

export function ScheduleControls({
  organizationSlug,
  timezone,
  generatedAt,
  filters,
  technicians,
  vehicles,
}: {
  organizationSlug: string;
  timezone: string;
  generatedAt: string;
  filters: ScheduleFilters;
  technicians: ScheduleResourceOption[];
  vehicles: ScheduleResourceOption[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const path = `/app/${organizationSlug}/planejamento/escala`;

  function href(overrides: Partial<ScheduleFilters>) {
    const values = { ...filters, ...overrides };
    const params = new URLSearchParams();
    params.set("week", values.week);
    if (values.query) params.set("q", values.query);
    if (values.status !== "all") params.set("status", values.status);
    if (values.technicianId) params.set("technicianId", values.technicianId);
    if (values.vehicleId) params.set("vehicleId", values.vehicleId);
    if (values.showConflicts) params.set("showConflicts", "true");
    if (!values.showUnavailabilities) params.set("showUnavailabilities", "false");
    return `${path}?${params}`;
  }

  const currentWeek = resolveWeekStart("", timezone, new Date(generatedAt));
  const activeFilterCount = [
    filters.status !== "all",
    Boolean(filters.technicianId),
    Boolean(filters.vehicleId),
    filters.showConflicts,
    !filters.showUnavailabilities,
  ].filter(Boolean).length;
  const visibleTechnicians = technicians.slice(0, 6);

  return (
    <div className="space-y-3">
      <section
        aria-label="Controles da escala"
        className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2"
      >
        <div className="flex items-center gap-1">
          <Link
            href={href({ week: moveWeek(filters.week, timezone, -1) })}
            aria-label="Semana anterior"
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href={href({ week: moveWeek(filters.week, timezone, 1) })}
            aria-label="Próxima semana"
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href={href({ week: currentWeek })}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            Hoje
          </Link>
        </div>
        <RefreshListButton />
        <Link
          href={`/app/${organizationSlug}/planejamento/viagens/nova`}
          className={buttonStyles({ size: "sm" })}
        >
          <Plus aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Nova viagem</span>
          <span className="sr-only sm:hidden">Criar nova viagem</span>
        </Link>

        <form action={path} className="order-last flex min-w-full flex-1 gap-2 lg:order-none lg:ml-auto lg:min-w-64 lg:max-w-xl">
          <input type="hidden" name="week" value={filters.week} />
          <input type="hidden" name="status" value={filters.status} />
          <input type="hidden" name="technicianId" value={filters.technicianId} />
          <input type="hidden" name="vehicleId" value={filters.vehicleId} />
          <input type="hidden" name="showConflicts" value={String(filters.showConflicts)} />
          <input type="hidden" name="showUnavailabilities" value={String(filters.showUnavailabilities)} />
          <div className="relative min-w-0 flex-1">
            <label htmlFor="schedule-search" className="sr-only">
              Buscar viagens, técnicos ou clientes
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="schedule-search"
              name="q"
              type="search"
              defaultValue={filters.query}
              maxLength={160}
              placeholder="Buscar viagens, técnicos ou clientes..."
              className={`${listControlStyles} pl-9 pr-10`}
            />
            <button type="submit" aria-label="Pesquisar na escala" className="absolute right-0 top-0 grid size-10 place-items-center rounded-lg text-primary focus-visible:ring-2 focus-visible:ring-ring">
              <Search aria-hidden="true" className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            <Filter aria-hidden="true" className="size-4" />
            Filtros{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </button>
        </form>
      </section>

      <div className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Filtro rápido por técnico">
        <Link
          href={href({ technicianId: "" })}
          aria-current={!filters.technicianId ? "true" : undefined}
          className={`${buttonStyles({ variant: filters.technicianId ? "secondary" : "primary", size: "sm" })} shrink-0`}
        >
          Todos os técnicos
        </Link>
        {visibleTechnicians.map((technician) => (
          <Link
            key={technician.id}
            href={href({ technicianId: technician.id })}
            aria-current={filters.technicianId === technician.id ? "true" : undefined}
            title={technician.label}
            className={`${buttonStyles({ variant: filters.technicianId === technician.id ? "primary" : "secondary", size: "sm" })} max-w-44 shrink-0`}
          >
            <span className="truncate">{technician.label}</span>
            {!technician.active ? <span className="text-xs">(inativo)</span> : null}
          </Link>
        ))}
        {technicians.length > visibleTechnicians.length ? (
          <button type="button" onClick={() => dialogRef.current?.showModal()} className={`${buttonStyles({ variant: "ghost", size: "sm" })} shrink-0`}>
            +{technicians.length - visibleTechnicians.length}
          </button>
        ) : null}
        {(filters.query || activeFilterCount) ? (
          <Link href={href({ query: "", status: "all", technicianId: "", vehicleId: "", showConflicts: false, showUnavailabilities: true })} className={`${buttonStyles({ variant: "ghost", size: "sm" })} shrink-0`}>
            Limpar filtros
          </Link>
        ) : null}
      </div>

      <dialog ref={dialogRef} aria-labelledby="schedule-filters-title" className="m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100%-2rem))] overflow-y-auto rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl" onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}>
        <form action={path} className="space-y-5 p-5">
          <input type="hidden" name="week" value={filters.week} />
          <input type="hidden" name="q" value={filters.query} />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="schedule-filters-title" className="text-lg font-semibold">Filtros da escala</h2>
              <p className="mt-1 text-sm text-muted-foreground">Refine viagens e recursos da semana selecionada.</p>
            </div>
            <button type="button" aria-label="Fechar filtros" onClick={() => dialogRef.current?.close()} className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted">
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">Status
              <select name="status" defaultValue={filters.status} className={listControlStyles}>
                <option value="all">Todos</option>
                {Object.entries(tripStatusPresentation).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium">Técnico
              <select name="technicianId" defaultValue={filters.technicianId} className={listControlStyles}>
                <option value="">Todos</option>
                {technicians.map((item) => <option key={item.id} value={item.id}>{item.label}{item.active ? "" : " (inativo)"}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium">Veículo
              <select name="vehicleId" defaultValue={filters.vehicleId} className={listControlStyles}>
                <option value="">Todos</option>
                {vehicles.map((item) => <option key={item.id} value={item.id}>{item.label}{item.active ? "" : " (inativo)"}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium">Conflitos
              <select name="showConflicts" defaultValue={String(filters.showConflicts)} className={listControlStyles}>
                <option value="false">Todas as viagens</option>
                <option value="true">Somente com conflito</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium sm:col-span-2">Indisponibilidades
              <select name="showUnavailabilities" defaultValue={String(filters.showUnavailabilities)} className={listControlStyles}>
                <option value="true">Exibir</option>
                <option value="false">Ocultar</option>
              </select>
            </label>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link href={href({ query: "", status: "all", technicianId: "", vehicleId: "", showConflicts: false, showUnavailabilities: true })} className={buttonStyles({ variant: "secondary" })}>Limpar</Link>
            <button type="submit" className={buttonStyles()}>Aplicar filtros</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

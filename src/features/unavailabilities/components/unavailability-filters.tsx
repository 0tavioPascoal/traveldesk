"use client";

import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import type { UnavailabilityFilters as FilterValues, UnavailabilityTypeOption } from "@/features/unavailabilities/types/unavailability";

type ResourceOption = { id: string; label: string; active: boolean };

const temporalLabels = { current: "Atual", future: "Futura", past: "Encerrada" } as const;
const statusLabels = { active: "Ativa", inactive: "Inativa" } as const;

function FilterFields({ filters, resources, types, prefix }: { filters: FilterValues; resources: ResourceOption[]; types: UnavailabilityTypeOption[]; prefix: string }) {
  const isAll = filters.resource === "all";
  const control = "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:bg-muted disabled:text-muted-foreground";
  return <>
    <div className="space-y-1.5"><label htmlFor={`${prefix}-temporalStatus`} className="text-sm font-medium">Situação temporal</label><select id={`${prefix}-temporalStatus`} name="temporalStatus" defaultValue={filters.temporalStatus} className={control}><option value="all">Todas</option><option value="current">Atuais</option><option value="future">Futuras</option><option value="past">Encerradas</option></select></div>
    <div className="space-y-1.5"><label htmlFor={`${prefix}-status`} className="text-sm font-medium">Status do registro</label><select id={`${prefix}-status`} name="status" defaultValue={filters.status} className={control}><option value="all">Todos</option><option value="active">Ativas</option><option value="inactive">Inativas</option></select></div>
    <div className="space-y-1.5"><label htmlFor={`${prefix}-resourceId`} className="text-sm font-medium">{isAll ? "Recurso" : filters.resource === "technicians" ? "Técnico" : "Veículo"}</label><select id={`${prefix}-resourceId`} name="resourceId" disabled={isAll} defaultValue={isAll ? "" : filters.resourceId} className={control}><option value="">{isAll ? "Selecione um tipo de recurso" : "Todos"}</option>{resources.map((item) => <option key={item.id} value={item.id}>{item.label}{item.active ? "" : " (inativo)"}</option>)}</select></div>
    <div className="space-y-1.5"><label htmlFor={`${prefix}-unavailabilityTypeId`} className="text-sm font-medium">Tipo de indisponibilidade</label><select id={`${prefix}-unavailabilityTypeId`} name="unavailabilityTypeId" disabled={isAll} defaultValue={isAll ? "" : filters.unavailabilityTypeId} className={control}><option value="">{isAll ? "Selecione um tipo de recurso" : "Todos"}</option>{types.map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? "" : " (inativo)"}</option>)}</select>{isAll ? <p className="text-xs leading-5 text-muted-foreground">Escolha Técnicos ou Veículos para filtrar pelos cadastros e tipos específicos.</p> : null}</div>
    <div className="space-y-1.5"><label htmlFor={`${prefix}-startsOn`} className="text-sm font-medium">Período a partir de</label><input id={`${prefix}-startsOn`} name="startsOn" type="date" defaultValue={filters.startsOn} className={control} /></div>
    <div className="space-y-1.5"><label htmlFor={`${prefix}-endsOn`} className="text-sm font-medium">Período até</label><input id={`${prefix}-endsOn`} name="endsOn" type="date" defaultValue={filters.endsOn} className={control} /></div>
  </>;
}

export function UnavailabilityFilters({ organizationSlug, filters, resources, types }: { organizationSlug: string; filters: FilterValues; resources: ResourceOption[]; types: UnavailabilityTypeOption[] }) {
  const path = `/app/${organizationSlug}/planejamento/indisponibilidades`;
  const clearPath = filters.resource === "all" ? path : `${path}?resource=${filters.resource}`;
  const activeFilters = [
    filters.query ? `Busca: ${filters.query}` : null,
    filters.temporalStatus !== "all" ? `Situação: ${temporalLabels[filters.temporalStatus]}` : null,
    filters.status !== "all" ? `Status: ${statusLabels[filters.status]}` : null,
    filters.resourceId ? `${filters.resource === "technicians" ? "Técnico" : "Veículo"}: ${resources.find((item) => item.id === filters.resourceId)?.label ?? "Selecionado"}` : null,
    filters.unavailabilityTypeId ? `Tipo: ${types.find((item) => item.id === filters.unavailabilityTypeId)?.name ?? "Selecionado"}` : null,
    filters.startsOn ? `De: ${filters.startsOn.split("-").reverse().join("/")}` : null,
    filters.endsOn ? `Até: ${filters.endsOn.split("-").reverse().join("/")}` : null,
  ].filter((value): value is string => Boolean(value));

  return <div className="space-y-4">
    <form action={path} className="hidden space-y-4 md:block">
      <input type="hidden" name="resource" value={filters.resource} />
      <div className="flex gap-2"><div className="relative min-w-0 flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><label htmlFor="desktop-query" className="sr-only">Pesquisar indisponibilidades</label><input id="desktop-query" name="query" type="search" maxLength={160} defaultValue={filters.query} placeholder="Buscar por técnico, veículo ou motivo..." className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" /></div><button type="submit" className={buttonStyles({ size: "sm" })}>Buscar</button></div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3"><FilterFields prefix="desktop" filters={filters} resources={resources} types={types} /><div className="col-span-2 flex justify-end gap-2 xl:col-span-3"><Link href={clearPath} className={buttonStyles({ variant: "ghost" })}>Limpar</Link><button type="submit" className={buttonStyles({ variant: "secondary" })}>Aplicar filtros</button></div></div>
    </form>
    <div className="flex gap-2 md:hidden"><form action={path} className="flex min-w-0 flex-1 gap-2"><input type="hidden" name="resource" value={filters.resource} /><input type="hidden" name="temporalStatus" value={filters.temporalStatus} /><input type="hidden" name="status" value={filters.status} /><input type="hidden" name="startsOn" value={filters.startsOn} /><input type="hidden" name="endsOn" value={filters.endsOn} />{filters.resource !== "all" ? <><input type="hidden" name="resourceId" value={filters.resourceId} /><input type="hidden" name="unavailabilityTypeId" value={filters.unavailabilityTypeId} /></> : null}<div className="relative min-w-0 flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><label htmlFor="mobile-query" className="sr-only">Pesquisar indisponibilidades</label><input id="mobile-query" name="query" type="search" maxLength={160} defaultValue={filters.query} placeholder="Buscar indisponibilidades..." className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" /></div><button type="submit" className={buttonStyles({ size: "sm" })}><Search aria-hidden="true" className="size-4" /><span className="sr-only">Buscar</span></button></form><button type="button" className={buttonStyles({ variant: "secondary", size: "sm" })} onClick={(event) => event.currentTarget.parentElement?.parentElement?.querySelector<HTMLDialogElement>("dialog")?.showModal()}><SlidersHorizontal aria-hidden="true" className="size-4" /><span className="sr-only">Abrir filtros</span></button></div>
    <dialog aria-labelledby="unavailability-filters-title" className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl md:hidden"><form action={path} className="space-y-5 p-5"><input type="hidden" name="resource" value={filters.resource} /><input type="hidden" name="query" value={filters.query} /><div className="flex items-center justify-between gap-3"><h2 id="unavailability-filters-title" className="text-lg font-semibold">Filtros</h2><button type="button" aria-label="Fechar filtros" onClick={(event) => event.currentTarget.closest("dialog")?.close()} className={buttonStyles({ variant: "ghost", size: "sm" })}><X aria-hidden="true" className="size-5" /></button></div><div className="grid gap-4"><FilterFields prefix="mobile" filters={filters} resources={resources} types={types} /></div><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link href={clearPath} className={buttonStyles({ variant: "secondary" })}>Limpar filtros</Link><button type="submit" className={buttonStyles()}>Aplicar filtros</button></div></form></dialog>
    {activeFilters.length > 0 ? <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2" aria-label="Filtros ativos">{activeFilters.map((label) => <span key={label} className="inline-flex min-h-8 items-center rounded-full border border-border bg-muted px-3 text-xs font-medium text-foreground">{label}</span>)}</div><Link href={clearPath} className="shrink-0 text-sm font-semibold text-primary hover:underline">Limpar filtros</Link></div> : null}
  </div>;
}

import Link from "next/link";
import { CalendarClock, CarFront, UserRound } from "lucide-react";

import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { NoResultsState } from "@/components/ui/no-results-state";
import { UnavailabilityRowActions } from "@/features/unavailabilities/components/unavailability-row-actions";
import type { CentralUnavailabilityListItem } from "@/features/unavailabilities/types/unavailability";

function formatPeriod(item: CentralUnavailabilityListItem, timezone: string) {
  const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: timezone });
  const dateTime = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: timezone });
  if (item.allDay) {
    const visibleEnd = new Date(new Date(item.endsAt).getTime() - 1);
    const start = date.format(new Date(item.startsAt));
    const end = date.format(visibleEnd);
    return start === end ? `${start} · dia inteiro` : `${start} → ${end} · dias inteiros`;
  }
  return `${dateTime.format(new Date(item.startsAt))} → ${dateTime.format(new Date(item.endsAt))}`;
}

function duration(item: CentralUnavailabilityListItem) {
  const milliseconds = new Date(item.endsAt).getTime() - new Date(item.startsAt).getTime();
  if (item.allDay) { const days = Math.round(milliseconds / 86400000); return `${days} ${days === 1 ? "dia" : "dias"}`; }
  const hours = milliseconds / 3600000;
  if (hours < 24) return `${hours.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h`;
  const days = Math.floor(hours / 24);
  const remaining = Math.round(hours % 24);
  return remaining ? `${days} d ${remaining} h` : `${days} ${days === 1 ? "dia" : "dias"}`;
}

function temporal(item: CentralUnavailabilityListItem, referenceTime: string) {
  const now = new Date(referenceTime).getTime();
  if (new Date(item.endsAt).getTime() <= now) return { label: "Encerrada", tone: "neutral" as const };
  if (new Date(item.startsAt).getTime() <= now) return { label: "Atual", tone: "warning" as const };
  return { label: "Futura", tone: "info" as const };
}

function canEdit(item: CentralUnavailabilityListItem, role: "admin" | "coordinator", referenceTime: string) {
  return role === "admin" || new Date(item.endsAt).getTime() > new Date(referenceTime).getTime();
}

function Resource({ item, organizationSlug }: { item: CentralUnavailabilityListItem; organizationSlug: string }) {
  const isTechnician = item.resourceKind === "technicians";
  const Icon = isTechnician ? UserRound : CarFront;
  const href = `/app/${organizationSlug}/cadastros/${isTechnician ? "tecnicos" : "veiculos"}/${item.resourceId}`;
  const title = isTechnician ? item.resourceName : item.resourceDescription ?? item.resourceName;
  const description = isTechnician ? item.resourceDescription : item.resourceName;
  return <div className="flex min-w-0 items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><Icon aria-hidden="true" className="size-4" /></span><div className="min-w-0"><Link href={href} className={`${isTechnician ? "" : "font-mono tracking-wide"} block truncate text-sm font-semibold text-foreground hover:underline`}>{title}</Link><p className="mt-0.5 truncate text-xs text-muted-foreground">{isTechnician ? "Técnico" : "Veículo"}{description ? ` • ${description}` : ""}</p></div></div>;
}

export function UnavailabilityList({ organizationSlug, items, timezone, role, hasFilters, referenceTime }: { organizationSlug: string; items: CentralUnavailabilityListItem[]; timezone: string; role: "admin" | "coordinator"; hasFilters: boolean; referenceTime: string }) {
  if (items.length === 0) return hasFilters
    ? <NoResultsState description="Revise os filtros ou limpe a pesquisa." action={{ href: `/app/${organizationSlug}/planejamento/indisponibilidades`, label: "Limpar filtros" }} />
    : <EmptyState icon={CalendarClock} title="Nenhuma indisponibilidade cadastrada" description="Registre períodos em que técnicos ou veículos não poderão ser alocados." />;
  return <>
    <div className="hidden rounded-xl border border-border bg-card lg:block"><table className="w-full table-fixed text-left"><thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="w-[23%] px-4 py-3">Recurso</th><th scope="col" className="w-[15%] px-4 py-3">Tipo</th><th scope="col" className="w-[27%] px-4 py-3">Período</th><th scope="col" className="w-[15%] px-4 py-3">Motivo</th><th scope="col" className="w-[14%] px-4 py-3">Situação</th><th scope="col" className="w-16 px-4 py-3 text-right"><span className="sr-only">Ações</span></th></tr></thead><tbody className="divide-y divide-border">{items.map((item) => { const state = temporal(item, referenceTime); return <tr key={`${item.resourceKind}-${item.id}`} className="align-top hover:bg-muted/30"><td className="px-4 py-4"><Resource item={item} organizationSlug={organizationSlug} /></td><td className="px-4 py-4 text-sm font-medium">{item.typeName}</td><td className="px-4 py-4"><p className="text-sm leading-5">{formatPeriod(item, timezone)}</p><p className="mt-1 text-xs text-muted-foreground">{duration(item)} · fuso {timezone}</p></td><td className="px-4 py-4"><p title={item.reason ?? undefined} className="line-clamp-2 text-sm leading-5 text-muted-foreground">{item.reason ?? "Não informado"}</p></td><td className="px-4 py-4"><div className="flex flex-col items-start gap-2"><Badge tone={state.tone}>{state.label}</Badge><ActiveStatusBadge active={item.active} feminine /></div></td><td className="px-4 py-4 text-right"><UnavailabilityRowActions organizationSlug={organizationSlug} resource={item.resourceKind} unavailabilityId={item.id} resourceId={item.resourceId} resourceName={item.resourceName} active={item.active} canEdit={canEdit(item, role, referenceTime)} /></td></tr>; })}</tbody></table></div>
    <div className="space-y-3 lg:hidden">{items.map((item) => { const state = temporal(item, referenceTime); return <article key={`${item.resourceKind}-${item.id}`} className="rounded-xl border border-border bg-card p-4"><div className="flex items-start justify-between gap-3"><Resource item={item} organizationSlug={organizationSlug} /><div className="flex shrink-0 items-start gap-1"><Badge tone={state.tone}>{state.label}</Badge><UnavailabilityRowActions organizationSlug={organizationSlug} resource={item.resourceKind} unavailabilityId={item.id} resourceId={item.resourceId} resourceName={item.resourceName} active={item.active} canEdit={canEdit(item, role, referenceTime)} /></div></div><div className="mt-4 space-y-2"><div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.typeName}</p><p className="mt-1 text-sm leading-5">{formatPeriod(item, timezone)}</p><p className="mt-1 text-xs text-muted-foreground">{duration(item)}</p></div>{item.reason ? <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">{item.reason}</p> : null}</div><div className="mt-4 border-t border-border pt-3"><ActiveStatusBadge active={item.active} feminine /></div></article>; })}</div>
  </>;
}

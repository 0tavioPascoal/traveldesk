import Link from "next/link";

import { UnavailabilityStatusAction } from "@/features/unavailabilities/components/unavailability-status-action";
import type { UnavailabilityListItem, UnavailabilityResourceKind } from "@/features/unavailabilities/types/unavailability";

function formatPeriod(item: UnavailabilityListItem, timezone: string) {
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: timezone });
  const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone });
  if (item.allDay) {
    const visibleEnd = new Date(new Date(item.endsAt).getTime() - 1);
    const start = date.format(new Date(item.startsAt));
    const end = date.format(visibleEnd);
    return start === end ? `${start} · dia inteiro` : `${start} a ${end} · dias inteiros`;
  }
  return `${dateTime.format(new Date(item.startsAt))} a ${dateTime.format(new Date(item.endsAt))}`;
}

function duration(item: UnavailabilityListItem) {
  const milliseconds = new Date(item.endsAt).getTime() - new Date(item.startsAt).getTime();
  if (item.allDay) return `${Math.round(milliseconds / 86400000)} dia(s)`;
  const hours = milliseconds / 3600000;
  return hours < 24 ? `${hours.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h` : `${Math.floor(hours / 24)} d ${Math.round(hours % 24)} h`;
}

function temporalStatus(item: UnavailabilityListItem) {
  const now = Date.now();
  if (new Date(item.endsAt).getTime() <= now) return "Encerrada";
  if (new Date(item.startsAt).getTime() <= now) return "Em andamento";
  return "Futura";
}

function canEdit(item: UnavailabilityListItem, role: "admin" | "coordinator") {
  return role === "admin" || new Date(item.endsAt).getTime() > Date.now();
}

export function UnavailabilityList({
  organizationSlug,
  resource,
  items,
  timezone,
  role,
  hasFilters,
}: {
  organizationSlug: string;
  resource: UnavailabilityResourceKind;
  items: UnavailabilityListItem[];
  timezone: string;
  role: "admin" | "coordinator";
  hasFilters: boolean;
}) {
  const segment = resource === "technicians" ? "tecnicos" : "veiculos";
  const base = `/app/${organizationSlug}/planejamento/indisponibilidades`;
  if (items.length === 0) return <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center"><h2 className="font-semibold">{hasFilters ? "Nenhuma indisponibilidade encontrada" : "Nenhuma indisponibilidade cadastrada"}</h2><p className="mt-2 text-sm text-zinc-600">{hasFilters ? "Altere ou limpe os filtros." : "Cadastre o primeiro período para este recurso."}</p>{!hasFilters ? <Link href={`${base}/${segment}/nova`} className="mt-4 inline-flex h-10 items-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white">Nova indisponibilidade</Link> : null}</div>;
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 bg-white lg:block"><table className="w-full min-w-[1050px] text-left"><thead className="bg-zinc-50 text-xs uppercase text-zinc-600"><tr><th className="px-4 py-3">{resource === "technicians" ? "Técnico" : "Veículo"}</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Período</th><th className="px-4 py-3">Duração</th><th className="px-4 py-3">Motivo</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ações</th></tr></thead><tbody className="divide-y">{items.map((item) => <tr key={item.id}><td className="px-4 py-4"><p className="font-semibold">{item.resourceName}</p><p className="text-xs text-zinc-500">{item.resourceDescription}</p></td><td className="px-4 py-4 text-sm">{item.typeName}</td><td className="whitespace-nowrap px-4 py-4 text-sm">{formatPeriod(item, timezone)}</td><td className="px-4 py-4 text-sm">{duration(item)}</td><td className="max-w-xs px-4 py-4 text-sm text-zinc-600">{item.reason ?? "—"}</td><td className="px-4 py-4"><div className="space-y-1"><span className={item.active ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700"}>{item.active ? "Ativa" : "Inativa"}</span><p className="text-xs text-zinc-500">{temporalStatus(item)}</p></div></td><td className="px-4 py-4"><div className="space-y-2">{canEdit(item, role) ? <Link href={`${base}/${segment}/${item.id}/editar`} className="text-sm font-medium">Editar</Link> : null}<UnavailabilityStatusAction organizationSlug={organizationSlug} resource={resource} id={item.id} active={item.active} /></div></td></tr>)}</tbody></table></div>
      <div className="space-y-3 lg:hidden">{items.map((item) => <article key={item.id} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{item.resourceName}</h2><p className="text-xs text-zinc-500">{item.resourceDescription}</p></div><span className={item.active ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700"}>{item.active ? "Ativa" : "Inativa"}</span></div><dl className="grid gap-2 text-sm"><div><dt className="text-xs text-zinc-500">Tipo</dt><dd>{item.typeName}</dd></div><div><dt className="text-xs text-zinc-500">Período</dt><dd>{formatPeriod(item, timezone)}</dd></div><div><dt className="text-xs text-zinc-500">Motivo</dt><dd>{item.reason ?? "—"}</dd></div></dl><div className="flex flex-wrap gap-3 border-t pt-3">{canEdit(item, role) ? <Link href={`${base}/${segment}/${item.id}/editar`} className="text-sm font-medium">Editar</Link> : null}<UnavailabilityStatusAction organizationSlug={organizationSlug} resource={resource} id={item.id} active={item.active} /></div></article>)}</div>
    </>
  );
}

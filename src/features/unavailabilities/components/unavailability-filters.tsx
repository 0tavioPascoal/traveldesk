import Link from "next/link";

import type { UnavailabilityFilters as FilterValues, UnavailabilityResourceKind, UnavailabilityTypeOption } from "@/features/unavailabilities/types/unavailability";

type ResourceOption = { id: string; label: string; active: boolean };

export function UnavailabilityFilters({
  organizationSlug,
  resource,
  filters,
  resources,
  types,
}: {
  organizationSlug: string;
  resource: UnavailabilityResourceKind;
  filters: FilterValues;
  resources: ResourceOption[];
  types: UnavailabilityTypeOption[];
}) {
  const path = `/app/${organizationSlug}/planejamento/indisponibilidades`;
  const control = "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10";
  return (
    <form action={path} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <input type="hidden" name="resource" value={resource} />
      <div className="space-y-1 xl:col-span-2"><label htmlFor="query" className="text-sm font-medium">Pesquisar</label><input id="query" name="query" type="search" maxLength={160} defaultValue={filters.query} placeholder={resource === "technicians" ? "Técnico ou motivo" : "Veículo, placa ou motivo"} className={control} /></div>
      <div className="space-y-1"><label htmlFor="startsOn" className="text-sm font-medium">De</label><input id="startsOn" name="startsOn" type="date" defaultValue={filters.startsOn} className={control} /></div>
      <div className="space-y-1"><label htmlFor="endsOn" className="text-sm font-medium">Até</label><input id="endsOn" name="endsOn" type="date" defaultValue={filters.endsOn} className={control} /></div>
      <div className="space-y-1"><label htmlFor="resourceId" className="text-sm font-medium">{resource === "technicians" ? "Técnico" : "Veículo"}</label><select id="resourceId" name="resourceId" defaultValue={filters.resourceId} className={control}><option value="">Todos</option>{resources.map((item) => <option key={item.id} value={item.id}>{item.label}{item.active ? "" : " (inativo)"}</option>)}</select></div>
      <div className="space-y-1"><label htmlFor="unavailabilityTypeId" className="text-sm font-medium">Tipo</label><select id="unavailabilityTypeId" name="unavailabilityTypeId" defaultValue={filters.unavailabilityTypeId} className={control}><option value="">Todos</option>{types.map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? "" : " (inativo)"}</option>)}</select></div>
      <div className="space-y-1"><label htmlFor="status" className="text-sm font-medium">Status</label><select id="status" name="status" defaultValue={filters.status} className={control}><option value="all">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></div>
      <div className="flex items-end gap-2"><button type="submit" className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white">Filtrar</button><Link href={`${path}?resource=${resource}`} className="inline-flex h-10 items-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700">Limpar</Link></div>
    </form>
  );
}

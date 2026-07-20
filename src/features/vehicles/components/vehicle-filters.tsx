import Link from "next/link";

import type { VehicleFilters as FilterValues } from "@/features/vehicles/types/vehicle";

export function VehicleFilters({ organizationSlug, filters }: { organizationSlug: string; filters: FilterValues }) {
  const path = `/app/${organizationSlug}/cadastros/veiculos`;
  const control = "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10";
  return <form action={path} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
    <div className="space-y-1 lg:col-span-2"><label htmlFor="query" className="text-sm font-medium">Pesquisar</label><input id="query" name="query" type="search" maxLength={160} defaultValue={filters.query} placeholder="Placa, marca, modelo ou cidade" className={control} /></div>
    <div className="space-y-1"><label htmlFor="activeState" className="text-sm font-medium">Cadastro</label><select id="activeState" name="activeState" defaultValue={filters.activeState} className={control}><option value="all">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></div>
    <div className="space-y-1"><label htmlFor="operationalStatus" className="text-sm font-medium">Condição</label><select id="operationalStatus" name="operationalStatus" defaultValue={filters.operationalStatus} className={control}><option value="all">Todas</option><option value="available">Disponível</option><option value="maintenance">Em manutenção</option><option value="blocked">Bloqueado</option></select></div>
    <div className="space-y-1"><label htmlFor="baseState" className="text-sm font-medium">UF</label><input id="baseState" name="baseState" maxLength={2} defaultValue={filters.baseState} placeholder="UF" className={control} /></div>
    <div className="flex items-end gap-2 lg:col-span-5"><button type="submit" className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white">Filtrar</button><Link href={path} className="inline-flex h-10 items-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700">Limpar</Link></div>
  </form>;
}

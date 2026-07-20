import Link from "next/link";

import type { UnavailabilityTypeFilters as FilterValues } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityTypeFilters({
  path,
  filters,
}: {
  path: string;
  filters: FilterValues;
}) {
  const control = "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10";
  return (
    <form action={path} className="grid gap-4 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
      <div className="space-y-1">
        <label htmlFor="query" className="text-sm font-medium">Pesquisar</label>
        <input id="query" name="query" type="search" maxLength={160} defaultValue={filters.query} placeholder="Nome do tipo" className={control} />
      </div>
      <div className="space-y-1">
        <label htmlFor="status" className="text-sm font-medium">Status</label>
        <select id="status" name="status" defaultValue={filters.status} className={control}>
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white">Filtrar</button>
        <Link href={path} className="inline-flex h-10 items-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700">Limpar</Link>
      </div>
    </form>
  );
}

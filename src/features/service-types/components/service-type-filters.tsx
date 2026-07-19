import Link from "next/link";

import type { ServiceTypeFilters as ServiceTypeFilterValues } from "@/features/service-types/types/service-type";

type ServiceTypeFiltersProps = {
  organizationSlug: string;
  filters: ServiceTypeFilterValues;
};

export function ServiceTypeFilters({
  organizationSlug,
  filters,
}: ServiceTypeFiltersProps) {
  const listPath = `/app/${organizationSlug}/cadastros/tipos-atendimento`;

  return (
    <form action={listPath} className="grid gap-4 sm:grid-cols-[1fr_12rem_auto]">
      <div className="space-y-2">
        <label htmlFor="query" className="block text-sm font-medium text-zinc-800">
          Pesquisar
        </label>
        <input
          id="query"
          name="query"
          type="search"
          maxLength={120}
          defaultValue={filters.query}
          placeholder="Nome do tipo de atendimento"
          className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="status" className="block text-sm font-medium text-zinc-800">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={filters.status}
          className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>
      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-700 sm:flex-none"
        >
          Filtrar
        </button>
        <Link
          href={listPath}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 sm:flex-none"
        >
          Limpar
        </Link>
      </div>
    </form>
  );
}

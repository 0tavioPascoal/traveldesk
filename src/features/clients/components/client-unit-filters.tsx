import { Search, X } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import type { ClientUnitFilters as ClientUnitFilterValues } from "@/features/clients/types/client";

type ClientUnitFiltersProps = {
  organizationSlug: string;
  clientId: string;
  filters: ClientUnitFilterValues;
};

export function ClientUnitFilters({ organizationSlug, clientId, filters }: ClientUnitFiltersProps) {
  const detailPath = `/app/${organizationSlug}/cadastros/clientes/${clientId}`;
  const inputStyles = "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-card-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20";
  const activeFilters = [
    ...(filters.query ? [{ key: "unitQuery", label: `Pesquisa: ${filters.query}` }] : []),
    ...(filters.status !== "all" ? [{ key: "unitStatus", label: filters.status === "active" ? "Situação: Ativas" : "Situação: Inativas" }] : []),
  ];

  function removeFilterHref(key: string) {
    const params = new URLSearchParams();
    if (filters.query && key !== "unitQuery") params.set("unitQuery", filters.query);
    if (filters.status !== "all" && key !== "unitStatus") params.set("unitStatus", filters.status);
    const query = params.toString();
    return query ? `${detailPath}?${query}#unidades` : `${detailPath}#unidades`;
  }

  return (
    <div className="space-y-4">
      <form action={detailPath} className="grid items-end gap-3 sm:grid-cols-[minmax(16rem,1fr)_11rem_auto]">
        <div className="space-y-1.5">
          <label htmlFor="unitQuery" className="text-sm font-medium text-foreground">Pesquisar unidades</label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input id="unitQuery" name="unitQuery" type="search" maxLength={160} defaultValue={filters.query} placeholder="Buscar por nome ou cidade..." className={`${inputStyles} pl-9`} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="unitStatus" className="text-sm font-medium text-foreground">Situação</label>
          <select id="unitStatus" name="unitStatus" defaultValue={filters.status} className={inputStyles}>
            <option value="all">Todas</option><option value="active">Ativas</option><option value="inactive">Inativas</option>
          </select>
        </div>
        <button type="submit" className={buttonStyles({ size: "sm" })}>Aplicar filtros</button>
      </form>
      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filtros ativos</span>
          {activeFilters.map((filter) => <Link key={filter.key} href={removeFilterHref(filter.key)} aria-label={`Remover filtro ${filter.label}`} className="inline-flex min-h-8 items-center gap-1 rounded-full border border-border bg-muted px-3 text-xs font-medium text-muted-foreground hover:text-foreground">{filter.label}<X aria-hidden="true" className="size-3" /></Link>)}
          <Link href={`${detailPath}#unidades`} className="min-h-8 px-2 py-1.5 text-xs font-semibold text-primary hover:underline">Limpar todos</Link>
        </div>
      ) : null}
    </div>
  );
}

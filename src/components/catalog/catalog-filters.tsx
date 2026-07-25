import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

type CatalogFiltersProps = {
  path: string;
  query: string;
  status: "all" | "active" | "inactive";
  placeholder: string;
};

const controlStyles =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

export function CatalogFilters({
  path,
  query,
  status,
  placeholder,
}: CatalogFiltersProps) {
  const hasFilters = query !== "" || status !== "all";
  const statusLabel = status === "active" ? "Ativos" : "Inativos";

  return (
    <div className="space-y-4">
      <form action={path} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end">
        <div className="space-y-2">
          <label htmlFor="query" className="block text-sm font-medium text-foreground">
            Pesquisar
          </label>
          <input
            id="query"
            name="query"
            type="search"
            maxLength={160}
            defaultValue={query}
            placeholder={placeholder}
            className={controlStyles}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-foreground">
            Situação
          </label>
          <select id="status" name="status" defaultValue={status} className={controlStyles}>
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className={`${buttonStyles({ size: "sm" })} flex-1 sm:flex-none`}>
            Filtrar
          </button>
          {hasFilters ? (
            <Link href={path} className={`${buttonStyles({ variant: "secondary", size: "sm" })} flex-1 sm:flex-none`}>
              Limpar
            </Link>
          ) : null}
        </div>
      </form>

      {hasFilters ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4" aria-label="Filtros ativos">
          <div className="flex flex-wrap gap-2 text-xs">
            {query ? (
              <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-muted-foreground">
                Pesquisa: <span className="font-semibold text-foreground">{query}</span>
              </span>
            ) : null}
            {status !== "all" ? (
              <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-muted-foreground">
                Situação: <span className="font-semibold text-foreground">{statusLabel}</span>
              </span>
            ) : null}
          </div>
          <Link href={path} className="text-sm font-semibold text-primary hover:underline">
            Limpar filtros
          </Link>
        </div>
      ) : null}
    </div>
  );
}

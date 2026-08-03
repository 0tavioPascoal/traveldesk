import { X } from "lucide-react";
import Link from "next/link";

export type ActiveFilterItem = {
  key: string;
  label: string;
  href: string;
};

export function ListActiveFilters({
  items,
  clearHref,
}: {
  items: ActiveFilterItem[];
  clearHref: string;
}) {
  if (items.length === 0) return null;

  return (
    <div
      aria-label="Filtros ativos"
      className="col-span-3 row-start-3 -mx-2 -mb-2 flex w-[calc(100%+1rem)] flex-col gap-2 border-t border-border px-2 py-2 sm:flex-row sm:items-center md:row-start-2"
    >
      <span className="shrink-0 text-xs font-semibold text-muted-foreground">
        Filtros ativos:
      </span>
      <div className="flex flex-1 flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-label={`Remover filtro ${item.label}`}
            className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {item.label}
            <X aria-hidden="true" className="size-3" />
          </Link>
        ))}
      </div>
      <Link
        href={clearHref}
        className="min-h-8 shrink-0 py-1.5 text-sm font-semibold text-primary hover:underline"
      >
        Limpar todos
      </Link>
    </div>
  );
}

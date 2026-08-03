import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { PageSizeSelect } from "@/components/list-page/page-size-select";

export function ListPagination({
  ariaLabel,
  page,
  totalPages,
  total,
  pageSize,
  itemName,
  href,
  pageSizeOptions,
}: {
  ariaLabel: string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  itemName: { singular: string; plural: string };
  href: (page: number) => string;
  pageSizeOptions?: readonly number[];
}) {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const noun = total === 1 ? itemName.singular : itemName.plural;
  const hasPages = totalPages > 1;

  return (
    <nav
      aria-label={ariaLabel}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">
        {total === 1
          ? `Mostrando 1 ${noun}`
          : `Mostrando ${start}–${end} de ${total} ${noun}`}
      </p>
      {pageSizeOptions || hasPages ? (
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          {pageSizeOptions ? (
            <PageSizeSelect options={pageSizeOptions} value={pageSize} />
          ) : null}
          {hasPages ? (
            <>
              <Link
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : undefined}
                href={page <= 1 ? href(1) : href(page - 1)}
                className={`${buttonStyles({ variant: "secondary", size: "sm" })} ${
                  page <= 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Anterior
              </Link>
              <span
                aria-current="page"
                className="inline-flex h-10 items-center px-1 text-sm font-medium sm:px-2"
              >
                Página {page} de {totalPages}
              </span>
              <Link
                aria-disabled={page >= totalPages}
                tabIndex={page >= totalPages ? -1 : undefined}
                href={page >= totalPages ? href(totalPages) : href(page + 1)}
                className={`${buttonStyles({ variant: "secondary", size: "sm" })} ${
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Próxima
              </Link>
            </>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}

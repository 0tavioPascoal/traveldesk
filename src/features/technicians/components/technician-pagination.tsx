import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import type { TechnicianFilters } from "@/features/technicians/types/technician";

export function TechnicianPagination({ organizationSlug, filters, total, totalPages, pageSize }: { organizationSlug: string; filters: TechnicianFilters; total: number; totalPages: number; pageSize: number }) {
  if (totalPages <= 1) return null;
  function href(page: number) {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.skillId) params.set("skillId", filters.skillId);
    if (filters.canDrive !== "all") params.set("canDrive", filters.canDrive);
    if (filters.baseState) params.set("baseState", filters.baseState);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return `/app/${organizationSlug}/cadastros/tecnicos${query ? `?${query}` : ""}`;
  }
  const start = (filters.page - 1) * pageSize + 1;
  const end = Math.min(filters.page * pageSize, total);
  return <nav aria-label="Paginação de técnicos" className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">Exibindo {start}–{end} de {total} técnicos</p><div className="flex gap-2"><Link aria-disabled={filters.page <= 1} tabIndex={filters.page <= 1 ? -1 : undefined} href={filters.page <= 1 ? href(1) : href(filters.page - 1)} className={`${buttonStyles({ variant: "secondary", size: "sm" })} ${filters.page <= 1 ? "pointer-events-none opacity-50" : ""}`}>Anterior</Link><span className="inline-flex h-10 items-center px-2 text-sm font-medium">Página {filters.page} de {totalPages}</span><Link aria-disabled={filters.page >= totalPages} tabIndex={filters.page >= totalPages ? -1 : undefined} href={filters.page >= totalPages ? href(totalPages) : href(filters.page + 1)} className={`${buttonStyles({ variant: "secondary", size: "sm" })} ${filters.page >= totalPages ? "pointer-events-none opacity-50" : ""}`}>Próxima</Link></div></nav>;
}

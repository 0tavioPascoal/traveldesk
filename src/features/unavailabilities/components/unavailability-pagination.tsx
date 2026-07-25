import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import type { UnavailabilityFilters } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityPagination({ organizationSlug, filters, total, totalPages, pageSize }: { organizationSlug: string; filters: UnavailabilityFilters; total: number; totalPages: number; pageSize: number }) {
  if (totalPages <= 1) return null;
  function href(page: number) {
    const params = new URLSearchParams();
    if (filters.resource !== "all") params.set("resource", filters.resource);
    if (filters.query) params.set("query", filters.query);
    if (filters.startsOn) params.set("startsOn", filters.startsOn);
    if (filters.endsOn) params.set("endsOn", filters.endsOn);
    if (filters.resourceId) params.set("resourceId", filters.resourceId);
    if (filters.unavailabilityTypeId) params.set("unavailabilityTypeId", filters.unavailabilityTypeId);
    if (filters.temporalStatus !== "all") params.set("temporalStatus", filters.temporalStatus);
    if (filters.status !== "all") params.set("status", filters.status);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return `/app/${organizationSlug}/planejamento/indisponibilidades${query ? `?${query}` : ""}`;
  }
  const start = (filters.page - 1) * pageSize + 1;
  const end = Math.min(filters.page * pageSize, total);
  return <nav aria-label="Paginação de indisponibilidades" className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">Exibindo {start}–{end} de {total} indisponibilidades</p><div className="flex items-center gap-2"><Link aria-disabled={filters.page <= 1} tabIndex={filters.page <= 1 ? -1 : undefined} href={filters.page <= 1 ? href(1) : href(filters.page - 1)} className={`${buttonStyles({ variant: "secondary", size: "sm" })} ${filters.page <= 1 ? "pointer-events-none opacity-50" : ""}`}>Anterior</Link><span className="inline-flex h-10 items-center px-1 text-sm font-medium">{filters.page} de {totalPages}</span><Link aria-disabled={filters.page >= totalPages} tabIndex={filters.page >= totalPages ? -1 : undefined} href={filters.page >= totalPages ? href(totalPages) : href(filters.page + 1)} className={`${buttonStyles({ variant: "secondary", size: "sm" })} ${filters.page >= totalPages ? "pointer-events-none opacity-50" : ""}`}>Próxima</Link></div></nav>;
}

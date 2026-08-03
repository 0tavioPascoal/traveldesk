import { ListPagination } from "@/components/list-page/list-pagination";
import type { UnavailabilityFilters } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityPagination({ organizationSlug, filters, total, totalPages, pageSize }: { organizationSlug: string; filters: UnavailabilityFilters; total: number; totalPages: number; pageSize: number }) {
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
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return `/app/${organizationSlug}/planejamento/indisponibilidades${query ? `?${query}` : ""}`;
  }
  return <ListPagination ariaLabel="Paginação de indisponibilidades" page={filters.page} totalPages={totalPages} total={total} pageSize={pageSize} itemName={{ singular: "indisponibilidade", plural: "indisponibilidades" }} href={href} pageSizeOptions={[10, 20, 50]} />;
}

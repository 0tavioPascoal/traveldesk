import { ListPagination } from "@/components/list-page/list-pagination";
import type { TripFilters } from "@/features/trips/types/trip";

export function TripPagination({
  organizationSlug,
  filters,
  total,
  totalPages,
  pageSize,
}: {
  organizationSlug: string;
  filters: TripFilters;
  total: number;
  totalPages: number;
  pageSize: number;
}) {
  function href(page: number) {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.priority !== "all") params.set("priority", filters.priority);
    if (filters.startsOn) params.set("startsOn", filters.startsOn);
    if (filters.endsOn) params.set("endsOn", filters.endsOn);
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return `/app/${organizationSlug}/planejamento/viagens${query ? `?${query}` : ""}`;
  }

  return (
    <ListPagination
      ariaLabel="Paginação de viagens"
      page={filters.page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      itemName={{ singular: "viagem", plural: "viagens" }}
      href={href}
      pageSizeOptions={[10, 20, 50]}
    />
  );
}

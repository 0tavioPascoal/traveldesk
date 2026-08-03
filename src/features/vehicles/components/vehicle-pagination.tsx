import { ListPagination } from "@/components/list-page/list-pagination";
import type { VehicleFilters } from "@/features/vehicles/types/vehicle";

export function VehiclePagination({ organizationSlug, filters, total, totalPages, pageSize }: { organizationSlug: string; filters: VehicleFilters; total: number; totalPages: number; pageSize: number }) {
  function href(page: number) {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.activeState !== "all") params.set("activeState", filters.activeState);
    if (filters.operationalStatus !== "all") params.set("operationalStatus", filters.operationalStatus);
    if (filters.minimumCapacity) params.set("minimumCapacity", filters.minimumCapacity);
    if (filters.baseState) params.set("baseState", filters.baseState);
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return `/app/${organizationSlug}/cadastros/veiculos${query ? `?${query}` : ""}`;
  }
  return <ListPagination ariaLabel="Paginação de veículos" page={filters.page} totalPages={totalPages} total={total} pageSize={pageSize} itemName={{ singular: "veículo", plural: "veículos" }} href={href} pageSizeOptions={[10, 20, 50]} />;
}

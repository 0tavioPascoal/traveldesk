import { ListPagination } from "@/components/list-page/list-pagination";
import type { ClientUnitListFilters } from "@/features/clients/types/client";

export function ClientUnitOverviewPagination({
  organizationSlug,
  filters,
  total,
  totalPages,
  pageSize,
}: {
  organizationSlug: string;
  filters: ClientUnitListFilters;
  total: number;
  totalPages: number;
  pageSize: number;
}) {
  function href(page: number) {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return `/app/${organizationSlug}/cadastros/unidades${query ? `?${query}` : ""}`;
  }

  return (
    <ListPagination
      ariaLabel="Paginação de unidades"
      page={filters.page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      itemName={{ singular: "unidade", plural: "unidades" }}
      href={href}
      pageSizeOptions={[10, 20, 50]}
    />
  );
}

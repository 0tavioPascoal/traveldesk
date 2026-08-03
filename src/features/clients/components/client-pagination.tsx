import { ListPagination } from "@/components/list-page/list-pagination";
import type { ClientFilters } from "@/features/clients/types/client";

export function ClientPagination({
  organizationSlug,
  filters,
  total,
  totalPages,
  pageSize,
}: {
  organizationSlug: string;
  filters: ClientFilters;
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
    return `/app/${organizationSlug}/cadastros/clientes${query ? `?${query}` : ""}`;
  }

  return (
    <ListPagination
      ariaLabel="Paginação de clientes"
      page={filters.page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      itemName={{ singular: "cliente", plural: "clientes" }}
      href={href}
      pageSizeOptions={[10, 20, 50]}
    />
  );
}

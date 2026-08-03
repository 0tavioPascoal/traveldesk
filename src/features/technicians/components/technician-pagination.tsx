import { ListPagination } from "@/components/list-page/list-pagination";
import type { TechnicianFilters } from "@/features/technicians/types/technician";

export function TechnicianPagination({ organizationSlug, filters, total, totalPages, pageSize }: { organizationSlug: string; filters: TechnicianFilters; total: number; totalPages: number; pageSize: number }) {
  function href(page: number) {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.skillId) params.set("skillId", filters.skillId);
    if (filters.canDrive !== "all") params.set("canDrive", filters.canDrive);
    if (filters.baseState) params.set("baseState", filters.baseState);
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return `/app/${organizationSlug}/cadastros/tecnicos${query ? `?${query}` : ""}`;
  }
  return <ListPagination ariaLabel="Paginação de técnicos" page={filters.page} totalPages={totalPages} total={total} pageSize={pageSize} itemName={{ singular: "técnico", plural: "técnicos" }} href={href} pageSizeOptions={[10, 20, 50]} />;
}

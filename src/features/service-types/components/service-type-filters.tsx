import { CatalogFilters } from "@/components/catalog/catalog-filters";
import type { ServiceTypeFilters as ServiceTypeFilterValues } from "@/features/service-types/types/service-type";

type ServiceTypeFiltersProps = {
  organizationSlug: string;
  filters: ServiceTypeFilterValues;
};

export function ServiceTypeFilters({
  organizationSlug,
  filters,
}: ServiceTypeFiltersProps) {
  const listPath = `/app/${organizationSlug}/cadastros/tipos-atendimento`;

  return <CatalogFilters path={listPath} query={filters.query} status={filters.status} placeholder="Pesquisar tipo de atendimento..." />;
}

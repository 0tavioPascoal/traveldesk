import { CatalogFilters } from "@/components/catalog/catalog-filters";
import type { UnavailabilityTypeFilters as FilterValues } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityTypeFilters({
  path,
  filters,
}: {
  path: string;
  filters: FilterValues;
}) {
  return <CatalogFilters path={path} query={filters.query} status={filters.status} placeholder="Buscar tipo de indisponibilidade..." />;
}

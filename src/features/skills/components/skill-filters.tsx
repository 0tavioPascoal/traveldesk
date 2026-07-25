import { CatalogFilters } from "@/components/catalog/catalog-filters";
import type { SkillFilters as SkillFilterValues } from "@/features/skills/types/skill";

type SkillFiltersProps = {
  organizationSlug: string;
  filters: SkillFilterValues;
};

export function SkillFilters({
  organizationSlug,
  filters,
}: SkillFiltersProps) {
  const listPath = `/app/${organizationSlug}/cadastros/especialidades`;

  return <CatalogFilters path={listPath} query={filters.query} status={filters.status} placeholder="Buscar especialidade..." />;
}

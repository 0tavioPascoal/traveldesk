import { ListTabs } from "@/components/list-page/list-tabs";
import type { UnavailabilityFilters, UnavailabilityResourceFilter } from "@/features/unavailabilities/types/unavailability";

const options: Array<{ value: UnavailabilityResourceFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "technicians", label: "Técnicos" },
  { value: "vehicles", label: "Veículos" },
];

export function UnavailabilityResourceTabs({
  organizationSlug,
  filters,
}: {
  organizationSlug: string;
  filters: UnavailabilityFilters;
}) {
  const path = `/app/${organizationSlug}/planejamento/indisponibilidades`;
  function href(resource: UnavailabilityResourceFilter) {
    const params = new URLSearchParams();
    if (resource !== "all") params.set("resource", resource);
    if (filters.query) params.set("query", filters.query);
    if (filters.startsOn) params.set("startsOn", filters.startsOn);
    if (filters.endsOn) params.set("endsOn", filters.endsOn);
    if (filters.temporalStatus !== "all") params.set("temporalStatus", filters.temporalStatus);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    const query = params.toString();
    return `${path}${query ? `?${query}` : ""}`;
  }

  return (
    <ListTabs
      label="Tipo de recurso"
      items={options.map((option) => ({
        href: href(option.value),
        label: option.label,
        active: filters.resource === option.value,
      }))}
    />
  );
}

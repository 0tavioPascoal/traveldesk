import Link from "next/link";

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
    const query = params.toString();
    return `${path}${query ? `?${query}` : ""}`;
  }

  return (
    <nav aria-label="Tipo de recurso" className="inline-flex w-full rounded-xl border border-border bg-card p-1 sm:w-auto">
      {options.map((option) => (
        <Link
          key={option.value}
          href={href(option.value)}
          aria-current={filters.resource === option.value ? "page" : undefined}
          className={filters.resource === option.value
            ? "flex min-h-10 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground sm:flex-none"
            : "flex min-h-10 flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground sm:flex-none"}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}

import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { InlineAlert } from "@/components/ui/inline-alert";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { UnavailabilityCreateAction } from "@/features/unavailabilities/components/unavailability-create-action";
import { UnavailabilityFilters } from "@/features/unavailabilities/components/unavailability-filters";
import { UnavailabilityList } from "@/features/unavailabilities/components/unavailability-list";
import { UnavailabilityPagination } from "@/features/unavailabilities/components/unavailability-pagination";
import { UnavailabilityResourceTabs } from "@/features/unavailabilities/components/unavailability-resource-tabs";
import { listTechnicianUnavailabilities } from "@/features/unavailabilities/queries/list-technician-unavailabilities";
import { listTechnicianUnavailabilityResources } from "@/features/unavailabilities/queries/list-technician-unavailability-resources";
import { listTechnicianUnavailabilityTypes } from "@/features/unavailabilities/queries/list-technician-unavailability-types";
import { listVehicleUnavailabilities } from "@/features/unavailabilities/queries/list-vehicle-unavailabilities";
import { listVehicleUnavailabilityResources } from "@/features/unavailabilities/queries/list-vehicle-unavailability-resources";
import { listVehicleUnavailabilityTypes } from "@/features/unavailabilities/queries/list-vehicle-unavailability-types";
import { unavailabilityFilterSchema } from "@/features/unavailabilities/schemas/unavailability-filter-schema";
import type { CentralUnavailabilityListItem, UnavailabilityFilters as FilterValues } from "@/features/unavailabilities/types/unavailability";

type Props = { params: Promise<{ organizationSlug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const PAGE_SIZE = 20;

export default async function UnavailabilitiesPage({ params, searchParams }: Props) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const rawSearchParams = await searchParams;
  const parsedFilters = unavailabilityFilterSchema.parse(rawSearchParams);
  const filters: FilterValues = parsedFilters.resource === "all"
    ? { ...parsedFilters, resourceId: "", unavailabilityTypeId: "" }
    : parsedFilters;
  const referenceTime = new Date().toISOString();
  const typeFilters = { query: "", status: "all" as const };

  let allItems: CentralUnavailabilityListItem[];
  let resources: Awaited<ReturnType<typeof listTechnicianUnavailabilityResources>> = [];
  let types: Awaited<ReturnType<typeof listTechnicianUnavailabilityTypes>> = [];
  if (filters.resource === "all") {
    const [technicians, vehicles] = await Promise.all([
      listTechnicianUnavailabilities(organizationSlug, filters, referenceTime),
      listVehicleUnavailabilities(organizationSlug, filters, referenceTime),
    ]);
    allItems = [
      ...technicians.map((item) => ({ ...item, resourceKind: "technicians" as const })),
      ...vehicles.map((item) => ({ ...item, resourceKind: "vehicles" as const })),
    ];
  } else if (filters.resource === "technicians") {
    const [items, resourceOptions, typeOptions] = await Promise.all([
      listTechnicianUnavailabilities(organizationSlug, filters, referenceTime),
      listTechnicianUnavailabilityResources(organizationSlug),
      listTechnicianUnavailabilityTypes(organizationSlug, typeFilters),
    ]);
    allItems = items.map((item) => ({ ...item, resourceKind: "technicians" as const }));
    resources = resourceOptions;
    types = typeOptions;
  } else {
    const [items, resourceOptions, typeOptions] = await Promise.all([
      listVehicleUnavailabilities(organizationSlug, filters, referenceTime),
      listVehicleUnavailabilityResources(organizationSlug),
      listVehicleUnavailabilityTypes(organizationSlug, typeFilters),
    ]);
    allItems = items.map((item) => ({ ...item, resourceKind: "vehicles" as const }));
    resources = resourceOptions;
    types = typeOptions;
  }
  allItems.sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime());
  const total = allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (filters.page > totalPages && total > 0) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(rawSearchParams)) {
      if (key === "page" || value === undefined) continue;
      params.set(key, Array.isArray(value) ? value[0] ?? "" : value);
    }
    redirect(`${`/app/${organizationSlug}/planejamento/indisponibilidades`}${params.size ? `?${params}` : ""}`);
  }
  const items = allItems.slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE);
  const hasFilters = filters.resource !== "all" || Boolean(filters.query || filters.startsOn || filters.endsOn || filters.resourceId || filters.unavailabilityTypeId || filters.temporalStatus !== "all" || filters.status !== "all");
  const feedback = Array.isArray(rawSearchParams.feedback) ? rawSearchParams.feedback[0] : rawSearchParams.feedback;
  const feedbackMessage = feedback === "created" ? "Indisponibilidade cadastrada com sucesso." : feedback === "updated" ? "Indisponibilidade atualizada com sucesso." : null;

  return <PageContainer className="space-y-6">
    <PageHeader title="Indisponibilidades" description="Gerencie os períodos em que técnicos e veículos não podem ser utilizados nas viagens." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Planejamento" }, { label: "Indisponibilidades" }]} actions={<UnavailabilityCreateAction organizationSlug={organizationSlug} />} />
    {feedbackMessage ? <InlineAlert tone="success">{feedbackMessage}</InlineAlert> : null}
    <UnavailabilityResourceTabs organizationSlug={organizationSlug} filters={filters} />
    <section aria-label="Filtros de indisponibilidades" className="rounded-xl border border-border bg-card p-4 sm:p-5"><UnavailabilityFilters organizationSlug={organizationSlug} filters={filters} resources={resources} types={types} /></section>
    <UnavailabilityList organizationSlug={organizationSlug} items={items} timezone={context.organization.timezone} role={context.membership.role as "admin" | "coordinator"} hasFilters={hasFilters} referenceTime={referenceTime} />
    <UnavailabilityPagination organizationSlug={organizationSlug} filters={filters} total={total} totalPages={totalPages} pageSize={PAGE_SIZE} />
  </PageContainer>;
}

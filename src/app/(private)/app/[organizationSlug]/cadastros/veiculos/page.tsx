import Link from "next/link";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { buttonStyles } from "@/components/ui/button";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { VehicleFilters } from "@/features/vehicles/components/vehicle-filters";
import { VehicleList } from "@/features/vehicles/components/vehicle-list";
import { VehiclePagination } from "@/features/vehicles/components/vehicle-pagination";
import { listVehicles } from "@/features/vehicles/queries/list-vehicles";
import { vehicleFilterSchema } from "@/features/vehicles/schemas/vehicle-filter-schema";
import { dateInTimezone } from "@/features/vehicles/application/vehicle-presentation";

type Props = {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VehiclesPage({ params, searchParams }: Props) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const filters = vehicleFilterSchema.parse(await searchParams);
  const result = await listVehicles(organizationSlug, filters);
  const hasFilters = Boolean(
    filters.query ||
    filters.baseState ||
    filters.activeState !== "all" ||
    filters.operationalStatus !== "all" ||
    filters.minimumCapacity ||
    filters.page > 1,
  );
  const referenceDate = dateInTimezone(new Date(), context.organization.timezone);
  return <PageContainer className="space-y-6"><PageHeader title="Veículos" description="Gerencie a frota, capacidade e disponibilidade para as viagens." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Cadastros" }, { label: "Veículos" }]} actions={<Link href={`/app/${organizationSlug}/cadastros/veiculos/novo`} className={buttonStyles()}>Novo veículo</Link>} /><section aria-label="Filtros de veículos" className="rounded-2xl border border-border bg-card p-4 sm:p-5"><VehicleFilters organizationSlug={organizationSlug} filters={filters} /></section><VehicleList organizationSlug={organizationSlug} vehicles={result.items} timezone={context.organization.timezone} referenceDate={referenceDate} hasFilters={hasFilters} /><VehiclePagination organizationSlug={organizationSlug} filters={filters} total={result.total} totalPages={result.totalPages} pageSize={result.pageSize} /></PageContainer>;
}

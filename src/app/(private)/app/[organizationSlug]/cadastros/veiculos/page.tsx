import Link from "next/link";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { VehicleFilters } from "@/features/vehicles/components/vehicle-filters";
import { VehicleList } from "@/features/vehicles/components/vehicle-list";
import { listVehicles } from "@/features/vehicles/queries/list-vehicles";
import { vehicleFilterSchema } from "@/features/vehicles/schemas/vehicle-filter-schema";

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
  const vehicles = await listVehicles(organizationSlug, filters);
  const hasFilters = Boolean(
    filters.query ||
    filters.baseState ||
    filters.activeState !== "all" ||
    filters.operationalStatus !== "all",
  );
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-7xl space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href={`/app/${organizationSlug}/dashboard`} className="text-sm font-medium text-zinc-600">← Voltar ao dashboard</Link><h1 className="mt-2 text-2xl font-bold">Veículos</h1><p className="mt-1 text-sm text-zinc-600">Gerencie a frota e sua condição operacional.</p></div><Link href={`/app/${organizationSlug}/cadastros/veiculos/novo`} className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white">Novo veículo</Link></header><section className="rounded-xl border border-zinc-200 bg-white p-5"><VehicleFilters organizationSlug={organizationSlug} filters={filters} /></section><VehicleList organizationSlug={organizationSlug} vehicles={vehicles} timezone={context.organization.timezone} hasFilters={hasFilters} /></div></main>;
}

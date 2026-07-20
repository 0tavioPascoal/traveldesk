import Link from "next/link";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { UnavailabilityFilters } from "@/features/unavailabilities/components/unavailability-filters";
import { UnavailabilityList } from "@/features/unavailabilities/components/unavailability-list";
import { UnavailabilityResourceTabs } from "@/features/unavailabilities/components/unavailability-resource-tabs";
import { listTechnicianUnavailabilities } from "@/features/unavailabilities/queries/list-technician-unavailabilities";
import { listTechnicianUnavailabilityResources } from "@/features/unavailabilities/queries/list-technician-unavailability-resources";
import { listTechnicianUnavailabilityTypes } from "@/features/unavailabilities/queries/list-technician-unavailability-types";
import { listVehicleUnavailabilities } from "@/features/unavailabilities/queries/list-vehicle-unavailabilities";
import { listVehicleUnavailabilityResources } from "@/features/unavailabilities/queries/list-vehicle-unavailability-resources";
import { listVehicleUnavailabilityTypes } from "@/features/unavailabilities/queries/list-vehicle-unavailability-types";
import { unavailabilityFilterSchema } from "@/features/unavailabilities/schemas/unavailability-filter-schema";

type Props = {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UnavailabilitiesPage({ params, searchParams }: Props) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const rawSearchParams = await searchParams;
  const filters = unavailabilityFilterSchema.parse(rawSearchParams);
  const isTechnician = filters.resource === "technicians";
  const typeFilters = { query: "", status: "all" as const };
  const [items, resources, types] = isTechnician
    ? await Promise.all([
        listTechnicianUnavailabilities(organizationSlug, filters),
        listTechnicianUnavailabilityResources(organizationSlug),
        listTechnicianUnavailabilityTypes(organizationSlug, typeFilters),
      ])
    : await Promise.all([
        listVehicleUnavailabilities(organizationSlug, filters),
        listVehicleUnavailabilityResources(organizationSlug),
        listVehicleUnavailabilityTypes(organizationSlug, typeFilters),
      ]);
  const hasFilters = Boolean(
    filters.query ||
    filters.startsOn ||
    filters.endsOn ||
    filters.resourceId ||
    filters.unavailabilityTypeId ||
    filters.status !== "all",
  );
  const segment = isTechnician ? "tecnicos" : "veiculos";
  const feedback = rawSearchParams.feedback;
  const feedbackMessage = feedback === "created"
    ? "Indisponibilidade cadastrada com sucesso."
    : feedback === "updated"
      ? "Indisponibilidade atualizada com sucesso."
      : null;

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href={`/app/${organizationSlug}/dashboard`} className="text-sm font-medium text-zinc-600">← Voltar ao dashboard</Link>
            <h1 className="mt-2 text-2xl font-bold">Indisponibilidades</h1>
            <p className="mt-1 text-sm text-zinc-600">Controle os períodos indisponíveis de técnicos e veículos.</p>
          </div>
          <Link href={`/app/${organizationSlug}/planejamento/indisponibilidades/${segment}/nova`} className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white">
            Nova indisponibilidade
          </Link>
        </header>
        {feedbackMessage ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{feedbackMessage}</p> : null}
        <UnavailabilityResourceTabs organizationSlug={organizationSlug} resource={filters.resource} />
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <UnavailabilityFilters organizationSlug={organizationSlug} resource={filters.resource} filters={filters} resources={resources} types={types} />
        </section>
        <UnavailabilityList
          organizationSlug={organizationSlug}
          resource={filters.resource}
          items={items}
          timezone={context.organization.timezone}
          role={context.membership.role as "admin" | "coordinator"}
          hasFilters={hasFilters}
        />
      </div>
    </main>
  );
}

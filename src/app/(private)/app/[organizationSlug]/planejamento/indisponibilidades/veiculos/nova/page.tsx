import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { UnavailabilityForm } from "@/features/unavailabilities/components/unavailability-form";
import { listActiveVehicleUnavailabilityTypes } from "@/features/unavailabilities/queries/list-active-vehicle-unavailability-types";
import { listVehicleUnavailabilityResources } from "@/features/unavailabilities/queries/list-vehicle-unavailability-resources";

export default async function NewVehicleUnavailabilityPage({ params, searchParams }: { params: Promise<{ organizationSlug: string }>; searchParams: Promise<{ vehicleId?: string | string[] }> }) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const [resources, types] = await Promise.all([
    listVehicleUnavailabilityResources(organizationSlug, true),
    listActiveVehicleUnavailabilityTypes(organizationSlug),
  ]);
  const query = await searchParams;
  const requestedVehicleId = Array.isArray(query.vehicleId) ? query.vehicleId[0] : query.vehicleId;
  const initialVehicleId = resources.some((resource) => resource.id === requestedVehicleId) ? requestedVehicleId ?? "" : "";
  return <PageContainer className="max-w-5xl space-y-6"><PageHeader title="Nova indisponibilidade de veículo" description={`O período usa o fuso ${context.organization.timezone}, segue a semântica [início, fim) e não altera a condição operacional.`} breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Indisponibilidades", href: `/app/${organizationSlug}/planejamento/indisponibilidades?resource=vehicles` }, { label: "Nova indisponibilidade" }]} /><section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><UnavailabilityForm organizationSlug={organizationSlug} resource="vehicles" timezone={context.organization.timezone} resources={resources} types={types} initialValues={{ resourceId: initialVehicleId, unavailabilityTypeId: "", startsAt: "", endsAt: "", allDay: false, reason: "", notes: "" }} /></section></PageContainer>;
}

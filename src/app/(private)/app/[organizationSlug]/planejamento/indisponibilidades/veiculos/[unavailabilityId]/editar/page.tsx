import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { notFound } from "next/navigation";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { formatUnavailabilityPeriodForForm } from "@/features/unavailabilities/application/normalize-unavailability-period";
import { UnavailabilityForm } from "@/features/unavailabilities/components/unavailability-form";
import { getVehicleUnavailabilityById } from "@/features/unavailabilities/queries/get-vehicle-unavailability-by-id";
import { listActiveVehicleUnavailabilityTypes } from "@/features/unavailabilities/queries/list-active-vehicle-unavailability-types";
import { listVehicleUnavailabilityResources } from "@/features/unavailabilities/queries/list-vehicle-unavailability-resources";
import { unavailabilityIdSchema } from "@/features/unavailabilities/schemas/unavailability-schema";

function hasEnded(endsAt: string) {
  return new Date(endsAt).getTime() <= Date.now();
}

export default async function EditVehicleUnavailabilityPage({ params }: { params: Promise<{ organizationSlug: string; unavailabilityId: string }> }) {
  const { organizationSlug, unavailabilityId } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  if (!unavailabilityIdSchema.safeParse(unavailabilityId).success) notFound();
  const item = await getVehicleUnavailabilityById(organizationSlug, unavailabilityId);
  if (!item || (context.membership.role !== "admin" && hasEnded(item.endsAt))) notFound();
  const [resources, types] = await Promise.all([
    listVehicleUnavailabilityResources(organizationSlug, true),
    listActiveVehicleUnavailabilityTypes(organizationSlug),
  ]);
  if (!resources.some((resource) => resource.id === item.resourceId)) resources.push({ id: item.resourceId, label: `${item.resourceName} — ${item.resourceDescription ?? ""}`, active: false });
  if (!types.some((type) => type.id === item.typeId)) types.push({ id: item.typeId, name: item.typeName, active: false });
  const period = formatUnavailabilityPeriodForForm(item.startsAt, item.endsAt, item.allDay, context.organization.timezone);
  const path = `/app/${organizationSlug}/planejamento/indisponibilidades?resource=vehicles`;
  return <FormPageContainer><PageHeader title="Editar indisponibilidade de veículo" description="A indisponibilidade mantém a semântica [início, fim) e não altera automaticamente a condição operacional." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Indisponibilidades", href: path }, { label: "Editar indisponibilidade" }]} /><UnavailabilityForm organizationSlug={organizationSlug} resource="vehicles" timezone={context.organization.timezone} resources={resources} types={types} unavailabilityId={unavailabilityId} initialValues={{ resourceId: item.resourceId, unavailabilityTypeId: item.typeId, startsAt: period.startsAt, endsAt: period.endsAt, allDay: item.allDay, reason: item.reason ?? "", notes: item.notes ?? "" }} /></FormPageContainer>;
}

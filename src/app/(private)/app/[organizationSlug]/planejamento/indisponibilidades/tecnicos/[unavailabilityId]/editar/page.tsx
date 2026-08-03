import { notFound } from "next/navigation";

import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { formatUnavailabilityPeriodForForm } from "@/features/unavailabilities/application/normalize-unavailability-period";
import { UnavailabilityForm } from "@/features/unavailabilities/components/unavailability-form";
import { getTechnicianUnavailabilityById } from "@/features/unavailabilities/queries/get-technician-unavailability-by-id";
import { listActiveTechnicianUnavailabilityTypes } from "@/features/unavailabilities/queries/list-active-technician-unavailability-types";
import { listTechnicianUnavailabilityResources } from "@/features/unavailabilities/queries/list-technician-unavailability-resources";
import { unavailabilityIdSchema } from "@/features/unavailabilities/schemas/unavailability-schema";

function hasEnded(endsAt: string) { return new Date(endsAt).getTime() <= Date.now(); }

export default async function EditTechnicianUnavailabilityPage({ params }: { params: Promise<{ organizationSlug: string; unavailabilityId: string }> }) {
  const { organizationSlug, unavailabilityId } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  if (!unavailabilityIdSchema.safeParse(unavailabilityId).success) notFound();
  const item = await getTechnicianUnavailabilityById(organizationSlug, unavailabilityId);
  if (!item || (context.membership.role !== "admin" && hasEnded(item.endsAt))) notFound();
  const [resources, types] = await Promise.all([listTechnicianUnavailabilityResources(organizationSlug, true), listActiveTechnicianUnavailabilityTypes(organizationSlug)]);
  if (!resources.some((resource) => resource.id === item.resourceId)) resources.push({ id: item.resourceId, label: item.resourceName, active: false });
  if (!types.some((type) => type.id === item.typeId)) types.push({ id: item.typeId, name: item.typeName, active: false });
  const period = formatUnavailabilityPeriodForForm(item.startsAt, item.endsAt, item.allDay, context.organization.timezone);
  const path = `/app/${organizationSlug}/planejamento/indisponibilidades?resource=technicians`;
  return <FormPageContainer><PageHeader title="Editar indisponibilidade de técnico" description="Períodos encerrados somente podem ser corrigidos por administradores." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Indisponibilidades", href: path }, { label: "Editar indisponibilidade" }]} /><UnavailabilityForm organizationSlug={organizationSlug} resource="technicians" timezone={context.organization.timezone} resources={resources} types={types} unavailabilityId={unavailabilityId} initialValues={{ resourceId: item.resourceId, unavailabilityTypeId: item.typeId, startsAt: period.startsAt, endsAt: period.endsAt, allDay: item.allDay, reason: item.reason ?? "", notes: item.notes ?? "" }} /></FormPageContainer>;
}

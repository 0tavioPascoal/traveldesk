import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { UnavailabilityForm } from "@/features/unavailabilities/components/unavailability-form";
import { listActiveTechnicianUnavailabilityTypes } from "@/features/unavailabilities/queries/list-active-technician-unavailability-types";
import { listTechnicianUnavailabilityResources } from "@/features/unavailabilities/queries/list-technician-unavailability-resources";

export default async function NewTechnicianUnavailabilityPage({ params, searchParams }: { params: Promise<{ organizationSlug: string }>; searchParams: Promise<{ technicianId?: string | string[] }> }) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const [resources, types, query] = await Promise.all([listTechnicianUnavailabilityResources(organizationSlug, true), listActiveTechnicianUnavailabilityTypes(organizationSlug), searchParams]);
  const requestedId = Array.isArray(query.technicianId) ? query.technicianId[0] : query.technicianId;
  const initialId = resources.some((resource) => resource.id === requestedId) ? requestedId ?? "" : "";
  return <FormPageContainer><PageHeader title="Nova indisponibilidade de técnico" description={`Os horários usam o fuso ${context.organization.timezone} e o período final é exclusivo.`} breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Indisponibilidades", href: `/app/${organizationSlug}/planejamento/indisponibilidades?resource=technicians` }, { label: "Nova indisponibilidade" }]} /><UnavailabilityForm organizationSlug={organizationSlug} resource="technicians" timezone={context.organization.timezone} resources={resources} types={types} initialValues={{ resourceId: initialId, unavailabilityTypeId: "", startsAt: "", endsAt: "", allDay: false, reason: "", notes: "" }} /></FormPageContainer>;
}

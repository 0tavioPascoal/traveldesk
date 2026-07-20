import Link from "next/link";
import { notFound } from "next/navigation";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { formatUnavailabilityPeriodForForm } from "@/features/unavailabilities/application/normalize-unavailability-period";
import { UnavailabilityForm } from "@/features/unavailabilities/components/unavailability-form";
import { getTechnicianUnavailabilityById } from "@/features/unavailabilities/queries/get-technician-unavailability-by-id";
import { listActiveTechnicianUnavailabilityTypes } from "@/features/unavailabilities/queries/list-active-technician-unavailability-types";
import { listTechnicianUnavailabilityResources } from "@/features/unavailabilities/queries/list-technician-unavailability-resources";
import { unavailabilityIdSchema } from "@/features/unavailabilities/schemas/unavailability-schema";

function hasEnded(endsAt: string) {
  return new Date(endsAt).getTime() <= Date.now();
}

export default async function EditTechnicianUnavailabilityPage({ params }: { params: Promise<{ organizationSlug: string; unavailabilityId: string }> }) {
  const { organizationSlug, unavailabilityId } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  if (!unavailabilityIdSchema.safeParse(unavailabilityId).success) notFound();
  const item = await getTechnicianUnavailabilityById(organizationSlug, unavailabilityId);
  if (!item || (context.membership.role !== "admin" && hasEnded(item.endsAt))) notFound();
  const [resources, types] = await Promise.all([
    listTechnicianUnavailabilityResources(organizationSlug, true),
    listActiveTechnicianUnavailabilityTypes(organizationSlug),
  ]);
  if (!resources.some((resource) => resource.id === item.resourceId)) resources.push({ id: item.resourceId, label: item.resourceName, active: false });
  if (!types.some((type) => type.id === item.typeId)) types.push({ id: item.typeId, name: item.typeName, active: false });
  const period = formatUnavailabilityPeriodForForm(item.startsAt, item.endsAt, item.allDay, context.organization.timezone);
  const path = `/app/${organizationSlug}/planejamento/indisponibilidades?resource=technicians`;
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-5xl"><Link href={path} className="text-sm font-medium text-zinc-600">← Voltar às indisponibilidades</Link><div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold">Editar indisponibilidade de técnico</h1><p className="mt-1 text-sm text-zinc-600">Períodos encerrados somente podem ser corrigidos por administradores.</p><div className="mt-6"><UnavailabilityForm organizationSlug={organizationSlug} resource="technicians" timezone={context.organization.timezone} resources={resources} types={types} unavailabilityId={unavailabilityId} initialValues={{ resourceId: item.resourceId, unavailabilityTypeId: item.typeId, startsAt: period.startsAt, endsAt: period.endsAt, allDay: item.allDay, reason: item.reason ?? "", notes: item.notes ?? "" }} /></div></div></div></main>;
}

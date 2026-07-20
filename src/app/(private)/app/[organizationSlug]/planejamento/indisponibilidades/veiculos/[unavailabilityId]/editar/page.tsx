import Link from "next/link";
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
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-5xl"><Link href={path} className="text-sm font-medium text-zinc-600">← Voltar às indisponibilidades</Link><div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold">Editar indisponibilidade de veículo</h1><p className="mt-1 text-sm text-zinc-600">A indisponibilidade não altera automaticamente a condição operacional.</p><div className="mt-6"><UnavailabilityForm organizationSlug={organizationSlug} resource="vehicles" timezone={context.organization.timezone} resources={resources} types={types} unavailabilityId={unavailabilityId} initialValues={{ resourceId: item.resourceId, unavailabilityTypeId: item.typeId, startsAt: period.startsAt, endsAt: period.endsAt, allDay: item.allDay, reason: item.reason ?? "", notes: item.notes ?? "" }} /></div></div></div></main>;
}

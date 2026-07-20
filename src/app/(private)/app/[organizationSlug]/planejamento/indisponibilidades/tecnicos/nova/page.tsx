import Link from "next/link";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { UnavailabilityForm } from "@/features/unavailabilities/components/unavailability-form";
import { listActiveTechnicianUnavailabilityTypes } from "@/features/unavailabilities/queries/list-active-technician-unavailability-types";
import { listTechnicianUnavailabilityResources } from "@/features/unavailabilities/queries/list-technician-unavailability-resources";

export default async function NewTechnicianUnavailabilityPage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const [resources, types] = await Promise.all([
    listTechnicianUnavailabilityResources(organizationSlug, true),
    listActiveTechnicianUnavailabilityTypes(organizationSlug),
  ]);
  const listPath = `/app/${organizationSlug}/planejamento/indisponibilidades?resource=technicians`;
  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-5xl">
      <Link href={listPath} className="text-sm font-medium text-zinc-600">← Voltar às indisponibilidades</Link>
      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Nova indisponibilidade de técnico</h1>
        <p className="mt-1 text-sm text-zinc-600">O período usa o fuso {context.organization.timezone} e o horário final é exclusivo.</p>
        <div className="mt-6"><UnavailabilityForm organizationSlug={organizationSlug} resource="technicians" timezone={context.organization.timezone} resources={resources} types={types} initialValues={{ resourceId: "", unavailabilityTypeId: "", startsAt: "", endsAt: "", allDay: false, reason: "", notes: "" }} /></div>
      </div>
    </div></main>
  );
}

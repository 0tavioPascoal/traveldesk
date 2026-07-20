import Link from "next/link";
import { notFound } from "next/navigation";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { UnavailabilityTypeForm } from "@/features/unavailabilities/components/unavailability-type-form";
import { getVehicleUnavailabilityTypeById } from "@/features/unavailabilities/queries/get-vehicle-unavailability-type-by-id";
import { unavailabilityTypeIdSchema } from "@/features/unavailabilities/schemas/unavailability-type-schema";

export default async function EditVehicleUnavailabilityTypePage({ params }: { params: Promise<{ organizationSlug: string; typeId: string }> }) {
  const { organizationSlug, typeId } = await params;
  await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  if (!unavailabilityTypeIdSchema.safeParse(typeId).success) notFound();
  const item = await getVehicleUnavailabilityTypeById(organizationSlug, typeId);
  if (!item) notFound();
  const path = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/veiculos`;
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-3xl"><Link href={path} className="text-sm font-medium text-zinc-600">← Voltar aos tipos</Link><div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold">Editar tipo para veículo</h1><div className="mt-6"><UnavailabilityTypeForm organizationSlug={organizationSlug} resource="vehicles" typeId={typeId} initialValues={{ name: item.name, description: item.description ?? "", active: item.active }} /></div></div></div></main>;
}

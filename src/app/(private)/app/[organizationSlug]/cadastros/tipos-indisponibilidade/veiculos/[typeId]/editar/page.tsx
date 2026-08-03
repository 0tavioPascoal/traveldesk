import { notFound } from "next/navigation";

import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
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
  return <FormPageContainer><PageHeader title="Editar tipo para veículo" description="Atualize o motivo e sua disponibilidade para novos períodos de veículos." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Tipos para veículos", href: path }, { label: "Editar" }]} /><UnavailabilityTypeForm organizationSlug={organizationSlug} resource="vehicles" typeId={typeId} initialValues={{ name: item.name, description: item.description ?? "", active: item.active }} /></FormPageContainer>;
}

import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { VehicleForm } from "@/features/vehicles/components/vehicle-form";

export default async function NewVehiclePage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  return <FormPageContainer><PageHeader title="Novo veículo" description="Cadastre a identificação, capacidade e dados operacionais do veículo." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Veículos", href: `/app/${organizationSlug}/cadastros/veiculos` }, { label: "Novo veículo" }]} /><VehicleForm organizationSlug={organizationSlug} timezone={context.organization.timezone} role={context.membership.role as "admin" | "coordinator"} currentMileage={null} initialValues={{ plate: "", brand: "", model: "", manufactureYear: "", modelYear: "", passengerCapacity: "", baseCity: "", baseState: "", currentMileage: "", operationalStatus: "available", licensingExpiresAt: "", maintenanceDueAt: "", notes: "" }} /></FormPageContainer>;
}

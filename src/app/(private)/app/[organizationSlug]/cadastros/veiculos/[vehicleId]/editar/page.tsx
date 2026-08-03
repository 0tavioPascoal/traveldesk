import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { VehicleForm } from "@/features/vehicles/components/vehicle-form";
import { getVehicleById } from "@/features/vehicles/queries/get-vehicle-by-id";
import { formatVehiclePlate } from "@/features/vehicles/application/vehicle-presentation";

export default async function EditVehiclePage({ params }: { params: Promise<{ organizationSlug: string; vehicleId: string }> }) {
  const { organizationSlug, vehicleId } = await params;
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const vehicle = await getVehicleById(organizationSlug, vehicleId);
  const plate = formatVehiclePlate(vehicle.plate);
  return <FormPageContainer><PageHeader title="Editar veículo" eyebrow={`${plate} · ${vehicle.brand} ${vehicle.model}`} description="Atualize os dados cadastrais e operacionais do veículo." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Veículos", href: `/app/${organizationSlug}/cadastros/veiculos` }, { label: plate, href: `/app/${organizationSlug}/cadastros/veiculos/${vehicleId}` }, { label: "Editar" }]} /><VehicleForm organizationSlug={organizationSlug} timezone={context.organization.timezone} vehicleId={vehicleId} role={context.membership.role as "admin" | "coordinator"} currentMileage={vehicle.current_mileage} initialValues={{ plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, manufactureYear: vehicle.manufacture_year === null ? "" : String(vehicle.manufacture_year), modelYear: vehicle.model_year === null ? "" : String(vehicle.model_year), passengerCapacity: String(vehicle.passenger_capacity), baseCity: vehicle.base_city, baseState: vehicle.base_state, currentMileage: vehicle.current_mileage === null ? "" : String(vehicle.current_mileage), operationalStatus: vehicle.operational_status, licensingExpiresAt: vehicle.licensing_expires_at ?? "", maintenanceDueAt: vehicle.maintenance_due_at ?? "", notes: vehicle.notes ?? "" }} /></FormPageContainer>;
}

import Link from "next/link";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { VehicleForm } from "@/features/vehicles/components/vehicle-form";
import { getVehicleById } from "@/features/vehicles/queries/get-vehicle-by-id";

export default async function EditVehiclePage({ params }: { params: Promise<{ organizationSlug: string; vehicleId: string }> }) {
  const { organizationSlug, vehicleId } = await params;
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const vehicle = await getVehicleById(organizationSlug, vehicleId);
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-5xl"><Link href={`/app/${organizationSlug}/cadastros/veiculos/${vehicleId}`} className="text-sm font-medium text-zinc-600">← Voltar ao veículo</Link><div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold">Editar veículo</h1><div className="mt-6"><VehicleForm organizationSlug={organizationSlug} vehicleId={vehicleId} role={context.membership.role as "admin" | "coordinator"} currentMileage={vehicle.current_mileage} initialValues={{ plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, manufactureYear: vehicle.manufacture_year === null ? "" : String(vehicle.manufacture_year), modelYear: vehicle.model_year === null ? "" : String(vehicle.model_year), passengerCapacity: String(vehicle.passenger_capacity), baseCity: vehicle.base_city, baseState: vehicle.base_state, currentMileage: vehicle.current_mileage === null ? "" : String(vehicle.current_mileage), operationalStatus: vehicle.operational_status, licensingExpiresAt: vehicle.licensing_expires_at ?? "", maintenanceDueAt: vehicle.maintenance_due_at ?? "", notes: vehicle.notes ?? "" }} /></div></div></div></main>;
}

import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripVehicleAssignment } from "@/features/trips/types/trip-transport";
import { createClient } from "@/lib/supabase/server";

export async function getTripVehicleAssignment(
  organizationSlug: string,
  tripId: string,
): Promise<TripVehicleAssignment | null> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const assignmentResult = await supabase
    .from("trip_vehicle_assignments")
    .select("id, vehicle_id, driver_technician_id, notes, occupancy_starts_at, occupancy_ends_at, blocks_schedule")
    .eq("organization_id", context.organization.id)
    .eq("trip_id", tripId)
    .maybeSingle();
  if (assignmentResult.error) throw new Error("Não foi possível carregar o transporte da viagem.");
  if (!assignmentResult.data) return null;

  const [vehicleResult, driverResult] = await Promise.all([
    supabase.from("vehicles")
      .select("id, plate, brand, model, passenger_capacity, base_city, base_state, operational_status, active")
      .eq("organization_id", context.organization.id)
      .eq("id", assignmentResult.data.vehicle_id)
      .maybeSingle(),
    supabase.from("technicians")
      .select("id, name, active, driver_license_category, driver_license_expires_at")
      .eq("organization_id", context.organization.id)
      .eq("id", assignmentResult.data.driver_technician_id)
      .maybeSingle(),
  ]);
  if (vehicleResult.error || driverResult.error || !vehicleResult.data || !driverResult.data) {
    throw new Error("Não foi possível carregar os recursos do transporte.");
  }
  return {
    id: assignmentResult.data.id,
    vehicleId: vehicleResult.data.id,
    plate: vehicleResult.data.plate,
    brand: vehicleResult.data.brand,
    model: vehicleResult.data.model,
    passengerCapacity: vehicleResult.data.passenger_capacity,
    vehicleBaseCity: vehicleResult.data.base_city,
    vehicleBaseState: vehicleResult.data.base_state,
    operationalStatus: vehicleResult.data.operational_status,
    vehicleActive: vehicleResult.data.active,
    driverTechnicianId: driverResult.data.id,
    driverName: driverResult.data.name,
    driverActive: driverResult.data.active,
    driverLicenseCategory: driverResult.data.driver_license_category,
    driverLicenseExpiresAt: driverResult.data.driver_license_expires_at,
    notes: assignmentResult.data.notes,
    occupancyStartsAt: assignmentResult.data.occupancy_starts_at,
    occupancyEndsAt: assignmentResult.data.occupancy_ends_at,
    blocksSchedule: assignmentResult.data.blocks_schedule,
  };
}

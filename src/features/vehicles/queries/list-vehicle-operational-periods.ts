import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { VehicleOperationalPeriods } from "@/features/vehicles/types/vehicle";
import { createClient } from "@/lib/supabase/server";

export async function listVehicleOperationalPeriods(
  organizationSlug: string,
  vehicleIds: string[],
): Promise<Map<string, VehicleOperationalPeriods>> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const result = new Map<string, VehicleOperationalPeriods>();
  if (vehicleIds.length === 0) return result;
  const now = new Date().toISOString();
  const supabase = await createClient();
  const [unavailabilityResult, reservationResult] = await Promise.all([
    supabase.from("vehicle_unavailabilities")
      .select("id, vehicle_id, starts_at, ends_at, all_day, reason, vehicle_unavailability_types!inner(name)")
      .eq("organization_id", context.organization.id).eq("active", true)
      .in("vehicle_id", vehicleIds).gt("ends_at", now).order("starts_at"),
    supabase.from("trip_vehicle_assignments")
      .select("vehicle_id, trip_id, occupancy_starts_at, occupancy_ends_at, trips!inner(code, title, client_name_snapshot, status)")
      .eq("organization_id", context.organization.id).eq("blocks_schedule", true)
      .in("vehicle_id", vehicleIds).gt("occupancy_ends_at", now).order("occupancy_starts_at"),
  ]);
  if (unavailabilityResult.error || reservationResult.error) {
    throw new Error("Não foi possível carregar a disponibilidade dos veículos.");
  }
  for (const item of unavailabilityResult.data) {
    const values = result.get(item.vehicle_id) ?? { unavailabilities: [], reservations: [] };
    values.unavailabilities.push({ id: item.id, typeName: item.vehicle_unavailability_types.name, startsAt: item.starts_at, endsAt: item.ends_at, allDay: item.all_day, reason: item.reason });
    result.set(item.vehicle_id, values);
  }
  for (const item of reservationResult.data) {
    if (!item.occupancy_starts_at || !item.occupancy_ends_at) continue;
    const values = result.get(item.vehicle_id) ?? { unavailabilities: [], reservations: [] };
    values.reservations.push({ tripId: item.trip_id, code: item.trips.code, title: item.trips.title, clientName: item.trips.client_name_snapshot, status: item.trips.status, startsAt: item.occupancy_starts_at, endsAt: item.occupancy_ends_at });
    result.set(item.vehicle_id, values);
  }
  return result;
}

import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripVehicleCandidate, VehicleAvailabilityReason } from "@/features/trips/types/trip-transport";
import { createClient } from "@/lib/supabase/server";

export async function listAvailableVehiclesForTrip(
  organizationSlug: string,
  tripId: string,
): Promise<{ periodRequired: boolean; items: TripVehicleCandidate[] }> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const [tripResult, teamResult, assignmentResult, vehiclesResult] = await Promise.all([
    supabase.from("trips").select("travel_starts_at, travel_ends_at")
      .eq("organization_id", context.organization.id).eq("id", tripId).maybeSingle(),
    supabase.from("trip_technicians").select("id", { count: "exact", head: true })
      .eq("organization_id", context.organization.id).eq("trip_id", tripId),
    supabase.from("trip_vehicle_assignments").select("vehicle_id")
      .eq("organization_id", context.organization.id).eq("trip_id", tripId).maybeSingle(),
    supabase.from("vehicles")
      .select("id, plate, brand, model, passenger_capacity, base_city, base_state, operational_status, active")
      .eq("organization_id", context.organization.id).order("brand").order("model"),
  ]);
  if (tripResult.error || teamResult.error || assignmentResult.error || vehiclesResult.error) {
    throw new Error("Não foi possível carregar os veículos da viagem.");
  }
  if (!tripResult.data) throw new Error("A viagem não foi encontrada.");
  const startsAt = tripResult.data.travel_starts_at;
  const endsAt = tripResult.data.travel_ends_at;
  const teamSize = teamResult.count ?? 0;

  const [unavailabilitiesResult, conflictsResult] = startsAt && endsAt
    ? await Promise.all([
        supabase.from("vehicle_unavailabilities").select("vehicle_id")
          .eq("organization_id", context.organization.id).eq("active", true)
          .lt("starts_at", endsAt).gt("ends_at", startsAt),
        supabase.from("trip_vehicle_assignments").select("vehicle_id")
          .eq("organization_id", context.organization.id).eq("blocks_schedule", true)
          .neq("trip_id", tripId).lt("occupancy_starts_at", endsAt).gt("occupancy_ends_at", startsAt),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];
  if (unavailabilitiesResult.error || conflictsResult.error) {
    throw new Error("Não foi possível verificar a disponibilidade dos veículos.");
  }
  const unavailable = new Set(unavailabilitiesResult.data.map((item) => item.vehicle_id));
  const conflicts = new Set(conflictsResult.data.map((item) => item.vehicle_id));
  const assignedVehicleId = assignmentResult.data?.vehicle_id ?? null;
  const items = vehiclesResult.data.map((vehicle) => {
    let reason: VehicleAvailabilityReason | null = null;
    if (!vehicle.active) reason = "inactive";
    else if (vehicle.operational_status === "maintenance") reason = "maintenance";
    else if (vehicle.operational_status === "blocked") reason = "blocked";
    else if (unavailable.has(vehicle.id)) reason = "unavailability";
    else if (conflicts.has(vehicle.id)) reason = "trip_conflict";
    else if (teamSize > vehicle.passenger_capacity) reason = "capacity";
    return {
      id: vehicle.id,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      passengerCapacity: vehicle.passenger_capacity,
      baseCity: vehicle.base_city,
      baseState: vehicle.base_state,
      group: reason ? "unavailable" as const : "available" as const,
      unavailableReason: reason,
      currentlyAssigned: vehicle.id === assignedVehicleId,
    };
  }).sort((left, right) => Number(Boolean(left.unavailableReason)) - Number(Boolean(right.unavailableReason))
    || left.brand.localeCompare(right.brand, "pt-BR") || left.model.localeCompare(right.model, "pt-BR"));
  return { periodRequired: !startsAt || !endsAt, items };
}

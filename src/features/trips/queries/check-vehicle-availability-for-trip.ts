import "server-only";

import { listAvailableVehiclesForTrip } from "@/features/trips/queries/list-available-vehicles-for-trip";

export async function checkVehicleAvailabilityForTrip(
  organizationSlug: string,
  tripId: string,
  vehicleId: string,
) {
  const result = await listAvailableVehiclesForTrip(organizationSlug, tripId);
  const vehicle = result.items.find((item) => item.id === vehicleId) ?? null;
  return { available: !result.periodRequired && vehicle?.group === "available", vehicle };
}

import "server-only";

import { getTripVehicleAssignment } from "@/features/trips/queries/get-trip-vehicle-assignment";
import { listAvailableVehiclesForTrip } from "@/features/trips/queries/list-available-vehicles-for-trip";
import { listEligibleDriversForTrip } from "@/features/trips/queries/list-eligible-drivers-for-trip";
import { validateExistingTripTransport } from "@/features/trips/queries/validate-existing-trip-transport";
import type { TripTransportSummary } from "@/features/trips/types/trip-transport";

export async function getTripTransportSummary(
  organizationSlug: string,
  tripId: string,
): Promise<TripTransportSummary> {
  const [assignment, vehicleResult, driverResult] = await Promise.all([
    getTripVehicleAssignment(organizationSlug, tripId),
    listAvailableVehiclesForTrip(organizationSlug, tripId),
    listEligibleDriversForTrip(organizationSlug, tripId),
  ]);
  const periodRequired = vehicleResult.periodRequired || driverResult.periodRequired;
  const validation = validateExistingTripTransport(
    assignment, vehicleResult.items, driverResult.items, periodRequired,
  );
  return {
    assignment,
    vehicles: vehicleResult.items,
    drivers: driverResult.items,
    teamSize: driverResult.items.length,
    periodRequired,
    assignmentValid: validation.valid,
    assignmentIssues: validation.issues,
  };
}

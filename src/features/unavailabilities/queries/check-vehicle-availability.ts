import "server-only";

import { listVehicleUnavailabilitiesByPeriod } from "@/features/unavailabilities/queries/list-vehicle-unavailabilities-by-period";
import type { AvailabilityResult } from "@/features/unavailabilities/types/unavailability";

export async function checkVehicleAvailability(
  organizationSlug: string,
  vehicleId: string,
  startsAt: string,
  endsAt: string,
  excludeId?: string,
): Promise<AvailabilityResult> {
  const conflicts = await listVehicleUnavailabilitiesByPeriod(
    organizationSlug, vehicleId, startsAt, endsAt, excludeId,
  );
  return { available: conflicts.length === 0, conflicts };
}

import "server-only";

import { listTechnicianUnavailabilitiesByPeriod } from "@/features/unavailabilities/queries/list-technician-unavailabilities-by-period";
import type { AvailabilityResult } from "@/features/unavailabilities/types/unavailability";

export async function checkTechnicianAvailability(
  organizationSlug: string,
  technicianId: string,
  startsAt: string,
  endsAt: string,
  excludeId?: string,
): Promise<AvailabilityResult> {
  const conflicts = await listTechnicianUnavailabilitiesByPeriod(
    organizationSlug, technicianId, startsAt, endsAt, excludeId,
  );
  return { available: conflicts.length === 0, conflicts };
}

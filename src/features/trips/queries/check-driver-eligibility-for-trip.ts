import "server-only";

import { listEligibleDriversForTrip } from "@/features/trips/queries/list-eligible-drivers-for-trip";

export async function checkDriverEligibilityForTrip(
  organizationSlug: string,
  tripId: string,
  technicianId: string,
) {
  const result = await listEligibleDriversForTrip(organizationSlug, tripId);
  const driver = result.items.find((item) => item.technicianId === technicianId) ?? null;
  return { eligible: !result.periodRequired && driver?.group === "eligible", driver };
}

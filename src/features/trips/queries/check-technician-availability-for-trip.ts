import "server-only";

import { listAvailableTechniciansForTrip } from "@/features/trips/queries/list-available-technicians-for-trip";

export async function checkTechnicianAvailabilityForTrip(
  organizationSlug: string,
  tripId: string,
  technicianId: string,
) {
  const candidates = await listAvailableTechniciansForTrip(organizationSlug, tripId);
  const technician = candidates.items.find((item) => item.id === technicianId);
  return {
    available: Boolean(technician && technician.group !== "unavailable"),
    reason: technician?.unavailableReason ?? (candidates.periodRequired ? "period_required" as const : "not_found" as const),
  };
}

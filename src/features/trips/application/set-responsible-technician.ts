import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { mapTripStaffingError } from "@/features/trips/application/map-trip-staffing-error";
import type { TripStaffingMutationResult } from "@/features/trips/types/trip-staffing";
import { createClient } from "@/lib/supabase/server";

export async function setResponsibleTechnician(
  organizationSlug: string,
  tripId: string,
  technicianId: string | null,
): Promise<TripStaffingMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("set_trip_responsible_technician", {
    p_organization_id: context.organization.id,
    p_trip_id: tripId,
    p_technician_id: technicianId,
  });
  if (error) return mapTripStaffingError(error);
  return data ? { success: true } : { success: false, reason: "unexpected" };
}

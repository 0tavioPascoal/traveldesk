import "server-only";

import { mapTripOvernightError } from "@/features/trips/application/map-trip-overnight-error";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripOvernightMutationResult } from "@/features/trips/types/trip-overnight";
import { createClient } from "@/lib/supabase/server";

export async function ensureTripOvernightCalculation(
  organizationSlug: string,
  tripId: string,
): Promise<TripOvernightMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ensure_trip_overnight_calculation", {
    p_organization_id: context.organization.id,
    p_trip_id: tripId,
  });
  if (error) return mapTripOvernightError(error);
  return data ? { success: true } : { success: false, reason: "not_found" };
}

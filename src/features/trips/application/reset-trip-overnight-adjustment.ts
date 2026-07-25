import "server-only";

import { mapTripOvernightError } from "@/features/trips/application/map-trip-overnight-error";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripOvernightMutationResult } from "@/features/trips/types/trip-overnight";
import { createClient } from "@/lib/supabase/server";

export async function resetTripOvernightAdjustment(
  organizationSlug: string,
  tripId: string,
  expectedRevision: number,
): Promise<TripOvernightMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reset_trip_overnight_adjustment", {
    p_organization_id: context.organization.id,
    p_trip_id: tripId,
    p_expected_revision: expectedRevision,
  });
  if (error) return mapTripOvernightError(error);
  return data ? { success: true } : { success: false, reason: "not_found" };
}

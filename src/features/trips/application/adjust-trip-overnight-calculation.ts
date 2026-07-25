import "server-only";

import { mapTripOvernightError } from "@/features/trips/application/map-trip-overnight-error";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripOvernightAdjustmentInput } from "@/features/trips/schemas/trip-overnight-schema";
import type { TripOvernightMutationResult } from "@/features/trips/types/trip-overnight";
import { createClient } from "@/lib/supabase/server";

export async function adjustTripOvernightCalculation(
  organizationSlug: string,
  input: TripOvernightAdjustmentInput,
): Promise<TripOvernightMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("adjust_trip_overnights", {
    p_organization_id: context.organization.id,
    p_trip_id: input.tripId,
    p_adjusted_overnights: input.adjustedOvernights,
    p_adjustment_reason: input.adjustmentReason,
    p_expected_revision: input.expectedRevision,
  });
  if (error) return mapTripOvernightError(error);
  return data ? { success: true } : { success: false, reason: "not_found" };
}

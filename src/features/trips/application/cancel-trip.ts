import "server-only";

import { mapTripError } from "@/features/trips/application/map-trip-error";
import type { TripMutationResult } from "@/features/trips/types/trip";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function cancelTrip(organizationSlug: string, tripId: string, reason: string): Promise<TripMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cancel_trip", {
    p_organization_id: context.organization.id,
    p_trip_id: tripId,
    p_cancellation_reason: reason.trim(),
  });
  if (error) return mapTripError(error);
  return data ? { success: true, tripId } : { success: false, reason: "invalid_transition" };
}

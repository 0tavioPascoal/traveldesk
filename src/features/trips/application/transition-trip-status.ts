import "server-only";

import { requireOrganizationMember } from "@/features/organizations/application/require-organization-member";
import { mapTripExecutionError } from "@/features/trips/application/map-trip-execution-error";
import type { TripExecutionResult, TripOperationalStatus } from "@/features/trips/types/trip-execution";
import { createClient } from "@/lib/supabase/server";

export async function transitionTripStatus(
  organizationSlug: string,
  tripId: string,
  targetStatus: TripOperationalStatus,
  note: string | null,
): Promise<TripExecutionResult> {
  const context = await requireOrganizationMember(organizationSlug);
  if (!["admin", "coordinator", "technician"].includes(context.membership.role)) {
    return { success: false, reason: "not_authorized" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("transition_trip_status", {
    p_organization_id: context.organization.id,
    p_trip_id: tripId,
    p_target_status: targetStatus,
    p_note: note,
  });
  if (error) return mapTripExecutionError(error);
  return data ? { success: true } : { success: false, reason: "status_changed" };
}

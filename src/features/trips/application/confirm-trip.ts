import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { mapTripConfirmationError } from "@/features/trips/application/map-trip-confirmation-error";
import type { TripConfirmationResult } from "@/features/trips/types/trip-confirmation";
import { createClient } from "@/lib/supabase/server";

export async function confirmTrip(
  organizationSlug: string,
  tripId: string,
): Promise<TripConfirmationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_trip", {
    p_organization_id: context.organization.id,
    p_trip_id: tripId,
  });
  if (error) return mapTripConfirmationError(error);
  return data ? { success: true } : { success: false, reason: "not_planned" };
}

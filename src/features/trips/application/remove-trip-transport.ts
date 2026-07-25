import "server-only";

import { mapTripTransportError } from "@/features/trips/application/map-trip-transport-error";
import type { TripTransportMutationResult } from "@/features/trips/types/trip-transport";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function removeTripTransport(
  organizationSlug: string,
  tripId: string,
): Promise<TripTransportMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("remove_trip_vehicle_assignment", {
    p_organization_id: context.organization.id,
    p_trip_id: tripId,
  });
  if (error) return mapTripTransportError(error);
  return data ? { success: true } : { success: false, reason: "not_found" };
}

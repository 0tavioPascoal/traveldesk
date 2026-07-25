import "server-only";

import { mapTripTransportError } from "@/features/trips/application/map-trip-transport-error";
import type { TripTransportInput } from "@/features/trips/schemas/trip-transport-schema";
import type { TripTransportMutationResult } from "@/features/trips/types/trip-transport";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function saveTripTransport(
  organizationSlug: string,
  input: TripTransportInput,
): Promise<TripTransportMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("assign_trip_vehicle_and_driver", {
    p_organization_id: context.organization.id,
    p_trip_id: input.tripId,
    p_vehicle_id: input.vehicleId,
    p_driver_technician_id: input.driverTechnicianId,
    p_notes: input.notes,
  });
  if (error) return mapTripTransportError(error);
  return data ? { success: true } : { success: false, reason: "unexpected" };
}

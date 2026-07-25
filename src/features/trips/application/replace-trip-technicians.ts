import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { mapTripStaffingError } from "@/features/trips/application/map-trip-staffing-error";
import type { TripTechniciansInput } from "@/features/trips/schemas/trip-technicians-schema";
import type { TripStaffingMutationResult } from "@/features/trips/types/trip-staffing";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export async function replaceTripTechnicians(
  organizationSlug: string,
  input: TripTechniciansInput,
): Promise<TripStaffingMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const payload: Json = input.technicians.map((item) => ({
    technician_id: item.technicianId,
    is_responsible: item.isResponsible,
    notes: item.notes || null,
  }));
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("replace_trip_technicians", {
    p_organization_id: context.organization.id,
    p_trip_id: input.tripId,
    p_technicians: payload,
  });
  if (error) return mapTripStaffingError(error);
  return data ? { success: true } : { success: false, reason: "unexpected" };
}
